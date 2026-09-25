import { cn } from "cn"
import { useState } from "react"

import { LogoMark } from "@/components/brand/Logo"
import type { components } from "@/lib/api/schema"

type ImageSizes = components["schemas"]["ImageSizes"]

type DrinkImageProps = {
  name: string
  image: string | null
  images?: ImageSizes | null
  /** CSS sizes hint so the browser picks the right width. */
  sizes?: string
  className?: string
  priority?: boolean
}

/** Drink photo with responsive sizes (Cloudinary: 200/350/500 px, WebP/AVIF) and a fallback. */
export function DrinkImage({
  name,
  image,
  images,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  className,
  priority = false,
}: DrinkImageProps) {
  const [failed, setFailed] = useState(false)
  const src = images?.medium ?? image

  if (!src || failed) {
    return (
      <div
        className={cn(
          "grid place-items-center bg-gradient-to-br from-plum to-night text-amber",
          className
        )}
        role="img"
        aria-label={name}
      >
        <LogoMark className="size-1/3 text-white/70" />
      </div>
    )
  }

  return (
    <img
      src={src}
      srcSet={
        images
          ? `${images.small} 200w, ${images.medium} 350w, ${images.large} 500w`
          : undefined
      }
      sizes={images ? sizes : undefined}
      alt={name}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      onError={() => setFailed(true)}
      className={cn("bg-muted object-cover", className)}
    />
  )
}
