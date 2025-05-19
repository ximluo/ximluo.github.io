import React, { useEffect, useRef, useMemo } from "react";

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
    return (
      /Android/i.test(ua) ||
      /webOS/i.test(ua) ||
      /iPhone/i.test(ua) ||
      /iPad/i.test(ua) ||
      /iPod/i.test(ua) ||
      /BlackBerry/i.test(ua) ||
      /Windows Phone/i.test(ua) ||
      /Tablet/i.test(ua) ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );
  }, []);

  const useSafariMode = isSafari || isMobileOrTablet;

  const containerRef = useRef<HTMLDivElement>(null);
  const interBubbleRef = useRef<HTMLDivElement>(null);
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null);

  /* apply theme vars */
  useEffect(() => {
    const t = themeStyles[theme];
    const el = containerRef.current;
    if (!el) return;
    Object.entries(t).forEach(([k, v]) => el.style.setProperty(k, v));
    el.style.backgroundColor = t["--color-bg1"] as string;
  }, [theme]);

  /* mouse-follow bubble & noise */
  useEffect(() => {
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
        window.addEventListener("resize", paint);
        return () => {
          window.removeEventListener("resize", paint);
        };
      }
      return;
    }

    let curX = 0,
      curY = 0,
      tgX = 0,
      tgY = 0;
    const move = () => {
      if (interBubbleRef.current) {
        curX += (tgX - curX) / 20;
        curY += (tgY - curY) / 20;
        interBubbleRef.current.style.transform = `translate(${Math.round(
          curX
        )}px, ${Math.round(curY)}px)`;
      }
      requestAnimationFrame(move);
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
      window.addEventListener("resize", paint);
      return () => {
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("resize", paint);
      };
    }

    return () => window.removeEventListener("mousemove", onMouse);
  }, [isMobileOrTablet]);

  /* helper to make circles */
  const circle = (
    className: string,
    varName:
      | "--color1"
      | "--color2"
      | "--color3"
      | "--color4"
      | "--color5",
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

      {/* updated particle effect */}
      <ParticleCanvas theme={theme} />

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

      <div style={{ position: "relative", zIndex: 2, height: "100%" }}>
        {children}
      </div>
    </div>
  );
};

export default GradientBackground;


// Particle canvas
interface ParticleCanvasProps {
  theme: ThemeType;
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    interface Particle {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
    }

    const MAX = 80; 
    const particles: Particle[] = [];

  
    for (let i = 0; i < MAX; i++) {
      const size = Math.random() * 8;
      particles.push({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + Math.random() * 100,
        size,
        speed: 0.2 + Math.random() * 0.6,   
        opacity: 0.1 + Math.random() * 0.2, 
      });
    }

    let rafId: number;
    const draw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // choose color by theme
        const color =
          theme === "water"
            ? `hsla(180,100%,80%,${p.opacity})`
            : `hsla(0, 0%, 100%, ${0})`;

        const grad = ctx.createRadialGradient(
          p.x,
          p.y,
          p.size * 0.1,
          p.x,
          p.y,
          p.size
        );
        grad.addColorStop(0, color);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // move upward
        p.y -= p.speed;
        if (p.y < -p.size) {
          p.y = canvas.height + p.size;
          p.x = Math.random() * canvas.width;
        }
      });

      rafId = requestAnimationFrame(draw);
    };

    draw();

    // only adjust canvas size on resize, don't reinit particles
    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0.5,
      }}
    />
  );
};
