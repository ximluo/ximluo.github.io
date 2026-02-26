"use client";

import React, {
  useState,
} from "react";
import photos from "../../data/photos";
import "./Creative.css";
import { CONTENT_THEME_TOKENS, type ThemeType } from "../../theme/tokens";
import useIsMobile from "../../hooks/useIsMobile";
import OptimizedImage from "../../components/ui/OptimizedImage";

interface CreativeProps {
  theme: ThemeType;
}

interface ModalProps {
  photo: (typeof photos)[number] | null;
  onClose: () => void;
  theme: ThemeType;
}

const PhotoModal = React.memo<ModalProps>(({ photo, onClose, theme }) => {
  if (!photo) return null;
  const isPdfPreview = Boolean(photo.previewPdf);
  const colors = CONTENT_THEME_TOKENS[theme];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: isPdfPreview ? 640 : 960,
          maxHeight: "90vh",
          overflow: "hidden",
          borderRadius: 12,
          background:
            theme === "bunny"
              ? "rgba(121, 85, 189, 0.2)"
              : "rgba(8, 34, 163, 0.2)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            background: "rgba(0,0,0,0.55)",
          }}
        >
          {isPdfPreview ? (
            <iframe
              src={photo.previewPdf}
              title={`${photo.title} PDF preview`}
              style={{
                width: "100%",
                height: "min(78vh, 860px)",
                border: "none",
                display: "block",
                background: "#0f0f10",
              }}
            />
          ) : (
            <OptimizedImage
              src={photo.image || "/placeholder.svg"}
              alt={photo.title}
              priority
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "82vh",
                objectFit: "contain",
                display: "block",
              }}
            />
          )}

          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
              pointerEvents: "none",
              padding: "12px 16px 16px",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.72) 54%, rgba(0,0,0,0.2) 88%, rgba(0,0,0,0) 100%)",
              color: "rgba(255,255,255,0.96)",
              fontFamily: "monospace",
              textAlign: "left",
            }}
          >
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: 20,
                lineHeight: 1.15,
                color: "rgba(255,255,255,0.98)",
                textShadow: "0 2px 10px rgba(0,0,0,0.45)",
              }}
            >
              {photo.title}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.9)",
                textShadow: "0 1px 6px rgba(0,0,0,0.35)",
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
            >
              {photo.description}
            </p>
          </div>
        </div>

        {}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            border: `1px solid ${colors["--border-color"]}`,
            borderRadius: "50%",
            background: colors["--button-bg"],
            color: colors["--button-text"],
            fontSize: 18,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.28)",
          }}
          aria-label="close modal"
        >
          ×
        </button>
      </div>
    </div>
  );
});
PhotoModal.displayName = "PhotoModal";


const Creative: React.FC<CreativeProps> = ({ theme }) => {
  const isMobile = useIsMobile();
  const [selectedPhoto, setSelectedPhoto] = useState<(typeof photos)[number] | null>(null);

  const colors = CONTENT_THEME_TOKENS[theme];
  const handlePhotoClick = (photo: (typeof photos)[number]) => {
    setSelectedPhoto(photo);
  };

  return (
    <div
      className="creative-container"
      style={{
        width: "100%",
        height: "100%",
        padding: 20,
        boxSizing: "border-box",
        overflow: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        color: colors["--color-text"],
        fontFamily: "monospace",
        ["--creative-scrollbar-thumb" as string]: colors["--button-bg"],
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 940,
          margin: "0 auto",
          padding: "0 20px 20px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {}
        <div
          style={{
            width: "100%",
            borderBottom: `1px solid ${colors["--border-color"]}`,
            paddingBottom: 15,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontFamily: "monospace", color: colors["--color-text"] }}>Artwork</h3>
        </div>

        {}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {isMobile ? (
            <MobileList photos={photos} theme={theme} onPhotoClick={handlePhotoClick} />
          ) : (
            <Grid photos={photos} theme={theme} onPhotoClick={handlePhotoClick} />
          )}
        </div>
      </div>

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} theme={theme} />
      )}
    </div>
  );
};

interface ListProps {
  photos: typeof photos;
  theme: ThemeType;
  onPhotoClick: (p: typeof photos[number]) => void;
}

function getPhotoMedium(description: string) {
  return description.split("|")[0]?.trim() || description;
}

const AspectImage: React.FC<{ photo: typeof photos[number] }> = ({ photo }) => (
  <div
    style={{
      width: "100%",
      position: "relative",
      paddingBottom: "100%",
      height: "auto",
      overflow: "hidden",
    }}
  >
    <OptimizedImage
      src={photo.image || "/placeholder.svg"}
      alt={photo.title}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        transition: "transform 0.28s ease",
        willChange: "transform",
      }}
    />
  </div>
);

const ArtworkCardOverlay: React.FC<{ photo: (typeof photos)[number] }> = ({ photo }) => (
  <>
    <div
      className="artwork-card-overlay"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: "14px",
        right: "14px",
        bottom: "14px",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        pointerEvents: "none",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontFamily: "monospace",
          fontSize: 14,
          color: "rgba(255, 255, 255, 0.98)",
          textAlign: "left",
          textShadow: "0 2px 10px rgba(0, 0, 0, 0.45)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {photo.title}
      </h3>
      <p
        style={{
          margin: 0,
          fontFamily: "monospace",
          fontSize: 12,
          lineHeight: 1.35,
          color: "rgba(255, 255, 255, 0.84)",
          textAlign: "left",
          textShadow: "0 1px 6px rgba(0, 0, 0, 0.35)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {getPhotoMedium(photo.description)}
      </p>
    </div>
  </>
);

const MobileList: React.FC<ListProps> = ({ photos, theme, onPhotoClick }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 20,
      width: "100%",
      maxWidth: 500,
      margin: "0 auto",
    }}
  >
    {photos.map((photo) => (
      <div
        key={photo.id}
        onClick={() => onPhotoClick(photo)}
        className="artwork-card"
        style={{
          width: "100%",
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor:
            theme === "bunny" ? "rgba(121,85,189,0.1)" : "rgba(8,34,163,0.1)",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        <div className="artwork-card-image">
          <AspectImage photo={photo} />
        </div>
        <ArtworkCardOverlay photo={photo} />
      </div>
    ))}
  </div>
);

const GridCard: React.FC<{ photo: (typeof photos)[number]; theme: ThemeType; onPhotoClick: (p: typeof photos[number]) => void; }> = ({
  photo,
  theme,
  onPhotoClick,
}) => {
  const background = theme === "bunny" ? "rgba(121,85,189,0.1)" : "rgba(8,34,163,0.1)";

  return (
    <div
      onClick={() => onPhotoClick(photo)}
      className="artwork-card"
      style={{
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: background,
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        position: "relative",
        transformOrigin: "center",
        transition: "transform 0.28s ease, box-shadow 0.28s ease",
        willChange: "transform",
      }}
    >
      <div className="artwork-card-image">
        <AspectImage photo={photo} />
      </div>
      <ArtworkCardOverlay photo={photo} />
    </div>
  );
};

const Grid: React.FC<ListProps> = ({ photos, theme, onPhotoClick }) => (
  <div className="photo-grid" style={{ width: "100%" }}>
    {photos.map((photo) => (
      <GridCard key={photo.id} photo={photo} theme={theme} onPhotoClick={onPhotoClick} />
    ))}
  </div>
);

export default Creative;
