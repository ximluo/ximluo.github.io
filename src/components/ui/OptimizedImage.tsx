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
}

interface ImageManifest {
  generatedAt: string
  widths: number[]
  images: Record<string, ManifestEntry>
}

interface OptimizedImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "loading"> {
  src: string
  alt: string
  priority?: boolean
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
  sizes,
  width,
  height,
  decoding,
  fetchPriority,
  ...imgProps
}) => {
  const normalizedSource = normalizeSourcePath(src)

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

  return (
    <img
      {...imgProps}
      src={src}
      alt={alt}
      srcSet={optimized?.srcSet}
      sizes={sizes ?? (optimized?.srcSet ? "100vw" : undefined)}
      width={width ?? (optimized?.entry.width ?? undefined)}
      height={height ?? (optimized?.entry.height ?? undefined)}
      loading={priority ? "eager" : "lazy"}
      decoding={decoding ?? "async"}
      fetchPriority={fetchPriority ?? (priority ? "high" : "auto")}
    />
  )
}

export default OptimizedImage
