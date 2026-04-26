import React from "react"

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
  void preferPosterForGif
  void preferAnimatedGifVariant
  void animatedGifVariantTier

  return (
    <img
      {...imgProps}
      src={src}
      alt={alt}
      sizes={sizes}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={decoding ?? "async"}
      fetchPriority={fetchPriority ?? (priority ? "high" : "auto")}
    />
  )
}

export default OptimizedImage
