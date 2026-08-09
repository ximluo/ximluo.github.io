import React from "react"
import imageManifest from "../../generated/imageManifest.json"

interface ManifestEntry {
  static?: { avif?: number[]; webp?: number[] }
  poster?: number[]
  animatedThumb?: number[]
  animatedDetail?: number[]
  w?: number
  h?: number
}

const MANIFEST = imageManifest as Record<string, ManifestEntry>
const OPTIMIZED_BASE = `${process.env.PUBLIC_URL ?? ""}/optimized/images`

// Only /images/{name}.{ext} sources have optimized variants; anything else
// (placeholder.svg, PDFs, external URLs) renders as a plain <img>.
const SOURCE_PATTERN = /^\/images\/([^/]+)\.(png|jpe?g|gif|webp)$/i

interface OptimizedImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "alt" | "loading"
> {
  src: string
  alt: string
  priority?: boolean
  preferPosterForGif?: boolean
  preferAnimatedGifVariant?: boolean
  animatedGifVariantTier?: "thumb" | "detail"
}

function variantUrl(base: string, suffix: string, width: number, format: string) {
  return `${OPTIMIZED_BASE}/${base}${suffix}-${width}w.${format}`
}

function buildSrcSet(base: string, suffix: string, widths: number[], format: string) {
  return widths.map((width) => `${variantUrl(base, suffix, width, format)} ${width}w`).join(", ")
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  priority = false,
  preferPosterForGif = false,
  preferAnimatedGifVariant = false,
  animatedGifVariantTier = "thumb",
  sizes,
  width,
  height,
  decoding,
  fetchPriority,
  ...imgProps
}) => {
  const sourceMatch = SOURCE_PATTERN.exec(src)
  const base = sourceMatch?.[1]
  const isGif = sourceMatch?.[2]?.toLowerCase() === "gif"
  const entry = base ? MANIFEST[base] : undefined

  const sharedImgProps = {
    ...imgProps,
    width: width ?? entry?.w,
    height: height ?? entry?.h,
    loading: (priority ? "eager" : "lazy") as "eager" | "lazy",
    decoding: decoding ?? ("async" as const),
    fetchPriority: fetchPriority ?? (priority ? ("high" as const) : ("auto" as const)),
  }

  if (base && entry && isGif) {
    if (preferAnimatedGifVariant) {
      const useDetail =
        animatedGifVariantTier === "detail"
          ? Boolean(entry.animatedDetail?.length)
          : !entry.animatedThumb?.length && Boolean(entry.animatedDetail?.length)
      const widths = useDetail ? entry.animatedDetail : entry.animatedThumb
      if (widths?.length) {
        const suffix = useDetail ? "-animated-detail" : "-animated"
        return (
          <img
            {...sharedImgProps}
            alt={alt}
            src={variantUrl(base, suffix, widths[widths.length - 1], "webp")}
            srcSet={buildSrcSet(base, suffix, widths, "webp")}
            sizes={sizes}
          />
        )
      }
    }
    if (preferPosterForGif && entry.poster?.length) {
      return (
        <img
          {...sharedImgProps}
          alt={alt}
          src={variantUrl(base, "-poster", entry.poster[entry.poster.length - 1], "webp")}
        />
      )
    }
  }

  if (base && entry?.static && !isGif) {
    const { avif, webp } = entry.static
    return (
      // display:contents keeps the img's containing block unchanged (e.g. height:100% frames)
      <picture style={{ display: "contents" }}>
        {avif?.length ? (
          <source type="image/avif" srcSet={buildSrcSet(base, "", avif, "avif")} sizes={sizes} />
        ) : null}
        {webp?.length ? (
          <source type="image/webp" srcSet={buildSrcSet(base, "", webp, "webp")} sizes={sizes} />
        ) : null}
        <img {...sharedImgProps} alt={alt} src={src} sizes={sizes} />
      </picture>
    )
  }

  return <img {...sharedImgProps} alt={alt} src={src} sizes={sizes} />
}

export default OptimizedImage
