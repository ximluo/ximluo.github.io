import React from "react"
import Footer from "../../components/Footer"
import { aboutContent, type AboutRow, type AboutTextPart } from "../../data/about"
import awardsData from "../../data/awards"
import {
  CONTENT_THEME_TOKENS,
  HOME_THEME_TOKENS,
  type ThemeType,
} from "../../theme/tokens"
import { trackExternalLinkClick } from "../../utils/analytics"
import "./About.css"

interface AboutProps {
  theme: ThemeType
}

function renderTextParts(parts: AboutTextPart[], uiRegion: string) {
  return parts.map((part, index) => {
    if (typeof part === "string") {
      return <React.Fragment key={`${uiRegion}-${index}`}>{part}</React.Fragment>
    }

    const isEmail = part.href.startsWith("mailto:")

    return (
      <a
        key={`${uiRegion}-${part.text}-${index}`}
        className={isEmail ? "about-email-link" : "about-link"}
        href={part.href}
        target={isEmail ? undefined : "_blank"}
        rel={isEmail ? undefined : "noopener noreferrer"}
        onClick={
          part.analyticsId
            ? () => {
                trackExternalLinkClick({
                  linkId: part.analyticsId ?? part.text,
                  href: part.href,
                  uiRegion,
                })
              }
            : undefined
        }
      >
        {part.text}
      </a>
    )
  })
}

interface AboutRowLineProps {
  row: AboutRow
  className?: string
}

const AboutRowLine: React.FC<AboutRowLineProps> = ({ row, className = "" }) => {
  const title = row.href ? (
    <a className="about-link" href={row.href} target="_blank" rel="noopener noreferrer">
      {row.title}
    </a>
  ) : (
    row.title
  )

  return (
    <div className={`about-row ${className}`.trim()}>
      <span>
        {title}
        {row.detail && <span> / {row.detail}</span>}
      </span>
      <time>{row.year}</time>
    </div>
  )
}

interface AboutRowsSectionProps {
  id: string
  title: string
  rows: AboutRow[]
}

const AboutRowsSection: React.FC<AboutRowsSectionProps> = ({ id, title, rows }) => (
  <section
    className="about-detail-section about-detail-section--mobile-inline-years"
    aria-labelledby={id}
  >
    <h2 id={id} className="about-section-title">
      {title}
    </h2>
    {rows.map((row) => (
      <AboutRowLine key={`${title}-${row.title}-${row.year}`} row={row} />
    ))}
  </section>
)

const About: React.FC<AboutProps> = ({ theme }) => {
  const colors = CONTENT_THEME_TOKENS[theme]
  const homeColors = HOME_THEME_TOKENS[theme]

  return (
    <div
      className="about-container"
      style={{
        ["--about-text" as string]: colors["--color-text"],
        ["--about-link" as string]: homeColors["--link-color"],
        ["--about-border" as string]: colors["--border-color"],
        ["--about-button-border" as string]: colors["--button-bg-light"],
        ["--about-button-bg" as string]: colors["--button-bg"],
        ["--about-button-text" as string]: colors["--button-text"],
      }}
    >
      <main className="about-shell">
        <div className="about-content">
          <section className="about-bio" aria-label="About Ximing Luo">
            <h1 className="about-title">{aboutContent.title}</h1>

            <p className="about-paragraph about-paragraph--intro">
              {renderTextParts(aboutContent.intro, "about_intro")}
            </p>

            <p className="about-paragraph about-paragraph--contact">
              {renderTextParts(aboutContent.contact, "about_bio")}
            </p>

            <AboutRowsSection
              id="about-experience-title"
              title="Experience"
              rows={aboutContent.experience}
            />

            <AboutRowsSection
              id="about-activities-title"
              title="Activities"
              rows={aboutContent.activities}
            />

            <section className="about-detail-section" aria-labelledby="about-awards-title">
              <h2 id="about-awards-title" className="about-section-title">
                Awards &amp; Recognition
              </h2>
              <div className="about-awards-sections">
                {Object.entries(awardsData).map(([section, awards]) => (
                  <section key={section} className="about-awards-group">
                    <h3 className="about-subsection-title">{section}</h3>
                    {awards.map((award) => {
                      const hasLink = Boolean(award.link?.trim())

                      return (
                        <AboutRowLine
                          key={`${section}-${award.title}-${award.year}`}
                          className="about-award-row"
                          row={{
                            title: award.title,
                            detail: award.description,
                            year: award.year,
                            href: hasLink ? award.link : undefined,
                          }}
                        />
                      )
                    })}
                  </section>
                ))}
              </div>
            </section>
          </section>
        </div>
      </main>

      <Footer theme={theme} />
    </div>
  )
}

export default About
