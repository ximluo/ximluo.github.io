"use client";

import React, {
  useState,
} from "react";
import photos from "../../data/photos";
import "./Creative.css";
import { CONTENT_THEME_TOKENS, type ThemeType } from "../../theme/tokens";
import useIsMobile from "../../hooks/useIsMobile";

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
          maxWidth: 640,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
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
        {}
        <img
          src={photo.image || "/placeholder.svg"}
          alt={photo.title}
          loading="lazy"
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "65vh",
            objectFit: "contain",
          }}
        />

        {}
        <div
          style={{
            flexShrink: 0,
            padding: 16,
            overflowY: "auto",
            color: colors["--color-text"],
            fontFamily: "monospace",
          }}
        >
          <h2
            style={{
              margin: "0 0 8px",
              color: colors["--color-accent-primary"],
            }}
          >
            {photo.title}
          </h2>
          <p style={{ margin: 0, lineHeight: 1.5 }}>{photo.description}</p>
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
            border: "none",
            borderRadius: "50%",
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            fontSize: 18,
            cursor: "pointer",
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
    <img
      src={photo.image || "/placeholder.svg"}
      srcSet={photo.image ? `${photo.image} 1x, ${photo.image} 2x` : undefined}
      alt={photo.title}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
      loading="lazy"
      decoding="async"
    />
  </div>
);

const TitleOverlay: React.FC<{ title: string; heightPct: number; isVisible?: boolean }> = ({
  title,
  heightPct,
  isVisible = true,
}) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: `${heightPct}%`,
      backgroundColor: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(2px)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "0 15px",
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.2s ease, transform 0.2s ease",
      pointerEvents: "none",
    }}
  >
    <h3
      style={{
        margin: 0,
        fontSize: 12,
        color: "#fff",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {title}
    </h3>
  </div>
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
        <AspectImage photo={photo} />
        <TitleOverlay title={photo.title} heightPct={15} />
      </div>
    ))}
  </div>
);

const GridCard: React.FC<{ photo: (typeof photos)[number]; theme: ThemeType; onPhotoClick: (p: typeof photos[number]) => void; }> = ({
  photo,
  theme,
  onPhotoClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const background = theme === "bunny" ? "rgba(121,85,189,0.1)" : "rgba(8,34,163,0.1)";

  return (
    <div
      onClick={() => onPhotoClick(photo)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: background,
        cursor: "pointer",
        boxShadow: isHovered ? "0 8px 24px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.1)",
        position: "relative",
        transform: isHovered ? "scale(1.04)" : "scale(1)",
        transformOrigin: "center",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        willChange: "transform",
      }}
    >
      <AspectImage photo={photo} />
      <TitleOverlay title={photo.title} heightPct={20} isVisible={isHovered} />
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
