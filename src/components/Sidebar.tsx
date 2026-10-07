import { useDomRef } from "../reel/context"
import { ListUI } from "./ListUI"

export function Sidebar() {
  return (
    <aside id="side" aria-label="All projects" ref={useDomRef("side")}>
      <button className="sd-grab" aria-label="Drag to open the work list" data-hot="">
        <i></i>
      </button>
      <ListUI />
    </aside>
  )
}
