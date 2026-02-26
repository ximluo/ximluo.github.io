import type React from "react"
import OptimizedImage from "../../components/ui/OptimizedImage"
import useIntersectionOnce from "../../hooks/useIntersectionOnce"
import { DETAIL_IMAGE_SIZES, GIF_LOAD_AHEAD_MARGIN, isGifSource } from "./projectDetail.shared"

interface ProgressiveDetailImageProps {
  src: string
  alt: string
  sizes?: string
  className?: string
  style?: React.CSSProperties
  priority?: boolean
}

const ProgressiveDetailImage: React.FC<ProgressiveDetailImageProps> = ({
  src,
  alt,
  sizes = DETAIL_IMAGE_SIZES,
  className,
  style,
  priority = false,
}) => {
  const isGif = isGifSource(src)
  const { ref, hasIntersected } = useIntersectionOnce<HTMLDivElement>({
    disabled: !isGif,
    initialValue: !isGif,
    rootMargin: GIF_LOAD_AHEAD_MARGIN,
  })

  const shouldAnimateGif = !isGif || hasIntersected

  return (
    <div ref={ref} className={className} style={style}>
      <OptimizedImage
        src={src}
        alt={alt}
        priority={priority}
        preferPosterForGif={isGif && !shouldAnimateGif}
        preferAnimatedGifVariant={isGif && shouldAnimateGif}
        animatedGifVariantTier="detail"
        fetchPriority={isGif && shouldAnimateGif ? "auto" : priority ? "high" : "low"}
        sizes={sizes}
        className="project-detail-image"
      />
    </div>
  )
}

export default ProgressiveDetailImage
