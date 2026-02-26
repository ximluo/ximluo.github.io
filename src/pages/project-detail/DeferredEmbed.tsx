import { useEffect } from "react"
import useIntersectionOnce from "../../hooks/useIntersectionOnce"
import { CONTENT_THEME_TOKENS, THEME_VISUAL_TOKENS, type ThemeType } from "../../theme/tokens"
import {
  PDF_EMBED_LOAD_AHEAD_MARGIN,
  VIDEO_EMBED_LOAD_AHEAD_MARGIN,
  isPdfSource,
  preconnectToEmbedOrigin,
} from "./projectDetail.shared"

interface DeferredEmbedProps {
  src: string
  title: string
  theme: ThemeType
}

const DeferredEmbed = ({ src, title, theme }: DeferredEmbedProps) => {
  const isPdf = isPdfSource(src)
  const themeTokens = CONTENT_THEME_TOKENS[theme]
  const visualTokens = THEME_VISUAL_TOKENS[theme]
  const { ref, hasIntersected: shouldLoadEmbed } = useIntersectionOnce<HTMLDivElement>({
    rootMargin: isPdf ? PDF_EMBED_LOAD_AHEAD_MARGIN : VIDEO_EMBED_LOAD_AHEAD_MARGIN,
  })

  useEffect(() => {
    preconnectToEmbedOrigin(src)
  }, [src])

  return (
    <div
      ref={ref}
      className={`project-detail-embed ${isPdf ? "project-detail-embed--pdf" : "project-detail-embed--video"}`}
      style={{
        ["--project-detail-embed-surface" as string]: visualTokens.surfaceProjectEmbed,
        ["--project-detail-embed-skeleton" as string]: visualTokens.projectEmbedSkeletonGradient,
        ["--project-detail-border" as string]: themeTokens["--border-color"],
        ["--project-detail-button-bg-light" as string]: themeTokens["--button-bg-light"],
        ["--project-detail-text" as string]: themeTokens["--color-text"],
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
          className="project-detail-embed-frame"
        />
      ) : (
        <>
          <div aria-hidden="true" className="project-detail-embed-skeleton" />
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="project-detail-embed-open"
          >
            {isPdf ? "Open PDF" : "Open"}
          </a>
        </>
      )}
    </div>
  )
}

export default DeferredEmbed
