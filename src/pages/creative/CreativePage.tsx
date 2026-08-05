import React from "react"
import { useSearchParams } from "react-router-dom"
import Footer from "../../components/Footer"
import OptimizedImage from "../../components/ui/OptimizedImage"
import useModalA11y from "../../hooks/useModalA11y"
import usePageMeta from "../../hooks/usePageMeta"
import photos from "../../data/photos"
import { CONTENT_THEME_TOKENS, THEME_VISUAL_TOKENS, type ThemeType } from "../../theme/tokens"
import "../../components/ui/card.css"
import "./Creative.css"

interface CreativeProps {
  theme: ThemeType
}

interface ModalProps {
  photo: (typeof photos)[number] | null
  onClose: () => void
  theme: ThemeType
}

const PhotoModal = React.memo<ModalProps>(({ photo, onClose, theme }) => {
  const frameRef = useModalA11y<HTMLDivElement>(onClose)

  if (!photo) return null

  const isPdfPreview = Boolean(photo.previewPdf)
  const colors = CONTENT_THEME_TOKENS[theme]
  const visualTokens = THEME_VISUAL_TOKENS[theme]
  const modalSurface = visualTokens.surfaceCreativeModal

  return (
    <div className="creative-modal-backdrop" onClick={onClose}>
      <div
        ref={frameRef}
        className="creative-modal-frame"
        role="dialog"
        aria-modal="true"
        aria-labelledby="creative-modal-title"
        tabIndex={-1}
        style={{
          maxWidth: isPdfPreview ? 640 : 960,
          ["--creative-modal-surface" as string]: modalSurface,
          ["--creative-border" as string]: colors["--border-color"],
          ["--creative-button-bg" as string]: colors["--button-bg"],
          ["--creative-button-text" as string]: colors["--button-text"],
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="creative-modal-media">
          {isPdfPreview ? (
            <iframe
              src={photo.previewPdf}
              title={`${photo.title} PDF preview`}
              className="creative-modal-pdf"
            />
          ) : (
            <OptimizedImage
              src={photo.image || "/placeholder.svg"}
              alt={photo.title}
              priority
              className="creative-modal-image"
            />
          )}

          <div className="creative-modal-caption">
            <h2 className="creative-modal-caption-title" id="creative-modal-title">
              {photo.title}
            </h2>
            <p className="creative-modal-caption-text">{photo.description}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="creative-modal-close"
          aria-label="close modal"
        >
          ×
        </button>
      </div>
    </div>
  )
})
PhotoModal.displayName = "PhotoModal"

const Creative: React.FC<CreativeProps> = ({ theme }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  usePageMeta("Artwork", "Illustrations, photographs, and visual experiments by Ximing Luo.")

  const colors = CONTENT_THEME_TOKENS[theme]
  const cardBackground = THEME_VISUAL_TOKENS[theme].surfaceCreativeCard
  const selectedPhotoId = searchParams.get("photo")
  const selectedPhoto = photos.find((photo) => photo.id === selectedPhotoId) ?? null

  const handlePhotoClick = (photo: (typeof photos)[number]) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      nextParams.set("photo", photo.id)
      return nextParams
    })
  }

  const handlePhotoClose = () => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      nextParams.delete("photo")
      return nextParams
    })
  }

  return (
    <div
      className="creative-container"
      style={{
        ["--creative-text" as string]: colors["--color-text"],
        ["--creative-card-bg" as string]: cardBackground,
      }}
    >
      <div className="creative-shell">
        <div className="creative-header">
          <h1 className="creative-title">Artwork</h1>
          <p className="creative-subtitle">
            A collection of illustrations, photographs, and visual experiments
          </p>
        </div>

        <div className="creative-content">
          <Grid photos={photos} onPhotoClick={handlePhotoClick} />
        </div>
      </div>

      <Footer theme={theme} />

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={handlePhotoClose} theme={theme} />
      )}
    </div>
  )
}

interface ListProps {
  photos: typeof photos
  onPhotoClick: (photo: (typeof photos)[number]) => void
}

interface GridCardProps {
  photo: (typeof photos)[number]
  onPhotoClick: (photo: (typeof photos)[number]) => void
}

const GridCard: React.FC<GridCardProps> = ({ photo, onPhotoClick }) => {
  return (
    <div
      onClick={() => onPhotoClick(photo)}
      className="artwork-card"
      role="button"
      tabIndex={0}
      aria-label={`View ${photo.title}`}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onPhotoClick(photo)
        }
      }}
    >
      <div className="artwork-card-image-frame">
        <OptimizedImage
          src={photo.image || "/placeholder.svg"}
          alt={photo.title}
          className="artwork-card-image"
          sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
        />
        <div className="artwork-card-hover" aria-hidden>
          <span className="artwork-card-view">View</span>
        </div>
      </div>

      <div className="artwork-card-info">
        <h3 className="artwork-card-title">{photo.title}</h3>
        <p className="artwork-card-description">{photo.description}</p>
      </div>
    </div>
  )
}

const Grid: React.FC<ListProps> = ({ photos, onPhotoClick }) => (
  <div className="photo-grid">
    {photos.map((photo) => (
      <GridCard key={photo.id} photo={photo} onPhotoClick={onPhotoClick} />
    ))}
  </div>
)

export default Creative
