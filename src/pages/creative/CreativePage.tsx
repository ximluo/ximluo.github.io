import React, { useState } from "react"
import OptimizedImage from "../../components/ui/OptimizedImage"
import useIsMobile from "../../hooks/useIsMobile"
import photos from "../../data/photos"
import { CONTENT_THEME_TOKENS, THEME_VISUAL_TOKENS, type ThemeType } from "../../theme/tokens"
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
  if (!photo) return null

  const isPdfPreview = Boolean(photo.previewPdf)
  const colors = CONTENT_THEME_TOKENS[theme]
  const visualTokens = THEME_VISUAL_TOKENS[theme]
  const modalSurface = visualTokens.surfaceCreativeModal

  return (
    <div className="creative-modal-backdrop" onClick={onClose}>
      <div
        className="creative-modal-frame"
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
            <h2 className="creative-modal-caption-title">{photo.title}</h2>
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
  const isMobile = useIsMobile()
  const [selectedPhoto, setSelectedPhoto] = useState<(typeof photos)[number] | null>(null)

  const colors = CONTENT_THEME_TOKENS[theme]
  const cardBackground = THEME_VISUAL_TOKENS[theme].surfaceCreativeCard

  const handlePhotoClick = (photo: (typeof photos)[number]) => {
    setSelectedPhoto(photo)
  }

  return (
    <div
      className="creative-container"
      style={{
        ["--creative-scrollbar-thumb" as string]: colors["--button-bg"],
        ["--creative-text" as string]: colors["--color-text"],
        ["--creative-border" as string]: colors["--border-color"],
        ["--creative-card-bg" as string]: cardBackground,
      }}
    >
      <div className="creative-shell">
        <div className="creative-header">
          <h3 className="creative-title">Artwork</h3>
        </div>

        <div className="creative-content">
          {isMobile ? (
            <MobileList photos={photos} onPhotoClick={handlePhotoClick} />
          ) : (
            <Grid photos={photos} onPhotoClick={handlePhotoClick} />
          )}
        </div>
      </div>

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} theme={theme} />
      )}
    </div>
  )
}

interface ListProps {
  photos: typeof photos
  onPhotoClick: (photo: (typeof photos)[number]) => void
}

function getPhotoMedium(description: string) {
  return description.split("|")[0]?.trim() || description
}

const AspectImage: React.FC<{ photo: (typeof photos)[number] }> = ({ photo }) => (
  <div className="creative-aspect-image">
    <OptimizedImage
      src={photo.image || "/placeholder.svg"}
      alt={photo.title}
      className="creative-aspect-image-inner"
    />
  </div>
)

const ArtworkCardOverlay: React.FC<{ photo: (typeof photos)[number] }> = ({ photo }) => (
  <>
    <div className="artwork-card-overlay" />
    <div className="artwork-card-meta">
      <h3 className="artwork-card-title">{photo.title}</h3>
      <p className="artwork-card-medium">{getPhotoMedium(photo.description)}</p>
    </div>
  </>
)

const MobileList: React.FC<ListProps> = ({ photos, onPhotoClick }) => (
  <div className="creative-mobile-list">
    {photos.map((photo) => (
      <div key={photo.id} onClick={() => onPhotoClick(photo)} className="artwork-card">
        <div className="artwork-card-image">
          <AspectImage photo={photo} />
        </div>
        <ArtworkCardOverlay photo={photo} />
      </div>
    ))}
  </div>
)

interface GridCardProps {
  photo: (typeof photos)[number]
  onPhotoClick: (photo: (typeof photos)[number]) => void
}

const GridCard: React.FC<GridCardProps> = ({ photo, onPhotoClick }) => {
  return (
    <div onClick={() => onPhotoClick(photo)} className="artwork-card artwork-card--grid">
      <div className="artwork-card-image">
        <AspectImage photo={photo} />
      </div>
      <ArtworkCardOverlay photo={photo} />
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
