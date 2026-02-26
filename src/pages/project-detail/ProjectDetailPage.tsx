// components/ProjectDetail.tsx

"use client";

import React, { JSX, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProjectDetail.css";
import projects from "../../data/projects";
import NotFound from "../not-found/NotFoundPage";
import { CONTENT_THEME_TOKENS, type ThemeType } from "../../theme/tokens";
import OptimizedImage from "../../components/ui/OptimizedImage";

interface ProjectDetailProps {
  theme: ThemeType;
}

const DETAIL_IMAGE_SIZES = "(max-width: 840px) calc(100vw - 40px), 800px";
const DETAIL_EMBED_MAX_WIDTH = "600px";
const GIF_LOAD_AHEAD_MARGIN = "650px 0px";
const VIDEO_EMBED_LOAD_AHEAD_MARGIN = "900px 0px";
const PDF_EMBED_LOAD_AHEAD_MARGIN = "800px 0px";
const preconnectedEmbedOrigins = new Set<string>();

function isPdfSource(source: string) {
  return /\.pdf(?:$|[?#])/i.test(source);
}

function isGifSource(source: string) {
  return /\.gif(?:$|[?#])/i.test(source);
}

function preconnectToEmbedOrigin(source: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  let url: URL;
  try {
    url = new URL(source, window.location.href);
  } catch {
    return;
  }

  if (url.origin === window.location.origin || preconnectedEmbedOrigins.has(url.origin)) {
    return;
  }

  preconnectedEmbedOrigins.add(url.origin);

  const dnsPrefetch = document.createElement("link");
  dnsPrefetch.rel = "dns-prefetch";
  dnsPrefetch.href = url.origin;
  document.head.appendChild(dnsPrefetch);

  const preconnect = document.createElement("link");
  preconnect.rel = "preconnect";
  preconnect.href = url.origin;
  preconnect.crossOrigin = "";
  document.head.appendChild(preconnect);
}

// Helper to turn Markdown-style [label](url) and raw URLs into <a> tags
function parseTextWithLinks(text: string) {
  const elements: (string | JSX.Element)[] = [];
  // Regex matches either [label](url) or raw http(s)://… URLs
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = linkRegex.exec(text)) !== null) {
    const [fullMatch, mdLabel, mdUrl, rawUrl] = match;
    const index = match.index;

    // push any text before this match
    if (lastIndex < index) {
      elements.push(text.slice(lastIndex, index));
    }

    // determine which link form matched
    const url = mdUrl || rawUrl!;
    const label = mdLabel || rawUrl!;

    elements.push(
      <a
        key={key++}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "inherit", textDecoration: "underline" }}
      >
        {label}
      </a>
    );

    lastIndex = index + fullMatch.length;
  }

  // push remaining text
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements;
}

interface DeferredEmbedProps {
  src: string;
  title: string;
  theme: ThemeType;
}

interface ProgressiveDetailImageProps {
  src: string;
  alt: string;
  sizes: string;
  style: React.CSSProperties;
  priority?: boolean;
}

const ProgressiveDetailImage: React.FC<ProgressiveDetailImageProps> = ({
  src,
  alt,
  sizes,
  style,
  priority = false,
}) => {
  const isGif = isGifSource(src);
  const [shouldAnimateGif, setShouldAnimateGif] = useState(!isGif);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isGif || shouldAnimateGif) return;

    const node = wrapperRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldAnimateGif(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldAnimateGif(true);
          observer.disconnect();
        }
      },
      { rootMargin: GIF_LOAD_AHEAD_MARGIN }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isGif, shouldAnimateGif]);

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%" }}>
      <OptimizedImage
        src={src}
        alt={alt}
        priority={priority}
        preferPosterForGif={isGif && !shouldAnimateGif}
        preferAnimatedGifVariant={isGif && shouldAnimateGif}
        animatedGifVariantTier="detail"
        fetchPriority={isGif && shouldAnimateGif ? "auto" : priority ? "high" : "low"}
        sizes={sizes}
        style={style}
      />
    </div>
  );
};

const DeferredEmbed: React.FC<DeferredEmbedProps> = ({ src, title, theme }) => {
  const [shouldLoadEmbed, setShouldLoadEmbed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPdf = isPdfSource(src);
  const themeTokens = CONTENT_THEME_TOKENS[theme];

  useEffect(() => {
    preconnectToEmbedOrigin(src);
  }, [src]);

  useEffect(() => {
    if (shouldLoadEmbed) return;

    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoadEmbed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadEmbed(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: isPdf ? PDF_EMBED_LOAD_AHEAD_MARGIN : VIDEO_EMBED_LOAD_AHEAD_MARGIN,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isPdf, shouldLoadEmbed]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: DETAIL_EMBED_MAX_WIDTH,
        margin: "30px auto",
        aspectRatio: isPdf ? "4 / 3" : "16 / 9",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor:
          theme === "bunny" ? "rgba(121, 85, 189, 0.08)" : "rgba(8, 34, 163, 0.08)",
        border: `1px solid ${themeTokens["--border-color"]}`,
        contentVisibility: "auto",
        containIntrinsicSize: isPdf ? "480px" : "338px",
      }}
    >
      {shouldLoadEmbed ? (
        <iframe
          width="100%"
          height="100%"
          src={src}
          loading="eager"
          title={title}
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{ border: "none" }}
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            style={{
              width: "100%",
              height: "100%",
              background:
                theme === "bunny"
                  ? "linear-gradient(120deg, rgba(121, 85, 189, 0.06), rgba(121, 85, 189, 0.14), rgba(121, 85, 189, 0.06))"
                  : "linear-gradient(120deg, rgba(8, 34, 163, 0.05), rgba(8, 34, 163, 0.12), rgba(8, 34, 163, 0.05))",
            }}
          />
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "absolute",
              right: "12px",
              bottom: "12px",
              padding: "6px 10px",
              backgroundColor: themeTokens["--button-bg-light"],
              color: themeTokens["--color-text"],
              borderRadius: "16px",
              textDecoration: "none",
              fontFamily: "monospace",
              fontSize: "12px",
              border: `1px solid ${themeTokens["--border-color"]}`,
            }}
          >
            {isPdf ? "Open PDF" : "Open"}
          </a>
        </>
      )}
    </div>
  );
};

const ProjectDetail: React.FC<ProjectDetailProps> = ({ theme }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const themes = CONTENT_THEME_TOKENS;

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
          {parseTextWithLinks(section.text)}
        </p>
      );
    }

    if (section.video) {
      if (isPdfSource(section.video)) {
        return null;
      }

      return (
        <DeferredEmbed
          key={`vid-${idx}`}
          src={section.video}
          title={`${project.name} ${isPdfSource(section.video) ? "PDF preview" : "demo video"}`}
          theme={theme}
        />
      );
    }

    if (section.image) {
      return (
        <div
          key={`img-${idx}`}
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: "12px",
            overflow: "hidden",
            margin: "30px 0",
            contentVisibility: "auto",
            containIntrinsicSize: "360px",
          }}
        >
          <ProgressiveDetailImage
            src={section.image}
            alt={`${project.name} screenshot ${idx + 1}`}
            sizes={DETAIL_IMAGE_SIZES}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="project-detail-container"
      style={{
        width: "100%",
        height: "100%",
        padding: "20px",
        boxSizing: "border-box",
        overflow: "auto",
        ["--project-detail-scrollbar-thumb" as string]: themes[theme]["--button-bg"],
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
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
              aspectRatio: "16 / 9",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "30px",
            }}
          >
            <ProgressiveDetailImage
              src={project.image}
              alt={`${project.name} hero`}
              priority
              sizes={DETAIL_IMAGE_SIZES}
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

    </div>
  );
};

export default ProjectDetail;
