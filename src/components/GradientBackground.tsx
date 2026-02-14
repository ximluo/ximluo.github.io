import React, { useEffect, useRef, useMemo, useState } from "react";

type ThemeType = "bunny" | "water";
interface GradientBackgroundProps {
  theme: ThemeType;
  children?: React.ReactNode;
}

const themeStyles = {
  bunny: {
    "--color-bg1": "#ebdbff",
    "--color-bg2": "#ffffff",
    "--color1": "249,240,251",
    "--color2": "249,240,251",
    "--color3": "226,199,213",
    "--color4": "227, 89, 195",
    "--color5": "249,240,251",
    "--color-interactive": "227, 89, 195",
    "--circle-size": "90%",
    "--blending": "screen",
  },
  water: {
    "--color-bg1": "#001f3f",
    "--color-bg2": "#001f3f",
    "--color1": "173, 216, 230",
    "--color2": "0, 116, 217",
    "--color3": "65, 105, 225",
    "--color4": "0, 31, 63",
    "--color5": "135, 206, 235",
    "--color-interactive": "0,191,255",
    "--circle-size": "90%",
    "--blending": "screen",
  },
} as const;

const LAPTOP_BREAKPOINT = 1024;

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  theme,
  children,
}) => {
  /* UA CHECK (client-only) */
  const isSafari = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    return /Safari/i.test(ua) && !/Chrome|Chromium|CriOS/i.test(ua);
  }, []);

  const isMobileOrTablet = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    const hasTouch =
      (typeof window !== "undefined" && "ontouchstart" in window) ||
      (navigator as any).maxTouchPoints > 0;
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|Tablet/i.test(ua) ||
      !!hasTouch
    );
  }, []);

  // If mobile/tablet, treat as Safari (no goo filter, blur on circles)
  const useSafariMode = isSafari || isMobileOrTablet;

  const containerRef = useRef<HTMLDivElement>(null);
  const interBubbleRef = useRef<HTMLDivElement>(null);
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null);

  /* Theme vars */
  useEffect(() => {
    const t = themeStyles[theme];
    const el = containerRef.current;
    if (!el) return;
    Object.entries(t).forEach(([k, v]) => el.style.setProperty(k, v as string));
    el.style.backgroundColor = t["--color-bg1"] as string;
  }, [theme]);

  /* Header height detection for right-edge overlay (fixed to viewport, minus header) */
  const [headerOffset, setHeaderOffset] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const candidates = [
      "[data-top-header]",
      "header.site-header",
      "header",
      ".site-header",
      "[data-header]",
    ];
    const headerEl = document.querySelector<HTMLElement>(candidates.join(", "));

    const measure = () => {
      const h = headerEl ? Math.round(headerEl.getBoundingClientRect().height) : 0;
      setHeaderOffset(h);
    };

    measure();
    window.addEventListener("resize", measure);
    const ro = headerEl ? new ResizeObserver(measure) : null;
    if (ro && headerEl) ro.observe(headerEl);

    return () => {
      window.removeEventListener("resize", measure);
      if (ro) ro.disconnect();
    };
  }, []);

  /* Track viewport width to decide when we are at “laptop” size or larger */
  const [isLaptopViewport, setIsLaptopViewport] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= LAPTOP_BREAKPOINT;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateViewport = () => {
      setIsLaptopViewport(window.innerWidth >= LAPTOP_BREAKPOINT);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  /* Mouse-follow bubble & noise */
  useEffect(() => {
    // Skip mouse tracking on mobile/tablet
    if (isMobileOrTablet) {
      const canvas = noiseCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d")!;
        const paint = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          const img = ctx.createImageData(canvas.width, canvas.height);
          const buf = img.data;
          for (let y = 0; y < canvas.height; y += 2) {
            for (let x = 0; x < canvas.width; x += 2) {
              const i = (y * canvas.width + x) * 4;
              if (Math.random() > 0.2) {
                const s = (Math.random() * 256) | 0;
                buf[i] = buf[i + 1] = buf[i + 2] = s;
                buf[i + 3] = 35;
              }
            }
          }
          ctx.putImageData(img, 0, 0);
        };
        paint();
        const onResize = () => paint();
        window.addEventListener("resize", onResize);
        return () => {
          window.removeEventListener("resize", onResize);
        };
      }
      return;
    }

    // Desktop mouse tracking
    let curX = 0,
      curY = 0,
      tgX = 0,
      tgY = 0;
    let rafId = 0;
    const move = () => {
      if (interBubbleRef.current) {
        curX += (tgX - curX) / 20;
        curY += (tgY - curY) / 20;
        interBubbleRef.current.style.transform = `translate(${Math.round(
          curX
        )}px, ${Math.round(curY)}px)`;
      }
      rafId = requestAnimationFrame(move);
    };
    const onMouse = (e: MouseEvent) => {
      tgX = e.clientX;
      tgY = e.clientY;
    };
    window.addEventListener("mousemove", onMouse);
    move();

    const canvas = noiseCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d")!;
      const paint = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const img = ctx.createImageData(canvas.width, canvas.height);
        const buf = img.data;
        for (let y = 0; y < canvas.height; y += 2) {
          for (let x = 0; x < canvas.width; x += 2) {
            const i = (y * canvas.width + x) * 4;
            if (Math.random() > 0.2) {
              const s = (Math.random() * 256) | 0;
              buf[i] = buf[i + 1] = buf[i + 2] = s;
              buf[i + 3] = 35;
            }
          }
        }
        ctx.putImageData(img, 0, 0);
      };
      paint();
      const onResize = () => paint();
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(rafId);
      };
    }
    return () => {
      window.removeEventListener("mousemove", onMouse);
      cancelAnimationFrame(rafId);
    };
  }, [isMobileOrTablet]);

  /* Helper to make circles */
  const circle = (
    className: string,
    varName: "--color1" | "--color2" | "--color3" | "--color4" | "--color5",
    extra: React.CSSProperties
  ) => (
    <div
      className={className}
      style={{
        position: "absolute",
        width: "var(--circle-size)",
        height: "var(--circle-size)",
        background: `radial-gradient(circle at center, rgba(var(${varName}),0.6) 0%, rgba(var(${varName}),0) 50%) no-repeat`,
        mixBlendMode: "var(--blending)" as React.CSSProperties["mixBlendMode"],
        filter: useSafariMode ? "blur(40px)" : "none",
        ...extra,
      }}
    />
  );

  /* Home page detection & edge visibility based on scroll direction */
  const isHomePage = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.location?.pathname === "/";
  }, []);
  const [edgeVisible, setEdgeVisible] = useState(true);
  const [homeFlowerOpacity, setHomeFlowerOpacity] = useState<number | null>(null);
  const [overlaySuppressed, setOverlaySuppressed] = useState(false);

  useEffect(() => {
    if (!isHomePage) return;

    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const y = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollingDown = y > lastY;
          const atTop = y <= 0;
          // Hide on scroll down; show on scroll up or when at top
          setEdgeVisible(!scrollingDown || atTop);
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOpacity = (event: Event) => {
      const custom = event as CustomEvent<{ value: number | null }>;
      const next = custom.detail.value;
      setHomeFlowerOpacity(next == null ? null : Math.max(0, Math.min(next, 1)));
    };
    window.addEventListener("home-flower-opacity", handleOpacity as EventListener);
    return () => window.removeEventListener("home-flower-opacity", handleOpacity as EventListener);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let hideTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleHide = () => {
      if (hideTimeout) clearTimeout(hideTimeout);
      setOverlaySuppressed(true);
      hideTimeout = setTimeout(() => {
        setOverlaySuppressed(false);
        hideTimeout = null;
      }, 3000);
    };
    window.addEventListener("home-flower-temporary-hide", handleHide);
    return () => {
      if (hideTimeout) clearTimeout(hideTimeout);
      window.removeEventListener("home-flower-temporary-hide", handleHide);
    };
  }, []);

  /* Initial 3s opacity = 0, then allow it to appear */
  const [pastIntroDelay, setPastIntroDelay] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setPastIntroDelay(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const baseOverlayOpacity = useMemo(() => {
    const raw = !pastIntroDelay ? 0 : homeFlowerOpacity ?? (edgeVisible ? 1 : 0);
    return Math.max(0, Math.min(raw, 1));
  }, [pastIntroDelay, homeFlowerOpacity, edgeVisible]);
  const overlayOpacity = overlaySuppressed ? 0 : baseOverlayOpacity;

  return (
    <div
      ref={containerRef}
      className="gradient-bg"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 24,
        overflow: "hidden",
      }}
    >
      {/* noise overlay */}
      <canvas
        ref={noiseCanvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* goo filter for Chrome / Edge / Firefox desktop only */}
      {!useSafariMode && (
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
      )}

      {/* circles container */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: useSafariMode ? "none" : "url(#goo) blur(40px)",
          zIndex: 1,
        }}
      >
        {circle("g1", "--color1", {
          top: "calc(90% - var(--circle-size)/2)",
          left: "calc(90% - var(--circle-size)/2)",
          transformOrigin: "center",
          animation: "moveVertical 30s ease infinite",
          opacity: 0.5,
        })}
        {circle("g2", "--color2", {
          top: "calc(50% - var(--circle-size)/2)",
          left: "calc(50% - var(--circle-size)/2)",
          transformOrigin: "calc(50% - 400px)",
          animation: "moveInCircle 20s reverse infinite",
          opacity: 0.5,
        })}
        {circle("g3", "--color3", {
          top: "calc(50% - var(--circle-size)/2 + 200px)",
          left: "calc(50% - var(--circle-size)/2 - 500px)",
          transformOrigin: "calc(50% + 400px)",
          animation: "moveInCircle 40s linear infinite",
          opacity: 0.5,
        })}
        {circle("g4", "--color4", {
          top: "calc(50% - var(--circle-size)/2)",
          left: "calc(50% - var(--circle-size)/2)",
          transformOrigin: "calc(50% - 200px)",
          animation: "moveHorizontal 40s ease infinite",
          opacity: 0.5,
        })}
        {circle("g5", "--color5", {
          width: "calc(var(--circle-size) * 2)",
          height: "calc(var(--circle-size) * 2)",
          top: "calc(50% - var(--circle-size))",
          left: "calc(50% - var(--circle-size))",
          transformOrigin: "calc(50% - 800px) calc(50% + 200px)",
          animation: "moveInCircle 20s ease infinite",
          opacity: 0.5,
        })}

        {/* mouse-tracked bubble - only render on desktop */}
        {!isMobileOrTablet && (
          <div
            ref={interBubbleRef}
            style={{
              position: "absolute",
              background: `radial-gradient(circle at center, rgba(var(--color-interactive),0.5) 0%, rgba(var(--color-interactive),0) 50%)`,
              mixBlendMode: "var(--blending)" as React.CSSProperties["mixBlendMode"],
              width: "140%",
              height: "140%",
              top: "-70%",
              left: "-70%",
              opacity: 0.6,
              filter: useSafariMode ? "blur(40px)" : "none",
            }}
          />
        )}
      </div>

      {/* === RIGHT-EDGE WHITE SVG ANIMATION OVERLAY (pinned to right edge) === */}
      {(() => {
        const pathname =
          typeof window === "undefined" ? "" : window.location.pathname ?? "";
        const isPortfolioOrCreativePage =
          pathname.startsWith("/portfolio") || pathname.startsWith("/creative");
        const hideForNarrowViewport =
          isPortfolioOrCreativePage && !isLaptopViewport;
        const effectiveOpacity = hideForNarrowViewport ? 0 : overlayOpacity;
        if (effectiveOpacity <= 0) {
          return null;
        }

        return (
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: `${headerOffset}px`,
              right: 0,
              bottom: 0,
              width: "min(420px, 28vw)",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              pointerEvents: "none",
              zIndex: 5,
              paddingRight: 8,
              opacity: effectiveOpacity,
              transition: "opacity 200ms ease",
              willChange: "opacity",
            }}
          >
            <svg
              className="gbg-svg"
              version="1.1"
              viewBox="0 0 123 246"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Path</title>
              <desc>Animated stroke path</desc>
              <g fill="none" fillRule="evenodd">
                <path
                  className="gbg-path"
                  d="m9.9062 245.43c13.174-137.4 46.685-178.94 100.53-124.63-28.198 6.2083-45.074-1.5234-50.629-23.195s-25.401-29.307-59.539-22.906c36.723 27.034 64.646 16.445 83.77-31.766 28.686-72.316-34.465-37.046 0 0 50.863 54.672 50.863 0 0 0-83.77 0-24.23-35.594 0 0 24.23 35.594-19.03 74.584 0 0 18.324-71.816 49.922 7 0 0-54.872-7.6942-24.23 48.168 0 0"
                  fill="none"
                />
              </g>
            </svg>
          </div>
        );
      })()}

      {/* content layer stays above everything */}
      <div style={{ position: "relative", zIndex: 10, height: "100%" }}>
        {children}
      </div>
    </div>
  );
};

export default GradientBackground;
