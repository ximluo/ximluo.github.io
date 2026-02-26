import React from "react"
import awardsData from "../data/awards"
import { AWARDS_THEME_TOKENS, THEME_VISUAL_TOKENS, type ThemeType } from "../theme/tokens"
import "./AwardsModal.css"

interface AwardsModalProps {
  onClose: () => void
  theme: ThemeType
}

const AwardsModal: React.FC<AwardsModalProps> = ({ onClose, theme }) => {
  const themeTokens = AWARDS_THEME_TOKENS[theme]
  const visualTokens = THEME_VISUAL_TOKENS[theme]

  return (
    <div className="awards-modal-backdrop" onClick={onClose}>
      <div
        className="awards-modal-panel"
        style={{
          ["--awards-modal-surface" as string]: visualTokens.surfaceAwardsModal,
          ["--awards-item-surface" as string]: visualTokens.surfaceAwardsItem,
          ["--awards-text" as string]: themeTokens["--color-text"],
          ["--awards-accent" as string]: themeTokens["--color-accent-primary"],
          ["--awards-border" as string]: themeTokens["--border-color"],
          ["--awards-button-bg-light" as string]: themeTokens["--button-bg-light"],
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="awards-modal-header">
          <h2 className="awards-modal-title">AWARDS &amp; RECOGNITION</h2>
          <button
            type="button"
            onClick={onClose}
            className="awards-modal-close"
            aria-label="Close awards"
          >
            ×
          </button>
        </div>

        <div className="awards-modal-sections">
          {Object.entries(awardsData).map(([section, awards]) => (
            <section key={section}>
              <h3 className="awards-modal-section-title">{section}</h3>
              <div className="awards-modal-list">
                {awards.map((award) => {
                  const hasLink = Boolean(award.link?.trim())

                  return (
                    <div
                      key={`${section}-${award.title}-${award.year}`}
                      className={`awards-modal-item ${hasLink ? "awards-modal-item--linked" : ""}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        if (hasLink) window.open(award.link, "_blank", "noopener,noreferrer")
                      }}
                    >
                      <div className="awards-modal-item-header">
                        <h4 className="awards-modal-item-title">
                          {award.title}
                          {hasLink && <span className="awards-modal-item-link-icon">↗️</span>}
                        </h4>
                        <span className="awards-modal-item-year">{award.year}</span>
                      </div>

                      {award.description && (
                        <p className="awards-modal-item-description">{award.description}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AwardsModal
