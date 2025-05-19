"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import photos from "../data/photos"

interface CreativeProps {
  theme: "bunny" | "water"
}

interface ModalProps {
  photo: (typeof photos)[0] | null
  onClose: () => void
  theme: "bunny" | "water"
}

const PhotoModal: React.FC<ModalProps> = ({ photo, onClose, theme }) => {
  const themes = {
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
  }

  if (!photo) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
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
          backgroundColor: theme === "bunny" ? "rgba(121, 85, 189, 0.2)" : "rgba(8, 34, 163, 0.2)",
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
        <div style={{ position: "relative", width: "100%", height: "70vh", maxHeight: "70vh" }}>
          <img
            src={photo.image || "/placeholder.svg"}
            alt={photo.title}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
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
        <div
          style={{
            padding: 20,
            color: theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
            fontFamily: "monospace",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px",
              color:
                theme === "bunny" ? themes.bunny["--color-accent-primary"] : themes.water["--color-accent-primary"],
            }}
          >
            {photo.title}
          </h2>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{photo.description}</p>
        </div>
      </div>
    </div>
  )
}

const Creative: React.FC<CreativeProps> = ({ theme }) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [filteredPhotos, setFilteredPhotos] = useState(photos)
  const [selectedPhoto, setSelectedPhoto] = useState<(typeof photos)[0] | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [carouselRotation, setCarouselRotation] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" && window.innerWidth > 1024)
  const [isCarouselView, setIsCarouselView] = useState(true)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autoRotateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [showInstructions, setShowInstructions] = useState(true)

  // Theme palette 
  const themes = {
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
  }

  // Window resizes 
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      setIsDesktop(window.innerWidth > 1024)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Filter changes 
  useEffect(() => {
    setFilteredPhotos(activeFilter ? photos.filter((p) => p.categories.includes(activeFilter)) : photos)
  }, [activeFilter])

  // Auto-rotation for carousel when not scrolling 
  useEffect(() => {
    // Only auto-rotate if in carousel view, on desktop, and not scrolling
    if (isCarouselView && !isMobile && !isScrolling) {
      // Clear any existing interval
      if (autoRotateIntervalRef.current) {
        clearInterval(autoRotateIntervalRef.current)
      }

      // Set up auto-rotation
      autoRotateIntervalRef.current = setInterval(() => {
        setCarouselRotation((prev) => prev + 0.5)
      }, 100)
    } else {
      // Clear interval if conditions not met
      if (autoRotateIntervalRef.current) {
        clearInterval(autoRotateIntervalRef.current)
        autoRotateIntervalRef.current = null
      }
    }

    return () => {
      if (autoRotateIntervalRef.current) {
        clearInterval(autoRotateIntervalRef.current)
      }
    }
  }, [isCarouselView, isDesktop, isMobile, isScrolling])

  // Custom scrollbar and carousel styles 
  useEffect(() => {
    const styleId = "creative-custom-styles"
    let el = document.getElementById(styleId) as HTMLStyleElement | null
    if (!el) {
      el = document.createElement("style")
      el.id = styleId
      document.head.appendChild(el)
    }

    // custom scrollbar and carousel animation styles
    el.innerHTML = `
      /* Custom scrollbar */
      .creative-container::-webkit-scrollbar{width:8px}
      .creative-container::-webkit-scrollbar-track{background:transparent}
      .creative-container::-webkit-scrollbar-thumb{
        border-radius:4px;
        background-color:${theme === "bunny" ? themes.bunny["--button-bg"] : themes.water["--button-bg"]};
      }
      
      /* Import fonts */
      @import url('https://fonts.cdnfonts.com/css/ica-rubrik-black');
      @import url('https://fonts.cdnfonts.com/css/poppins');
      
      /* Carousel auto-rotation animation */
      @keyframes autoRotate {
        from {
          transform: perspective(1000px) rotateX(-10deg) rotateY(0deg);
        }
        to {
          transform: perspective(1000px) rotateX(-10deg) rotateY(360deg);
        }
      }
      
      /* Grid layout for non-carousel view */
      .photo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
        width: 100%;
      }
    `

    return () => {
      el && el.remove()
    }
  }, [theme])

  const handleFilterClick = (filter: string) => setActiveFilter(activeFilter === filter ? null : filter)

  const handlePhotoClick = (photo: (typeof photos)[0]) => setSelectedPhoto(photo)

  const handleToggleView = () => {
    setIsCarouselView(!isCarouselView)
  }

  // Handle scroll for manual carousel rotation
  const handleScroll = (e: React.WheelEvent) => {
    if (isMobile || !isCarouselView) return

    // Hide instructions after first scroll
    if (showInstructions) {
      setShowInstructions(false)
    }

    // Prevent default to avoid page scrolling
    e.preventDefault()

    // Mark as scrolling
    setIsScrolling(true)

    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Rotate based on scroll direction
    const delta = Math.abs(e.deltaY) > 5 ? e.deltaY : 0
    if (delta !== 0) {
      setCarouselRotation((prev) => prev + (delta > 0 ? 5 : -5))
    }

    // End scrolling state after inactivity
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 220)
  }

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
        color: theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
        fontFamily: "monospace",
      }}
    >
      {/* Filter section */}
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          margin: "0 auto 30px",
          padding: "0 20px 15px",
          boxSizing: "border-box",
          borderBottom: `1px solid ${theme === "bunny" ? themes.bunny["--border-color"] : themes.water["--border-color"]
            }`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px 20px",
        }}
      >
        {/* toggle button */}
        {!isMobile ? (
          <button
            onClick={handleToggleView}
            style={{
              padding: "7px 14px",
              backgroundColor: "transparent",
              color: theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
              border: `1px solid ${theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"]}`,
              borderRadius: 20,
              fontFamily: "monospace",
              cursor: "pointer",
              opacity: 0.8,
              transition: "opacity 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
          >
            {isCarouselView ? "Grid View" : "Carousel View"}
          </button>
        ) : (
          <h3
            style={{
              margin: 0,
              fontFamily: "monospace",
              color: theme === "bunny" ? themes.bunny["--color-text"] : themes.water["--color-text"],
            }}
          >
            Creative
          </h3>
        )}

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {["art", "photos"].map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterClick(filter)}
              style={{
                padding: "7px 14px",
                backgroundColor:
                  activeFilter === filter
                    ? theme === "bunny"
                      ? themes.bunny["--button-bg"]
                      : themes.water["--button-bg"]
                    : theme === "bunny"
                      ? themes.bunny["--button-bg-light"]
                      : themes.water["--button-bg-light"],
                color:
                  activeFilter === filter
                    ? theme === "bunny"
                      ? themes.bunny["--button-text"]
                      : themes.water["--button-text"]
                    : theme === "bunny"
                      ? themes.bunny["--color-text"]
                      : themes.water["--color-text"],
                border: "none",
                borderRadius: 20,
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

      {/* Mobile list OR Desktop view (carousel or grid) */}
      {isMobile ? (
        /* Mobile: vertical list with overlay titles */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            width: "100%",
            maxWidth: 500,
            padding: "0 20px",
          }}
        >
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => handlePhotoClick(photo)}
              style={{
                width: "100%",
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: theme === "bunny" ? "rgba(121, 85, 189, 0.1)" : "rgba(8, 34, 163, 0.1)",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              {/* Image container */}
              <div
                style={{
                  width: "100%",
                  position: "relative",
                  paddingBottom: "100%",
                  overflow: "hidden",
                }}
              >
                <img
                  src={photo.image || "/placeholder.svg"}
                  alt={photo.title}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                {/* Overlay title */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "15%",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
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
                      fontSize: "12px",
                      color: "#ffffff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {photo.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isCarouselView ? (
        /* Desktop: 3D auto-rotating carousel */
        <div
          style={{
            width: "100%",
            maxWidth: 980,
            margin: "0 auto",
            position: "relative",
          }}
        >
          <div
            className="banner"
            style={{
              width: "100%",
              height: "60vh",
              minHeight: 400,
              textAlign: "center",
              overflow: "hidden",
              position: "relative",
            }}
            onWheel={handleScroll}
          >
            <div
              ref={carouselRef}
              className="slider"
              style={{
                position: "absolute",
                width: "150px",
                height: "200px",
                top: "10%",
                left: "calc(50% - 90px)",
                transformStyle: "preserve-3d",
                transform: `perspective(1000px) rotateX(-10deg) rotateY(${carouselRotation}deg)`,
                zIndex: 2,
              }}
            >
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  onClick={() => handlePhotoClick(photo)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    transform: `rotateY(calc(${index} * (360 / ${filteredPhotos.length}) * 1deg)) translateZ(450px)`, // Reduced distance
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                    }}
                  >
                    <img
                      src={photo.image || "/placeholder.svg"}
                      alt={photo.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

                    {/* Overlay title */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "15%", // title area
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
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
                          fontSize: "12px",
                          color: "#ffffff",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {photo.title}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Instruction overlay */}
            {showInstructions && (
              <div
                style={{
                  position: "absolute",
                  bottom: "0px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "#ffffff",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  zIndex: 10,
                  backdropFilter: "blur(2px)",
                }}
              >
                Scroll to rotate carousel. Click to view.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop: Grid view */
        <div className="photo-grid" style={{ width: "100%" }}>
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => handlePhotoClick(photo)}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: theme === "bunny" ? "rgba(121, 85, 189, 0.1)" : "rgba(8, 34, 163, 0.1)",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              {/* Image container */}
              <div
                style={{
                  width: "100%",
                  position: "relative",
                  paddingBottom: "100%",
                  overflow: "hidden",
                }}
              >
                <img
                  src={photo.image || "/placeholder.svg"}
                  alt={photo.title}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                {/* Overlay title */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "20%",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
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
                      fontSize: "12px",
                      color: "#ffffff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {photo.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} theme={theme} />}
    </div>
  )
}

export default Creative
