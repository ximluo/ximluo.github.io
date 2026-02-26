import React, { useMemo } from "react"
import manifest from "../../generated/imageManifest.json"

interface ImageVariant {
  src: string
  w: number
  type: string
}

interface ManifestEntry {
  width: number | null
  height: number | null
  variants: ImageVariant[]
  poster?: {
    src: string
    w: number
    type: string
  } | null
  animated?: {
    src: string
    w: number
    type: string
  } | null
  animatedDetail?: {
    src: string
    w: number
    type: string
  } | null
}

interface ImageManifest {
  generatedAt: string
  widths: number[]
  images: Record<string, ManifestEntry>
}

interface OptimizedImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "loading"
> {
  src: string
  alt: string
  priority?: boolean
  preferPosterForGif?: boolean
  preferAnimatedGifVariant?: boolean
  animatedGifVariantTier?: "thumb" | "detail"
}

const imageManifest = manifest as ImageManifest

function normalizeSourcePath(source: string): string {
  const base = source.split("#")[0].split("?")[0]

  if (base.startsWith("http://") || base.startsWith("https://")) {
    try {
      const url = new URL(base)
      return url.pathname || base
    } catch {
      return base
    }
  }

  const publicPrefix = process.env.PUBLIC_URL || ""
  if (publicPrefix && base.startsWith(publicPrefix)) {
    const stripped = base.slice(publicPrefix.length)
    return stripped.startsWith("/") ? stripped : `/${stripped}`
  }

  return base.startsWith("/") ? base : `/${base}`
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
  const normalizedSource = normalizeSourcePath(src)
  const isGifSource = normalizedSource.toLowerCase().endsWith(".gif")

  const optimized = useMemo(() => {
    const entry = imageManifest.images[normalizedSource]
    if (!entry) return null
    const webpVariants = entry.variants
      .filter((variant) => variant.type === "image/webp")
      .sort((a, b) => a.w - b.w)
    return {
      entry,
      srcSet: webpVariants.length
        ? webpVariants.map((variant) => `${variant.src} ${variant.w}w`).join(", ")
        : undefined,
    }
  }, [normalizedSource])

  const shouldUsePoster = Boolean(preferPosterForGif && isGifSource && optimized?.entry.poster?.src)
  const preferredAnimatedGifVariant =
    animatedGifVariantTier === "detail"
      ? (optimized?.entry.animatedDetail ?? optimized?.entry.animated)
      : optimized?.entry.animated
  const shouldUseAnimatedGifVariant = Boolean(
    !shouldUsePoster && preferAnimatedGifVariant && isGifSource && preferredAnimatedGifVariant?.src,
  )
  const resolvedSrc = shouldUsePoster
    ? (optimized?.entry.poster?.src ?? src)
    : shouldUseAnimatedGifVariant
      ? (preferredAnimatedGifVariant?.src ?? src)
      : src
  const resolvedSrcSet = shouldUsePoster ? undefined : optimized?.srcSet
  const resolvedSizes = shouldUsePoster
    ? undefined
    : (sizes ?? (resolvedSrcSet ? "100vw" : undefined))

  return (
    <img
      {...imgProps}
      src={resolvedSrc}
      alt={alt}
      srcSet={resolvedSrcSet}
      sizes={resolvedSizes}
      width={width ?? optimized?.entry.width ?? undefined}
      height={height ?? optimized?.entry.height ?? undefined}
      loading={priority ? "eager" : "lazy"}
      decoding={decoding ?? "async"}
      fetchPriority={fetchPriority ?? (priority ? "high" : "auto")}
    />
  )
}

export default OptimizedImage
