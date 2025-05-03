import React, { useEffect, useRef } from "react";

type ThemeType = "bunny" | "water";

interface GradientBackgroundProps {
  theme: ThemeType;
  children?: React.ReactNode;
}

/* =========================================================
   Theme‑specific variables
   – ⬆ increased --circle-size (120 %)
   – ⬇ lowered radial‑gradient alpha to 0.6 (was 0.8)
   ========================================================= */
const themeStyles = {
  bunny: {
    "--color-bg1": "#ebdbff",          // PURE white when bunny
    "--color-bg2": "#ffffff",
    "--color1": "249,240,251",
    "--color2": "249,240,251",
    "--color3": "226,199,213",
    "--color4": "227, 89, 195",
    "--color5": "249,240,251",
    "--color-interactive": "227, 89, 195",
    "--circle-size": "90%",           // bigger circles
    "--blending": "screen",
  },
  water: {
    "--color-bg1": "#001f3f",          // Deep navy blue
    "--color-bg2": "#001f3f",          // Bright blue
    "--color1": "173, 216, 230",       // Light blue
    "--color2": "0, 116, 217",         // Medium blue
    "--color3": "65, 105, 225",        // Royal blue
    "--color4": "0, 31, 63",           // Dark navy
    "--color5": "135, 206, 235",       // Sky blue
    "--color-interactive": "0,191,255", // Deep sky blue
    "--circle-size": "90%",            // bigger here too
    "--blending": "screen",
  },
} as const;

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  theme,
  children,
}) => {
  const interBubbleRef = useRef<HTMLDivElement>(null);
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---------- apply theme vars + white bg for bunny ---------- */
  useEffect(() => {
    const t = themeStyles[theme];
    const el = containerRef.current;
    if (!el) return;

    Object.entries(t).forEach(([prop, val]) =>
      el.style.setProperty(prop, val as string)
    );

    // set actual background‑color so the white shows through
    el.style.backgroundColor = t["--color-bg1"] as string;
  }, [theme]);

  /* ------------------ interactive bubble + noise ------------- */
  useEffect(() => {
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
        const data = ctx.createImageData(canvas.width, canvas.height);
        const buf = data.data;
        // Adding space between noise by only setting every 8th pixel
        for (let y = 0; y < canvas.height; y += 2) {
          for (let x = 0; x < canvas.width; x += 2) {
            const index = (y * canvas.width + x) * 4;
            if (Math.random() > 0.2) { // Reduce noise density
              const s = Math.random() * 256 | 0;
              buf[index] = buf[index + 1] = buf[index + 2] = s;
              buf[index + 3] = 35;
            }
          }
        }
        ctx.putImageData(data, 0, 0);
      };
      paint();
      window.addEventListener("resize", paint);
      return () => {
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("resize", paint);
      };
    }
    return () => window.removeEventListener("mousemove", onMouse);
  }, []);

  /* --------------------------- render ------------------------ */
  /* helper for repeated circle markup */
  const circle = (className: string, varName: "--color1" | "--color2" | "--color3" | "--color4" | "--color5", extra: React.CSSProperties) => (
    <div
      className={className}
      style={{
        position: "absolute",
        background: `radial-gradient(circle at center, rgba(var(${varName}), 0.6) 0%, rgba(var(${varName}), 0) 50%) no-repeat`,
        mixBlendMode: "var(--blending)" as React.CSSProperties["mixBlendMode"],
        width: "var(--circle-size)",
        height: "var(--circle-size)",
        opacity: 1,
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
      {/* static noise */}
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

      {/* goo filter */}
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

      {/* animated circles */}
      <div
        className="gradients-container"
        style={{
          position: "absolute",
          inset: 0,
          filter: "url(#goo) blur(40px)",
          zIndex: 1,
        }}
      >
        {circle("g1", "--color1", {
          top: "calc(90% - var(--circle-size) / 2)",
          left: "calc(90% - var(--circle-size) / 2)",
          transformOrigin: "center",
          animation: "moveVertical 30s ease infinite",
          opacity: 0.5, // slightly lighter
        })}
        {circle("g2", "--color2", {
          top: "calc(50% - var(--circle-size) / 2)",
          left: "calc(50% - var(--circle-size) / 2)",
          transformOrigin: "calc(50% - 400px)",
          animation: "moveInCircle 20s reverse infinite",
          opacity: 0.5, // slightly lighter
        })}
        {circle("g3", "--color3", {
          top: "calc(50% - var(--circle-size) / 2 + 200px)",
          left: "calc(50% - var(--circle-size) / 2 - 500px)",
          transformOrigin: "calc(50% + 400px)",
          animation: "moveInCircle 40s linear infinite",
          opacity: 0.5, // slightly lighter
        })}
        {circle("g4", "--color4", {
          top: "calc(50% - var(--circle-size) / 2)",
          left: "calc(50% - var(--circle-size) / 2)",
          transformOrigin: "calc(50% - 200px)",
          animation: "moveHorizontal 40s ease infinite",
          opacity: 0.5, // slightly lighter
        })}
        {circle("g5", "--color5", {
          width: "calc(var(--circle-size) * 2)",
          height: "calc(var(--circle-size) * 2)",
          top: "calc(50% - var(--circle-size))",
          left: "calc(50% - var(--circle-size))",
          transformOrigin: "calc(50% - 800px) calc(50% + 200px)",
          animation: "moveInCircle 20s ease infinite",
          opacity: 0.5, // slightly lighter
        })}

        {/* interactive bubble (also a bit lighter) */}
        <div
          ref={interBubbleRef}
          style={{
            position: "absolute",
            background: `radial-gradient(circle at center, rgba(var(--color-interactive), 0.5) 0%, rgba(var(--color-interactive), 0) 50%) no-repeat`,
            mixBlendMode: "var(--blending)" as React.CSSProperties["mixBlendMode"],
            width: "140%",
            height: "140%",
            top: "-70%",
            left: "-70%",
            opacity: 0.6,
          }}
        />
      </div>

      {/* user content */}
      <div style={{ position: "relative", zIndex: 2, height: "100%" }}>
        {children}
      </div>
    </div>
  );
};

export default GradientBackground;