const config = {};

const state = {
  ids: [],
  status: "closed"
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

function getBlocks(path){
  async function load(resolve, reject, tries){
    const blocks = await (["/all-journals", "/"].includes(path) ? getJournals() : logseq.Editor.getCurrentPageBlocksTree());
    if (blocks && blocks.length) {
      resolve(blocks);
    } else if (tries > 0){
      setTimeout(function(){
        load(resolve, reject, tries - 1);
      }, 500);
    } else {
      resolve([]);
    }
  }

  return new Promise(async function(resolve, reject){
    load(resolve, reject, 20);
  });
}

function refreshStyle(blocks){
  state.ids = blocks ? getIds(blocks) : [];
  model.toggle(null);
}

function createModel(){
  return {
    hover(){
      //TODO
    },
    leave(){
      //TODO
    },
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

      /* Why should Logseq omit the data-on-mouseenter, data-on-mouseleave hooks? */
      logseq.App.registerUIItem('toolbar', {
        key: 'wide-eyed-toggle',
        template: `
        <a id="eye" class="${klass}" data-on-click="toggle" data-on-mouseenter="hover" data-on-mouseleave="leave">
          <i></i>
        </a>
        `,
      });
      logseq.provideStyle({
        key: 'wide-eyed-selection',
        style
      });
    }
  }
}

async function main () {
  Object.assign(config, {
    status: logseq.settings.status || "closed",
    match: new RegExp(logseq.settings.match || "(^DONE|^CANCELED) "),
    closed: logseq.settings.closed || "display: none;",
    opened: logseq.settings.opened || "text-decoration: underline wavy;"
  });

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

  logseq.App.onRouteChanged(async function(e){
    refreshStyle(await getBlocks(e.path));
  });
}

const model = createModel();

logseq.ready(model, main).catch(console.error.bind(console));
