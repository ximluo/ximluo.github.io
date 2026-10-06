/* The About page: bio, address and links, then education and experience. */
import { AB } from "../data/about"
import { EXPERIENCE } from "../data/experience"
import type { Experience } from "../data/types"

function Roll({
  title,
  items,
}: {
  title: string
  items: readonly Pick<Experience, "org" | "role" | "year">[]
}) {
  if (!items.length) return null
  return (
    <section className="ab-exp">
      <h3>{title}</h3>
      <ul>
        {items.map((e, i) => (
          <li key={i}>
            <span className="y">{e.year}</span>
            <b>{e.org}</b>
            <em>{e.role}</em>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function AboutPage() {
  const by = (k: Experience["kind"]) => EXPERIENCE.filter((e) => e.kind === k)
  const experience = [...by("work"), ...by("teach"), ...by("lead")]
  return (
    <div className="pj-wrap is-page">
      <div className="ab-roll">
        <header className="ab-head">
          <h2 className="ab-title">About</h2>
          <p className="ab-bio">{AB.bio}</p>
          <p className="ab-mail">
            <a href={`mailto:${AB.email}`}>{AB.email}</a>
          </p>
          <p className="ab-ln">
            {AB.links.map(([t, href]) => (
              <a
                key={t}
                href={href}
                target={/^https?:/.test(href) ? "_blank" : undefined}
                rel={/^https?:/.test(href) ? "noopener" : undefined}
              >
                {t}
              </a>
            ))}
          </p>
        </header>
        <div className="ab-grid">
          <Roll title="Education" items={AB.education} />
          <Roll title="Experience" items={experience} />
        </div>
        <p className="ab-fin mono">Fin</p>
      </div>
    </div>
  )
}
