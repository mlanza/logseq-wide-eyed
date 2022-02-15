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

function refreshStyle(blocks){
  state.ids = blocks ? getIds(blocks) : [];
  model.toggle(null);
}

/* Logseq would be better served to relay `on("page:blocks:loaded")` and `on("journals:loaded")` events.
   The data is being loaded and rendered by the app.  Why not announce it to interested listeners?
*/
function getBlocks(){
  let tries = 0;
  return new Promise(async function(resolve, reject){
    const iid = setInterval(async function(){
      const [blocks, pages] = await Promise.all([logseq.Editor.getCurrentPageBlocksTree(), getJournals()]);
      const contents = [].concat(blocks || []).concat(pages || []);
      if (contents.length) {
        resolve(contents);
        clearInterval(iid);
      }
      if (tries > 30){
        resolve([]);
        clearInterval(iid);
      }
      tries++
    }, 500);
  })
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

  /* `onRouteChanged` is great for reacting to changing routes, but why not trigger this on the initial app load and on a refresh?
     Without some hook, there is no way to know when the data has been posted and is available to the likes of `getCurrentPageBlocksTree`.  It seems wasteful to rely on `setInterval` polling to determine this.
     As both pages and journal entries are top-level primitives why shouldn't both be supported equally? That is, I can get page blocks loaded to the main UI (e.g. `getCurrentPageBlocksTree`) but what about `getCurrentPageJournals` or `onJournalsLoaded`?
  */
  logseq.App.onRouteChanged(async function(e){
    const blocks = e.path == "/all-journals" ? getJournals() : logseq.Editor.getCurrentPageBlocksTree();
    refreshStyle(await blocks);
  });

  refreshStyle(await getBlocks());
}

const model = createModel();

logseq.ready(model, main).catch(console.error.bind(console));
