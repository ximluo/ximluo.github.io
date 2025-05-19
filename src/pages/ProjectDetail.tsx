// components/ProjectDetail.tsx

"use client";

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import projects from "../data/projects";
import NotFound from "./NotFound";

interface ProjectDetailProps {
  theme: "bunny" | "water";
}

// Themes
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
    "--color-text-secondary": "rgba(249, 240, 251, 1)",
    "--color-accent-primary": "rgb(134, 196, 240)",
    "--button-bg": "rgba(214, 235, 251, 0.8)",
    "--button-bg-light": "rgba(214, 220, 251, 0.2)",
    "--button-text": "rgb(46, 80, 192)",
    "--border-color": "rgba(8, 34, 163, 1)",
  },
} as const;

const ProjectDetail: React.FC<ProjectDetailProps> = ({ theme }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const project = projects.find((p) => p.id === projectId);

  // If project not found, show a message and a button to go back
  if (!project) {
    return <NotFound theme={theme} backPath="/portfolio" />;
  }

  const LanguageBadges = () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        marginBottom: "20px",
      }}
    >
      {project.languages.map((lang) => (
        <span
          key={lang}
          style={{
            padding: "5px 10px",
            backgroundColor: themes[theme]["--button-bg-light"],
            color: themes[theme]["--color-text"],
            borderRadius: "15px",
            fontSize: "14px",
          }}
        >
          {lang}
        </span>
      ))}
    </div>
  );

  const renderSectionContent = (
    section: (typeof project.sections)[number],
    idx: number
  ) => {
    if (section.text) {
      return (
        <p key={`txt-${idx}`} style={{ lineHeight: 1.6, marginBottom: "1.2em" }}>
          {section.text}
        </p>
      );
    }

    if (section.video) {
      return (
        <div
          key={`vid-${idx}`}
          style={{
            width: "100%",
            maxWidth: "560px",
            margin: "30px auto",
            aspectRatio: "16/9",
          }}
        >
          <iframe
            width="100%"
            height="100%"
            src={section.video}
            title={`${project.name} demo video`}
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            style={{ borderRadius: "8px" }}
          />
        </div>
      );
    }

    if (section.image) {
      return (
        <div
          key={`img-${idx}`}
          style={{
            width: "100%",
            height: "400px",
            borderRadius: "12px",
            overflow: "hidden",
            margin: "30px 0",
          }}
        >
          <img
            src={section.image}
            alt={`${project.name} screenshot ${idx + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        height: "100%",
        overflow: "auto",
        color: themes[theme]["--color-text"],
        fontFamily: "monospace",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/portfolio")}
        style={{
          padding: "8px 16px",
          backgroundColor: themes[theme]["--button-bg-light"],
          color: themes[theme]["--color-text"],
          border: "none",
          borderRadius: "20px",
          fontFamily: "monospace",
          cursor: "pointer",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          width: "fit-content",
        }}
      >
        ← Back
      </button>

      {/* Title */}
      <h1
        style={{
          color: themes[theme]["--color-accent-primary"],
          marginBottom: "20px",
        }}
      >
        {project.name}
      </h1>

      {/* Tech Chips */}
      <LanguageBadges />

      {/* Hero Thumbnail */}
      {project.image && (
        <div
          style={{
            width: "100%",
            height: "400px",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "30px",
          }}
        >
          <img
            src={project.image}
            alt={`${project.name} hero`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Overview (short description) */}
      <div
        style={{
          backgroundColor:
            theme === "bunny"
              ? "rgba(121, 85, 189, 0.1)"
              : "rgba(8, 34, 163, 0.1)",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "30px",
        }}
      >
        <h3
          style={{
            color: themes[theme]["--color-accent-primary"],
            marginTop: 0,
          }}
        >
          Overview
        </h3>
        <p style={{ lineHeight: 1.6 }}>{project.description}</p>
      </div>

      {/* Rich Sections */}
      {project.sections.map(renderSectionContent)}

      {/* CTA */}
      <div
        style={{
          borderTop: `1px solid ${themes[theme]["--border-color"]}`,
          paddingTop: "20px",
          marginTop: "30px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => navigate("/portfolio")}
          style={{
            padding: "10px 20px",
            backgroundColor: themes[theme]["--button-bg"],
            color: themes[theme]["--button-text"],
            border: "none",
            borderRadius: "20px",
            fontFamily: "monospace",
            cursor: "pointer",
          }}
        >
          View More Projects
        </button>
      </div>
    </div>
  );
};

export default ProjectDetail;
