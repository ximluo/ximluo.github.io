import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { scrambleText } from "../../utils/scramble";
import { type ThemeType } from "../../theme/tokens";

interface NotFoundProps {
  theme: ThemeType;
  backPath?: string;
}

const NotFound: React.FC<NotFoundProps> = ({ theme, backPath = "/" }) => {
  const [fadeIn, setFadeIn] = useState<boolean>(false);
  const [glitchText, setGlitchText] = useState<string>("404");
  const [messageText, setMessageText] = useState<string>("PAGE NOT FOUND");

  const scrambleEffect = useCallback((): void => {
    const glitchSet = theme === "bunny" ? "code" : "matrix";
    void scrambleText("404", glitchSet, setGlitchText, 30);

    const messageSet = theme === "bunny" ? "symbols" : "code";
    setTimeout(() => {
      void scrambleText("PAGE NOT FOUND", messageSet, setMessageText, 25);
    }, 300);
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeIn(true);
      scrambleEffect();
    }, 200);
    return () => clearTimeout(timer);
  }, [scrambleEffect]);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        scrambleEffect();
      }
    }, 4000);
    return () => clearInterval(glitchInterval);
  }, [scrambleEffect]);

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
