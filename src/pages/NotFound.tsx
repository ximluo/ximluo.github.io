import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface NotFoundProps {
  theme: "bunny" | "water";
  backPath?: string;
}

const NotFound: React.FC<NotFoundProps> = ({ theme, backPath = "/" }) => {
  const [fadeIn, setFadeIn] = useState<boolean>(false);
  const [glitchText, setGlitchText] = useState<string>("404");
  const [messageText, setMessageText] = useState<string>("PAGE NOT FOUND");

  // Scramble text effect using the existing scramble function
  const scrambleEffect = (): void => {
    const scrambleSets: Record<
      "japanese" | "binary" | "symbols" | "matrix" | "code",
      string
    > = {
      japanese: "!@#$%^&*?<>/",
      binary: "01",
      symbols: "!<>-_\\/[]{}=+*^?#",
      matrix: "!@#$%^&*?<>/",
      code: "{([/\\])}@#$%^&*<>+=",
    };

    const scramble = (
      target: string,
      setKey: keyof typeof scrambleSets,
      steps: number = 15
    ): void => {
      let frame = 0;
      const chars = scrambleSets[setKey];
      let out = Array.from(target);

      const tick = (): void => {
        out = out.map((c, i) =>
          frame >= steps
            ? target[i]
            : Math.random() < frame / steps
              ? target[i]
              : chars[Math.floor(Math.random() * chars.length)]
        );

        setGlitchText(out.join(""));

        frame++;
        if (frame <= steps) requestAnimationFrame(tick);
      };

      tick();
    };

    // Apply scramble effect based on theme
    const glitchSet: keyof typeof scrambleSets = theme === "bunny" ? "code" : "matrix";
    scramble("404", glitchSet, 30);

    // Also scramble the message
    const messageSet: keyof typeof scrambleSets = theme === "bunny" ? "symbols" : "code";
    setTimeout(() => {
      const message = "PAGE NOT FOUND";
      let msgFrame = 0;
      const msgSteps = 25;
      const msgChars = scrambleSets[messageSet];

      const messageTick = (): void => {
        const out = Array.from(message).map((c, i) =>
          msgFrame >= msgSteps
            ? message[i]
            : Math.random() < msgFrame / msgSteps
              ? message[i]
              : msgChars[Math.floor(Math.random() * msgChars.length)]
        );

        setMessageText(out.join(""));

        msgFrame++;
        if (msgFrame <= msgSteps) requestAnimationFrame(messageTick);
      };

      messageTick();
    }, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
      scrambleEffect();
    }, 200);
    return () => clearTimeout(timer);
  }, [theme]);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        scrambleEffect();
      }
    }, 4000);
    return () => clearInterval(glitchInterval);
  }, [theme]);

  return (
    <div
      className={`fade ${fadeIn ? "show" : ""}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        padding: "20px",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "clamp(80px, 20vw, 180px)",
          fontWeight: "bold",
          marginBottom: "20px",
          fontFamily: "monospace",
          position: "relative",
          color: theme === "bunny" ? "rgb(223, 30, 155)" : "rgb(134, 196, 240)",
          textShadow:
            theme === "bunny"
              ? "0 0 10px rgba(223, 30, 155, 0.8)"
              : "0 0 10px rgba(134, 196, 240, 0.8)",
        }}
      >
        {glitchText}
      </div>

      <div
        style={{
          fontSize: "clamp(18px, 5vw, 24px)",
          fontFamily: "monospace",
          marginBottom: "40px",
          fontWeight: "bold",
          color: theme === "bunny" ? "rgb(121, 85, 189)" : "rgb(191, 229, 249)",
          letterSpacing: "0.1em",
        }}
      >
        {messageText}
      </div>

      <Link
        to={backPath}
        style={{
          padding: "10px 25px",
          fontSize: "16px",
          fontFamily: "monospace",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          backgroundColor:
            theme === "bunny"
              ? "rgba(223, 30, 155, 0.8)"
              : "rgba(214, 235, 251, 0.8)",
          color:
            theme === "bunny"
              ? "rgba(249, 240, 251, 1)"
              : "rgb(46, 80, 192)",
          border: "none",
          outline: "none",
          borderRadius: "20px",
          cursor: "pointer",
          textDecoration: "none",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          boxShadow:
            theme === "bunny"
              ? "0 0 15px rgba(223, 30, 155, 0.4)"
              : "0 0 15px rgba(134, 196, 240, 0.4)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow =
            theme === "bunny"
              ? "0 0 20px rgba(223, 30, 155, 0.6)"
              : "0 0 20px rgba(134, 196, 240, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow =
            theme === "bunny"
              ? "0 0 15px rgba(223, 30, 155, 0.4)"
              : "0 0 15px rgba(134, 196, 240, 0.4)";
        }}
      >
        {backPath === "/portfolio" ? "Back to Portfolio" : "Back to Home"}
      </Link>
    </div>
  );
};

export default NotFound;
