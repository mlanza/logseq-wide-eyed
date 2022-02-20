const config = {};

const state = {
  ids: [],
  status: "closed",
  edits: []
}

function getIds(blocks, xs){
  let ys = xs || [];
  for(let block of blocks){
    if (config.match.test(block.content)) {
      ys = ys.concat([block.uuid]);
    }
    if (block.children && block.children.length) {
      ys = getIds(block.children, ys);
    }
  }
  return ys;
}

async function getJournals(){
  return logseq.DB.q("(between -90d today)");
}

function getPage(){
  let tries = 20;
  return new Promise(function(resolve, reject){
    const iv = setInterval(async function(){
      const page = await logseq.Editor.getCurrentPage();
      if (page || tries <= 0) {
        clearInterval(iv);
        resolve(page);
      }
      tries--;
      if (tries < 0) {
        clearInterval(iv);
        reject(page);
      }
    }, 500);
  });
}

async function getPageBlockRefs(name){
  const blocks = await logseq.DB.datascriptQuery(`
    [:find (pull ?block [*])
    :where
    [?block :block/page ?p]
    [?block :block/refs ?ref-page]
    [?ref-page :block/name "${name}"]]`);
  return blocks ? blocks.flat().map(function(b){
    return {...b, uuid: b.uuid.$uuid$}
  }) : [];
}

function getPagesBlocksAndRefs(page){
  let tries = 20;
  return new Promise(function(resolve, reject){
    const iv = setInterval(async function(){
      const [pageBlocks, refBlocks] = [await logseq.Editor.getPageBlocksTree(page.name), await getPageBlockRefs(page.name)];
      const blocks = (pageBlocks || []).concat(refBlocks || []);
      if (blocks) {
        clearInterval(iv);
        resolve(blocks);
      }
      tries--;
      if (tries < 0){
        clearInterval(iv);
        reject(page);
      }
    }, 500);
  });
}

function onPageChanges(refreshRate){
  const callbacks = [];
  setInterval(async function(){
    state.edits.unshift(await logseq.Editor.getCurrentPage());
    while (state.edits.length > 2) {
      state.edits.pop();
    }
    const [current, prior] = state.edits;
    if (current?.name === prior?.name && current?.updatedAt !== prior?.updatedAt) {
      for(callback of callbacks){
        callback(current);
      }
    }
  }, refreshRate * 1000);
  return function subscribe(callback){
    callbacks.push(callback);
  }
}

function refreshStyle(blocks){
  state.ids = blocks ? getIds(blocks) : [];
  model.toggle(null);
}

function createModel(){
  return {
    toggle(src) {
      if (src){
        state.status = state.status == "closed" ? "opened" : "closed";
      }
      const closed = (state.ids.length ? state.ids.map(function(id){
        return `div[blockid="${id}"]`;
      }).join(", ") : "#wide-eyed") + " " + (state.status === "closed" ? `{${config.closed}}` : "{}");
      const opened = (state.ids.length ? state.ids.map(function(id){
        return `div#main-content-container:hover div[blockid="${id}"] div.flex-1 span.inline`;
      }).join(", ") : "#wide-eyed") + " " + `{${config.opened}}`;

      const style = [closed, opened].join("\n ");
      const klass = ["button", state.status, state.ids.length ? "hits" : "empty"].join(" ");
      logseq.App.registerUIItem('toolbar', {
        key: 'toggle',
        template: `
        <a id="eye" class="${klass}" data-on-click="toggle">
          <i></i>
        </a>
        `,
      });
      logseq.provideStyle({
        key: 'selection',
        style
      });
    }
  }
}

async function main () {
  Object.assign(config, {
    refreshRate: logseq.settings.refreshRate || 5,
    status: logseq.settings.status || "closed",
    match: new RegExp(logseq.settings.match || "(^DONE|^CANCELED) "),
    closed: logseq.settings.closed || "display: none;",
    opened: logseq.settings.opened || "text-decoration: underline wavy;"
  });

  const onPageChanged = config.refreshRate > 0 ? onPageChanges(config.refreshRate) : function(){};

  state.status = config.status;

  logseq.provideStyle(`
    @import url("https://at.alicdn.com/t/font_2409735_haugsknp36e.css");
    #eye {
      padding-bottom: 15px;
    }
    #eye i:before {
      content: "\\e6ed";
      font-family: iconfont !important;
      font-size: 22px;
    }
    #eye.closed i:before {
      content: "\\e600";
    }
    #eye.hits i:before {
      text-decoration: underline;
    }`);

  onPageChanged(async function(page){
    refreshStyle(await (page ? getPagesBlocksAndRefs(page) : getJournals()));
  });

  logseq.App.onRouteChanged(async function(e){
    if (["/all-journals", "/"].includes(e.path)) {
      const blocks = await getJournals();
    } else {
      const page = await getPage();
      const blocks = await getPagesBlocksAndRefs(page);
      refreshStyle(blocks);
    }
  });
}

const model = createModel();

logseq.ready(model, main).catch(console.error.bind(console));
