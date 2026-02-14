import React from "react"
import { AWARDS_THEME_TOKENS, type ThemeType } from "../theme/tokens"
interface AwardsModalProps {
  onClose: () => void;
  theme: ThemeType;
}

const AwardsModal: React.FC<AwardsModalProps> = ({ onClose, theme }) => {
  const themes = AWARDS_THEME_TOKENS;

  // Awards data organized by sections
  const awardsData = {
    "HIGHLIGHTS": [
      {
        title: "Adobe Digital Edge Awards Winner",
        year: "2024",
        description: "App design featured at Adobe MAX 2024 Conference",
        link: "https://www.behance.net/gallery/205694787/Computer-Science-Pennsylvania-USA",
      },
      {
        title: "Stavros Niarchos Foundation Paideia Fellow",
        year: "2024",
        description: "Interdisciplinary fellowship at the University of Pennsylvania",
        link: "https://snfpaideia.upenn.edu/people/ximing-luo/",
      },
      {
        title: "Wharton Directed Reading Program",
        year: "2025",
        description: "One of five projects in selective Wharton research program",
        link: "https://sites.google.com/view/wharton-drp/previous/spring-2025",
      },
      {
        title: "MIT Reality Hacks 2025 Winner",
        year: "2025",
        description: "Best Hardware Hack, Best Use of OpenBCI",
        link: "",
      },
      {
        title: "HackMIT 2024 Winner",
        year: "2024",
        description: "Intersystems Challenge Winner",
        link: "",
      },
      {
        title: "NCWIT Aspirations for Computing Award Winner",
        year: "2023",
        description: "Recognized for excellence and leadership in computing",
        link: "https://www.aspirations.org/people/ximing-l/129010",
      },
    ],
    "SCHOLARSHIPS": [
      {
        title: "Catalent Global Scholarship",
        year: "2024",
        description: "",
        link: "",
      },
      {
        title: "National Merit Scholar",
        year: "2023",
        description: "",
        link: "https://patch.com/maryland/columbia/14-more-national-merit-scholars-howard-county-named-2023",
      },
      {
        title: "Howard County Arts Council's Arts Scholarship",
        year: "2023",
        description: "",
      },
      {
        title: "National Society of High School Scholars Scholarship",
        year: "2022",
        description: "",
        link: "https://www.nshss.org/scholarships/current-winners/ximing-luo/",
      },
      {
        title: "American Visionary Art Museum Compassion in Action Scholarship",
        year: "2022",
        description: "",
      },
      {
        title: "Rho Psi Art Scholarship",
        year: "2022",
        description: "",
      },
    ],
    "EXHIBITIONS": [
      {
        title: "SIGGRAPH Conference SpaceTime Gallery",
        year: "2022",
        description: "International 2022 SpaceTime Competition",
        link: "https://education.siggraph.org/spacetime/gallery/2022",
      },
      {
        title: "The World Art Institute of Youth – Centre for UNESCO",
        year: "2020",
        description: "",
      },
      {
        title: "Museum of Howard County History Exhibition",
        year: "2022",
        description: "",
      },
      {
        title: "32nd Annual HCPSS Senior Show Exhibition",
        year: "2022",
        description: "",
      },
      {
        title: "Celebrating Art National Art Anthologies",
        year: "2020-2022",
        description: "",
        link: "",
      },
    ],
    "AWARDS": [
      {
        title: "American Computer Science League State 1st Place",
        year: "2022",
        description: "",
      },
      {
        title: "Scholastic Art and Writing Awards",
        year: "2023",
        description: "2 Gold Medals, 3 Gold Keys, 8 Silver Key, 8 Honorable Mentions",
        link: "",
      },
      {
        title: "Winner, Illustrators of the Future",
        year: "2022",
        description: " ~$20,000 & Art published in bestselling anthology",
        link: "https://writersofthefuture.com/introducing-the-illustrators-of-the-future-winners-of-2023/",
      },
      {
        title: "1st place, Reflections Visual Arts Outstanding Interpretation",
        year: "2023",
        description: "",
        link: "",
      },
      {
        title: "2nd place, Purdue University National Juried Art Competition",
        year: "2022",
        description: "",
      },
      {
        title: "1st place, Project Bridge Share Your Story Multimedia Contest",
        year: "2022",
        description: "",
      },
      {
        title: "1st place, Space Foundation International Student Art Contest",
        year: "2021",
        description: "",
        link: "",
      },
      {
        title: "1st place, 11th Annual International Children's Art Contest",
        year: "2021",
        description: "",
      },
      {
        title: "Winner, International Creative Karuta Award",
        year: "2020",
        description: "",
      },
    ]
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme === "bunny" ? "rgba(121, 85, 189, 0.4)" : "rgba(8, 34, 163, 0.2)",
          borderRadius: "12px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
          padding: "30px",
          color: theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
          fontFamily: "monospace",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color:
                theme === "bunny"
                  ? themes.bunny["--color-accent-primary"]
                  : themes.water["--color-accent-primary"],
            }}
          >
            AWARDS & RECOGNITION
          </h2>
          <button
            onClick={onClose}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor:
                theme === "bunny" ? themes.bunny["--button-bg-light"] : themes.water["--button-bg-light"],
              color: theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {Object.entries(awardsData).map(([section, awards]) => (
            <div key={section}>
              <h3
                style={{
                  color:
                    theme === "bunny"
                      ? themes.bunny["--color-accent-primary"]
                      : themes.water["--color-accent-primary"],
                  marginBottom: "15px",
                  borderBottom: `1px solid ${theme === "bunny"
                    ? themes.bunny["--border-color"]
                    : themes.water["--border-color"]
                    }`,
                  paddingBottom: "5px",
                }}
              >
                {section}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {awards.map((award, index) => (
                  <div
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      award.link && window.open(award.link, "_blank");
                    }}
                    style={{
                      padding: "15px",
                      borderRadius: "8px",
                      // More opaque block background (0.2)
                      backgroundColor:
                        theme === "bunny" ? "rgba(121, 85, 189, 0.2)" : "rgba(8, 34, 163, 0.1)",
                      cursor: award.link ? "pointer" : "default",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <h4
                        style={{
                          margin: "0 0 8px 0",
                          color:
                            theme === "bunny"
                              ? themes.bunny["--color-accent-primary"]
                              : themes.water["--color-accent-primary"],
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {award.title}
                        {award.link && (
                          <span
                            style={{
                              marginLeft: '6px',
                              fontSize: '14px',
                              verticalAlign: 'middle'
                            }}
                          >
                            ↗️
                          </span>
                        )}
                      </h4>
                      <span style={{ fontSize: "14px", opacity: 0.8 }}>{award.year}</span>
                    </div>
                    {award.description && (
                      <p style={{ margin: 0, fontSize: "14px", textAlign: "left" }}>{award.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AwardsModal;
