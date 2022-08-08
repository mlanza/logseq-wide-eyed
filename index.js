const config = {
  "buttons": {
    "todos": {
      "refreshRate": 5,
      "hits": ["text-decoration: underline;", ""],
      "styles": [{
        "tooltip": "Without closed tasks",
        "char": "\\e6ed",
        "hits": "div#main-content-container div[data-refs-self*='\"done\"'], div#main-content-container div[data-refs-self*='\"canceled\"']",
        "style": "div[data-refs-self*='\"done\"']:not(:focus-within), div[data-refs-self*='\"canceled\"']:not(:focus-within) {display: none;}"
      },{
        "tooltip": "With closed tasks",
        "char": "\\e600",
        "hits": "div#main-content-container div[data-refs-self*='\"done\"'], div#main-content-container div[data-refs-self*='\"canceled\"']",
        "style": "div#main-content-container:hover div[data-refs-self*='\"done\"'] span.inline, div#main-content-container:hover div[data-refs-self*='\"canceled\"'] span.inline {text-decoration: underline wavy;}"
      }]
    }
  }
};

const state = {};

async function getPage(){
  let tries = 30;
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

function setButton(key, char, tooltip, status){
  top.document.body.setAttribute(`data-sc-${key}`, status || "");
  logseq.App.registerUIItem('toolbar', {
    key: `button-${key}`,
    template: `
    <a class="button eye" title="${tooltip || ""}" data-key="${key}" data-on-click="cycle">
      <i class="ti ti-home"></i>
    </a>
    `,
  });
  logseq.provideStyle({
    key: `icon-${key}`,
    style: `
    .eye[data-key="${key}"] i:before {
      content: "${char}";
    }`
  });
}

async function cycle(el) {
  const key = el.dataset.key,
        st  = state[key],
        btn = config.buttons[key];
  st.idx = btn.styles[st.idx + 1] ? st.idx + 1 : 0;
  await refresh(key, btn, st);
}

async function refresh(key, btn, state){
  const {char, tooltip, status, style, hits} = btn.styles[state.idx];
  state.hits = hits;
  style && logseq.provideStyle({
    key: `active-${key}`,
    style
  });
  setButton(key, char, tooltip, status);
  detectHits(key, btn, state);
}

function detectHits(key, config, state){
  if (state.hits) {
    const el = top.document.querySelector(state.hits);
    const style = el ? config.hits[0] : config.hits[1];
    logseq.provideStyle({
      key: `hits-${key}`,
      style: `
      .eye[data-key="${key}"] i:before {
        ${style};
      }`
    });
  }
}

function refreshHits(key, config, state){
  (config.refreshRate || 0) > 0 && setInterval(function(){
    detectHits(key, config, state);
  }, config.refreshRate * 1000);
}

function createModel(){
  return {refresh, cycle};
}

async function main(){
  Object.assign(config, logseq.settings);

  logseq.provideStyle({
    style: `
    @import url("https://at.alicdn.com/t/font_2409735_haugsknp36e.css");
    .eye {
      font-size: 20px;
    }
    .eye i:before {
      font-family: iconfont !important;
      font-style: normal;
      color: var(--ls-primary-text-color);
    }`
  });

  for (let key in config.buttons) {
    const btn = config.buttons[key];
    if (btn.disabled) {
      delete config.buttons[key];
    } else {
      const {char, tooltip, status} = btn.styles[0];
      state[key] = {idx: 0};
      setButton(key, char, tooltip, status);
    }
  }

  await getPage();

  for (let key in config.buttons) {
    const btn = config.buttons[key],
          st  = state[key];
    await refresh(key, btn, st);
    refreshHits(key, btn, st);
  }

  logseq.App.onRouteChanged(async function(e){
    await getPage();
    for (let key in config.buttons) {
      refresh(key, config.buttons[key], state[key]);
    }
  });
}

logseq.ready(createModel(), main).catch(console.error.bind(console));
