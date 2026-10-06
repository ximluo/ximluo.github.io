import { createRoot } from "react-dom/client"
import "./styles/fonts.css"
import "./styles/project.css"
import "./styles/core.css"
import "./styles/style.css"
import "./styles/phantomwall.css"
import { App } from "./App"
import { catalog } from "./data/catalog"
import { TOUCH } from "./env"
import { createDom } from "./reel/dom"
import { createReel, initialState } from "./reel/createReel"
import { ReelCtx } from "./reel/context"
import { readRoute } from "./routing"
import { createStore } from "./store"

const route = readRoute()
const store = createStore(initialState(route))
const dom = createDom()
const reel = createReel(store, dom, route)

if (TOUCH) document.body.classList.add("touch")

/* no StrictMode: its doubled effects would create and destroy the WebGL wall and the canvas effects twice */
createRoot(document.getElementById("root")!).render(
  <ReelCtx.Provider value={{ store, dom, actions: reel.actions, cat: catalog, route }}>
    <App start={reel.start} stop={reel.destroy} />
  </ReelCtx.Provider>,
)
