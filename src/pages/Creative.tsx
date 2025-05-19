"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import photos from "../data/photos";

type Theme = "bunny" | "water";

const THEMES = {
  bunny: {
    "--color-text": "rgb(121, 85, 189)",
    "--color-text-secondary": "rgba(249, 240, 251, 1)",
    "--color-accent-primary": "rgba(223, 30, 155, 1)",
    "--button-bg": "rgba(223, 30, 155, 0.8)",
    "--button-bg-light": "rgba(223, 30, 155, 0.2)",
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
} as const;

interface CreativeProps {
  theme: Theme;
}

interface ModalProps {
  photo: (typeof photos)[number] | null;
  onClose: () => void;
  theme: Theme;
}

// Photo modal
const PhotoModal = React.memo<ModalProps>(({ photo, onClose, theme }) => {
  if (!photo) return null;
  const colors = THEMES[theme];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor:
            theme === "bunny" ? "rgba(121, 85, 189, 0.2)" : "rgba(8, 34, 163, 0.2)",
          borderRadius: 12,
          maxWidth: "90%",
          maxHeight: "90%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ position: "relative", width: "100%", height: "70vh" }}>
          <img
            src={photo.image || "/placeholder.svg"}
            alt={photo.title}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            loading="lazy"
          />
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 15,
              right: 15,
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundColor: "rgba(0,0,0,0.5)",
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 20, color: colors["--color-text"], fontFamily: "monospace" }}>
          <h2
            style={{
              margin: "0 0 10px",
              color: colors["--color-accent-primary"],
            }}
          >
            {photo.title}
          </h2>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{photo.description}</p>
        </div>
      </div>
    </div>
  );
});
PhotoModal.displayName = "PhotoModal";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 768,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

const Creative: React.FC<CreativeProps> = ({ theme }) => {
  const isMobile = useIsMobile();

  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<(typeof photos)[number] | null>(null);
  const [carouselRotation, setCarouselRotation] = useState(0);
  const [isCarouselView, setIsCarouselView] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const raf = useRef<number | null>(null);
  const showInstructions = useRef(true);

  /* filtering */
  const filteredPhotos = useMemo(
    () => (activeFilter ? photos.filter((p) => p.categories.includes(activeFilter)) : photos),
    [activeFilter],
  );

  /* smooth auto‑rotation via RAF */
  const startAutoRotate = useCallback(() => {
    let lastTime = performance.now();
    const step = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      const rotationPerFrame = 0.18 * (deltaTime / 16.67); //speed
      setCarouselRotation((prev) => prev + rotationPerFrame);
      lastTime = currentTime;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  const stopAutoRotate = useCallback(() => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isMobile && isCarouselView && !isScrolling) {
      startAutoRotate();
    } else {
      stopAutoRotate();
    }
    return stopAutoRotate;
  }, [isMobile, isCarouselView, isScrolling, startAutoRotate, stopAutoRotate]);

  /* manual rotation */
const handleScroll = useCallback<React.WheelEventHandler>(
  (e) => {
    if (isMobile || !isCarouselView) return;

    if (showInstructions.current) showInstructions.current = false;
    e.preventDefault();
    
    const sensitivity = 0.15;
    const normalizedDelta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY) * sensitivity, 3);
    
    setCarouselRotation(prev => prev + normalizedDelta);
    
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    setIsScrolling(true);
    scrollTimeout.current = setTimeout(() => {
      scrollTimeout.current = null;
      setIsScrolling(false);
    }, 160);
  },
  [isMobile, isCarouselView]
);

  /* dynamic CSS (once/theme) */
  useEffect(() => {
    const styleId = "creative-custom-styles";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    const colors = THEMES[theme];
    styleEl.innerHTML = `
      .creative-container::-webkit-scrollbar{width:8px}
      .creative-container::-webkit-scrollbar-track{background:transparent}
      .creative-container::-webkit-scrollbar-thumb{border-radius:4px;background:${colors["--button-bg"]};}
      .photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;width:100%;}
    `;
    return () => {
      if (styleEl) styleEl.remove();
    };
  }, [theme]);

  const handleFilterClick = (filter: string) =>
    setActiveFilter((prev) => (prev === filter ? null : filter));

  const colors = THEMES[theme];

  return (
    <div
      className="creative-container"
      style={{
        width: "100%",
        maxWidth: 980,
        height: "100%",
        padding: 20,
        margin: "0 auto",
        overflowY: "auto",
        overflowX: "hidden",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: colors["--color-text"],
        fontFamily: "monospace",
      }}
    >
      {/* header */}
      <div
        style={{
          width: "100%",
          maxWidth: 940,
          margin: "0 auto 30px",
          padding: "0 20px 15px",
          boxSizing: "border-box",
          borderBottom: `1px solid ${colors["--border-color"]}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px 20px",
        }}
      >
        {!isMobile ? (
          <button
            onClick={() => setIsCarouselView((v) => !v)}
            style={{
              padding: "7px 14px",
              background: "transparent",
              color: colors["--color-text"],
              border: `1px solid ${colors["--color-text"]}`,
              borderRadius: 20,
              fontFamily: "monospace",
              cursor: "pointer",
              opacity: 0.8,
              transition: "opacity 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
          >
            {isCarouselView ? "Grid View" : "Carousel View"}
          </button>
        ) : (
          <h3 style={{ margin: 0, fontFamily: "monospace" }}>Creative</h3>
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          {["art", "photos"].map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterClick(filter)}
              style={{
                padding: "7px 14px",
                backgroundColor:
                  activeFilter === filter ? colors["--button-bg"] : colors["--button-bg-light"],
                color: activeFilter === filter ? colors["--button-text"] : colors["--color-text"],
                border: "none",
                borderRadius: "20px",
                fontFamily: "monospace",
                cursor: "pointer",
                textTransform: "lowercase",
              }}
            >
              {activeFilter === filter ? `${filter} ×` : filter}
            </button>
          ))}
        </div>
      </div>

      {/* content */}
      {isMobile ? (
        <MobileList photos={filteredPhotos} theme={theme} onPhotoClick={setSelectedPhoto} />
      ) : isCarouselView ? (
        <Carousel
          photos={filteredPhotos}
          theme={theme}
          rotation={carouselRotation}
          onPhotoClick={setSelectedPhoto}
          onWheel={handleScroll}
          showInstructions={showInstructions.current}
        />
      ) : (
        <Grid photos={filteredPhotos} theme={theme} onPhotoClick={setSelectedPhoto} />
      )}

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} theme={theme} />
      )}
    </div>
  );
};

interface ListProps {
  photos: typeof photos;
  theme: Theme;
  onPhotoClick: (p: typeof photos[number]) => void;
}

const AspectImage: React.FC<{ photo: typeof photos[number]; isCarousel?: boolean }> = ({ photo, isCarousel }) => (
  <div style={{ 
    width: "100%", 
    position: "relative", 
    paddingBottom: isCarousel ? "0" : "100%", 
    height: isCarousel ? "100%" : "auto",
    overflow: "hidden" 
  }}>
    <img
      src={photo.image || "/placeholder.svg"}
      srcSet={photo.image ? `${photo.image} 1x, ${photo.image} 2x` : undefined}
      alt={photo.title}
      style={{ 
        position: isCarousel ? "relative" : "absolute", 
        width: "100%", 
        height: "100%", 
        objectFit: "cover", 
        display: "block",
        willChange: isCarousel ? "transform" : "auto"
      }}
      loading="lazy"
      decoding="async"
    />
  </div>
);

const TitleOverlay: React.FC<{ title: string; heightPct: number }> = ({ title, heightPct }) => (
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
  <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: 500, padding: "0 20px" }}>
    {photos.map((photo) => (
      <div
        key={photo.id}
        onClick={() => onPhotoClick(photo)}
        style={{
          width: "100%",
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: theme === "bunny" ? "rgba(121,85,189,0.1)" : "rgba(8,34,163,0.1)",
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

interface CarouselProps extends ListProps {
  rotation: number;
  onWheel: React.WheelEventHandler;
  showInstructions: boolean;
}

const Carousel: React.FC<CarouselProps> = ({ photos, theme, rotation, onPhotoClick, onWheel, showInstructions }) => (
  <div style={{ width: "100%", maxWidth: 980, margin: "0 auto", position: "relative" }}>
    <div
      className="banner"
      style={{ width: "100%", height: "60vh", minHeight: 400, textAlign: "center", overflow: "hidden", position: "relative" }}
      onWheel={onWheel}
    >
      <div
      style={{
        position: "absolute",
        width: 150,
        height: 200,
        top: "10%",
        left: "calc(50% - 75px)",
        transformStyle: "preserve-3d",
        transform: `perspective(1000px) rotateX(-10deg) rotateY(${rotation}deg)`,
        zIndex: 1,
        willChange: "transform",
      }}
      >
      {photos.map((photo, index) => (
        <div
        key={photo.id}
        onClick={() => onPhotoClick(photo)}
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotateY(${(index * 360) / photos.length}deg) translateZ(450px)`,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          cursor: "pointer",
          height: "100%",
        }}
        >
        <AspectImage photo={photo} isCarousel={true} />
        <TitleOverlay title={photo.title} heightPct={15} />
        </div>
      ))}
      </div>

      {showInstructions && (
      <div
        style={{
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.6)",
        color: "#fff",
        padding: "8px 16px",
        borderRadius: 20,
        fontSize: 12,
        fontFamily: "monospace",
        backdropFilter: "blur(2px)",
        zIndex: 2,
        }}
      >
        Scroll to rotate carousel. Click to view.
      </div>
      )}
    </div>
  </div>
);

const Grid: React.FC<ListProps> = ({ photos, theme, onPhotoClick }) => (
  <div className="photo-grid" style={{ width: "100%" }}>
    {photos.map((photo) => (
      <div
        key={photo.id}
        onClick={() => onPhotoClick(photo)}
        style={{
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: theme === "bunny" ? "rgba(121,85,189,0.1)" : "rgba(8,34,163,0.1)",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        <AspectImage photo={photo} />
        <TitleOverlay title={photo.title} heightPct={20} />
      </div>
    ))}
  </div>
);

export default Creative;
