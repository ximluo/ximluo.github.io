import React from "react"
interface AwardsModalProps {
  onClose: () => void;
  theme: "bunny" | "water";
}

const AwardsModal: React.FC<AwardsModalProps> = ({ onClose, theme }) => {
  const themes = {
    bunny: {
      "--color-text": "rgb(172, 149, 216)",
      "--color-text-secondary": "rgba(249, 240, 251, 1)",
      "--color-accent-primary": "rgb(214, 129, 231)",
      "--button-bg": "rgba(180, 82, 205, 0.8)",
      "--button-bg-light": "rgba(180, 82, 205, 0.2)",
      "--button-text": "rgba(249, 240, 251, 1)",
      "--border-color": "rgb(152, 128, 220)",
    },
    water: {
      "--color-text": "rgb(191, 229, 249)",
      "--color-accent-primary": "rgb(134, 196, 240)",
      "--button-bg": "rgba(214, 235, 251, 0.8)",
      "--button-bg-light": "rgba(214, 220, 251, 0.2)",
      "--button-text": "rgb(46, 80, 192)",
      "--border-color": "rgba(8, 34, 163, 1)",
    },
  };

  // Awards data organized by sections
  const awardsData = {
    "SELECT AWARDS": [
      {
        title: "Adobe Digital Edge Awards Winner",
        year: "2024",
        description: "App design featured at Adobe MAX 2024 Conference",
        link: "https://www.behance.net/gallery/205694787/Computer-Science-Pennsylvania-USA",
      },
      {
        title: "MIT Reality Hacks 2025 Winner",
        year: "2025",
        description: "Best Hardware Hack, Best Use of OpenBCI",
        link: "https://devpost.com/software/neuroscent",
      },
      {
        title: "HackMIT Winner",
        year: "2024",
        description: "Intersystems Challenge Winner",
        link: "https://ballot.hackmit.org/project/dicbb-jczbc-nylxm-mcqsf",
      },
      {
        title: "NCWIT Aspirations for Computing Award Winner",
        year: "2023",
        description: "",
        link: "https://www.aspirations.org/people/ximing-l/129010",
      },
      {
        title: "American Computer Science League 1st Place",
        year: "2022",
        description: "",
      },
      {
        title: "Scholastic Art and Writing Awards",
        year: "2023",
        description: "2 Gold Medals, 3 Gold Keys, 8 Silver Key, 8 Honorable Mentions",
        link: "",
      },
    ],
    "SCHOLARSHIPS": [
      {
        title: "Catalent Global Scholarship",
        year: "2024",
        description: "",
        link: "https://www.catalent.com/scholarship",
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
        title: "National Society of High School Scholars Visual Arts Scholarship",
        year: "2022",
        description: "$2000 Scholarship Awardee",
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
        title: "International 2022 SpaceTime Competition",
        year: "2022",
        description: "SIGGRAPH Conference SpaceTime Gallery",
        link: "https://education.siggraph.org/spacetime/gallery/2022",
      },
      {
        title: "International Visual Art Competition",
        year: "2020",
        description: "The World Art Institute of Youth – Centre for UNESCO; 2020 Nominee",
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
        description: "Spring 2022, Summer 2020, Spring 2020",
        link: "",
      },
    ],
    "AWARDS": [
      {
        title: "Winner, Illustrators of the Future",
        year: "2022",
        description: "Art published in Writers of the Future Volume 39 bestselling anthology, ~$20,000",
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
        title: "International Creative Karuta Award",
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
            Awards & Recognition
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
