import type React from "react"
import { useState } from "react"
import AwardsModal from "../../components/AwardsModal"
import Footer from "../../components/Footer"
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

const About: React.FC<AboutProps> = ({ theme }) => {
  const [showAwards, setShowAwards] = useState(false)
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
            <h1 className="about-title">Hi, I'm Ximing!</h1>

            <p className="about-paragraph about-paragraph--intro">
              I'm based at UPenn, studying Computer Science (
              <a
                className="about-link"
                href="http://cg.cis.upenn.edu/dmd.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Digital Media Design
              </a>
              ) and Economics. I build software, interfaces, and immersive tools across mobile,
              graphics, XR, and visual systems.
            </p>

            <p className="about-paragraph">Outside of classes and building I'm:</p>
            <ul className="about-list" aria-label="Highlights">
              <li>
                Instructor for iOS Programming{" "}
                <a
                  className="about-link"
                  href="https://www.seas.upenn.edu/~cis1951/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  (CIS 1951)
                </a>{" "}
                @ Penn
              </li>
              <li>
                President of{" "}
                <a
                  className="about-link"
                  href="https://wics.cis.upenn.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Women in Computer Science
                </a>
              </li>
              <li>
                Developer at{" "}
                <a
                  className="about-link"
                  href="https://pennlabs.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Penn Labs
                </a>{" "}
                and{" "}
                <a
                  className="about-link"
                  href="https://pennspark.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Penn Spark
                </a>
              </li>
              <li>
                FemmeHacks Director and{" "}
                <a
                  className="about-link"
                  href="https://snfpaideia.upenn.edu/fellowships/fellowship-information/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  SNF Paideia Fellow
                </a>
              </li>
            </ul>

            <p className="about-paragraph about-paragraph--contact">
              Say hello at{" "}
              <a
                className="about-email-link"
                href="mailto:ximluo@upenn.edu"
                onClick={() => {
                  trackExternalLinkClick({
                    linkId: "email",
                    href: "mailto:ximluo@upenn.edu",
                    uiRegion: "about_bio",
                  })
                }}
              >
                ximluo@upenn.edu
              </a>
              . My work has been recognized by{" "}
              <a
                className="about-link"
                href="https://www.adobe.com/creativecloud/buy/students.html?"
                target="_blank"
                rel="noopener noreferrer"
              >
                Adobe
              </a>{" "}
              and{" "}
              <button
                className="about-inline-link-button"
                type="button"
                onClick={() => setShowAwards(true)}
              >
                other awards
              </button>
              .
            </p>

            <section className="about-detail-section" aria-labelledby="about-experience-title">
              <h2 id="about-experience-title" className="about-section-title">
                Experience
              </h2>
              <div className="about-row">
                <span>
                  Apple <span>/ Incoming</span>
                </span>
                <time>2026</time>
              </div>
              <div className="about-row">
                <span>
                  Apollo Global Management <span>/ Software Engineer</span>
                </span>
                <time>Prev</time>
              </div>
              <div className="about-row">
                <span>
                  Penn Labs <span>/ Developer</span>
                </span>
                <time>Penn</time>
              </div>
              <div className="about-row">
                <span>
                  Penn Spark <span>/ Developer</span>
                </span>
                <time>Penn</time>
              </div>
              <div className="about-row">
                <span>
                  CIS 1951 <span>/ iOS Programming Instructor</span>
                </span>
                <time>Penn</time>
              </div>
            </section>

            <section className="about-detail-section" aria-labelledby="about-education-title">
              <h2 id="about-education-title" className="about-section-title">
                Education
              </h2>
              <div className="about-row">
                <span>
                  University of Pennsylvania <span>/ Computer Science DMD + Economics</span>
                </span>
                <time>2027</time>
              </div>
              <div className="about-row">
                <span>
                  SNF Paideia <span>/ Fellow</span>
                </span>
                <time>Penn</time>
              </div>
              <div className="about-row">
                <span>
                  CIS 5120 and CIS 5600 <span>/ Previous TA</span>
                </span>
                <time>Penn</time>
              </div>
            </section>
          </section>

        </div>
      </main>

      <Footer theme={theme} />

      {showAwards && <AwardsModal onClose={() => setShowAwards(false)} theme={theme} />}
    </div>
  )
}

export default About
