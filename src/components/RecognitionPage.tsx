/* Recognition: highlights first, then each type, then the school years folded under Earlier. Items link to the
   projects or pieces they belong to. */
import { Fragment, type MouseEvent } from "react"
import { RECOGNITION } from "../data/recognition"
import { RECOGNITION_TYPES, sortedByYear } from "../data/pages"
import type { Recognition } from "../data/types"
import { artPath, openPath } from "../paths"
import { useReel } from "../reel/context"

function WorkLink({ id, r }: { id: string; r: Recognition }) {
  const { cat, actions } = useReel()
  const w = cat.get(id)
  if (!w) return null
  /* the linked work; when the work is titled after the award itself (PetSteps), show its sub instead */
  const t = "sub" in w && w.sub && w.title === r.title ? w.sub : w.title
  const stop = (f: () => void) => (e: MouseEvent) => {
    e.preventDefault()
    f()
  }
  return w.kind === "art" ? (
    <a href={artPath(id)} data-art={id} onClick={stop(() => void actions.openArt(id))}>
      {t}
    </a>
  ) : (
    <a href={openPath(id)} data-go={id} onClick={stop(() => void actions.projGo(id))}>
      {t}
    </a>
  )
}

function Row({ r, withType }: { r: Recognition; withType?: boolean }) {
  const tail = [withType ? r.type : null, r.org, r.detail].filter(Boolean)
  const links = r.works
  return (
    <li>
      <span className="y">{r.year}</span>
      <b>
        {r.link ? (
          <a href={r.link} target="_blank" rel="noopener">
            {r.title}
          </a>
        ) : (
          r.title
        )}
      </b>
      <em>
        {tail.join(" · ")}
        {links.length > 0 && (
          <>
            {" "}
            <span className="rc-w">
              →{" "}
              {links.map((id, i) => (
                <Fragment key={id}>
                  {i > 0 && ", "}
                  <WorkLink id={id} r={r} />
                </Fragment>
              ))}
            </span>
          </>
        )}
      </em>
    </li>
  )
}

function Group({
  title,
  items,
  withType,
}: {
  title: string
  items: Recognition[]
  withType?: boolean
}) {
  if (!items.length) return null
  return (
    <section className="ab-exp rc-g">
      <h3>{title}</h3>
      <ul>
        {sortedByYear(items).map((r, i) => (
          <Row key={i} r={r} withType={withType} />
        ))}
      </ul>
    </section>
  )
}

/** The groups: the highlights first (under `firstTitle`), each type, then the school years folded under Earlier. */
export function RecognitionRoll({ firstTitle = "Highlights" }: { firstTitle?: string }) {
  const top = RECOGNITION.filter((r) => r.top)
  const rest = RECOGNITION.filter((r) => !r.top && !r.early)
  const early = RECOGNITION.filter((r) => r.early && !r.top)
  return (
    <>
      <Group title={firstTitle} items={top} />
      {RECOGNITION_TYPES.map(([type, title]) => (
        <Group key={type} title={title} items={rest.filter((r) => r.type === type)} />
      ))}
      {early.length > 0 && (
        <details className="rc-old" open>
          <summary className="mono">
            Earlier <i>{early.length}</i>
          </summary>
          <Group title="School years" items={early} withType />
        </details>
      )}
    </>
  )
}

export function RecognitionPage() {
  return (
    <div className="pj-wrap is-page">
      <div className="ab-roll">
        <header className="ab-head">
          <h2 className="ab-title long">Recognition</h2>
          <p className="ab-bio">Awards, exhibitions and fellowships.</p>
        </header>
        <div className="ab-grid">
          <RecognitionRoll />
        </div>
        <p className="ab-fin mono">Fin</p>
      </div>
    </div>
  )
}
