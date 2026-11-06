import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, Play } from 'lucide-react'
import { uploadSiblingUrl } from '@/utils/uploadMedia'
import { useTranslation } from '@/i18n/useTranslation'
import styles from './ProductGallery.module.scss'

interface ProductGalleryProps {
  images: string[]
  /** Shown as the last slide, after the photos. */
  video?: string
  productName: string
  activeIndex?: number
  onActiveIndexChange?: (index: number) => void
  captions?: Array<{ title?: string; price?: string; outOfStock?: boolean } | undefined>
  inWishlist?: boolean
  wishlistLabel?: string
  onWishlistToggle?: () => void
}

const SWIPE_THRESHOLD = 48

function ThumbImage({ src, alt }: { src: string; alt: string }) {
  const thumb = uploadSiblingUrl(src, 'thumb')
  const [current, setCurrent] = useState(thumb ?? src)

  useEffect(() => {
    setCurrent(thumb ?? src)
  }, [src, thumb])

  return (
    <img
      src={current}
      alt={alt}
      draggable={false}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (current !== src) setCurrent(src)
      }}
    />
  )
}

function VideoThumb({ src }: { src: string }) {
  const poster = uploadSiblingUrl(src, 'poster')
  return (
    <>
      {poster ? (
        <img src={poster} alt="" draggable={false} loading="lazy" decoding="async" />
      ) : (
        <span className={styles.videoThumbFallback} />
      )}
      <span className={styles.playBadge} aria-hidden="true">
        <Play size={16} fill="currentColor" />
      </span>
    </>
  )
}

export function ProductGallery({
  images,
  video,
  productName,
  activeIndex: activeIndexProp,
  onActiveIndexChange,
  captions,
  inWishlist = false,
  wishlistLabel,
  onWishlistToggle,
}: ProductGalleryProps) {
  const { t } = useTranslation()
  const [internalIndex, setInternalIndex] = useState(0)
  const thumbsRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isSwiping = useRef(false)

  const slideCount = images.length + (video ? 1 : 0)
  const videoIndex = video ? images.length : -1
  const hasMultiple = slideCount > 1
  const lastIndex = Math.max(0, slideCount - 1)
  const isControlled = activeIndexProp != null
  const activeIndex = Math.max(0, Math.min(isControlled ? activeIndexProp : internalIndex, lastIndex))
  const showingVideo = activeIndex === videoIndex

  const goTo = useCallback((index: number) => {
    const next = Math.max(0, Math.min(index, lastIndex))
    if (!isControlled) setInternalIndex(next)
    onActiveIndexChange?.(next)
  }, [isControlled, lastIndex, onActiveIndexChange])

  const goPrev = useCallback(() => {
    goTo(activeIndex === 0 ? lastIndex : activeIndex - 1)
  }, [activeIndex, lastIndex, goTo])

  const goNext = useCallback(() => {
    goTo(activeIndex === lastIndex ? 0 : activeIndex + 1)
  }, [activeIndex, lastIndex, goTo])

  useEffect(() => {
    if (!isControlled && internalIndex > lastIndex) setInternalIndex(lastIndex)
  }, [isControlled, internalIndex, lastIndex])

  useEffect(() => {
    // Scroll only the thumbnail strip itself. scrollIntoView would also scroll the page
    // vertically, which dragged the product page down on mobile right after opening it.
    const strip = thumbsRef.current
    const thumb = strip?.children[activeIndex] as HTMLElement | undefined
    if (!strip || !thumb) return
    const stripRect = strip.getBoundingClientRect()
    const thumbRect = thumb.getBoundingClientRect()
    const left =
      strip.scrollLeft + (thumbRect.left - stripRect.left) - (stripRect.width - thumbRect.width) / 2
    strip.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [activeIndex])

  useEffect(() => {
    if (!hasMultiple) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasMultiple, goPrev, goNext])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isSwiping.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current)
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
    if (dx > dy && dx > 10) isSwiping.current = true
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwiping.current) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) >= SWIPE_THRESHOLD) {
      if (diff > 0) goNext()
      else goPrev()
    }
  }

  return (
    <div className={styles.gallery}>
      <div
        className={styles.mainWrapper}
        onTouchStart={hasMultiple ? handleTouchStart : undefined}
        onTouchMove={hasMultiple ? handleTouchMove : undefined}
        onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
      >
        <AnimatePresence mode="wait" initial={false}>
          {showingVideo && video ? (
            <motion.video
              key={video}
              src={video}
              poster={uploadSiblingUrl(video, 'poster') ?? undefined}
              className={styles.mainVideo}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              controls
              playsInline
              preload="auto"
            />
          ) : (
            <motion.img
              key={images[activeIndex]}
              src={images[activeIndex]}
              alt={t('productGallery.photoAlt', { name: productName, n: activeIndex + 1 })}
              className={styles.mainImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              draggable={false}
              fetchPriority="high"
            />
          )}
        </AnimatePresence>

        {onWishlistToggle && !showingVideo && (
          <button
            type="button"
            className={[styles.wishlistBtn, inWishlist ? styles.wishlistActive : ''].filter(Boolean).join(' ')}
            onClick={(event) => {
              event.stopPropagation()
              onWishlistToggle()
            }}
            onTouchStart={(event) => event.stopPropagation()}
            aria-label={wishlistLabel}
            aria-pressed={inWishlist}
          >
            <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              className={[styles.navBtn, styles.navPrev].join(' ')}
              onClick={goPrev}
              aria-label={t('productGallery.prev')}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className={[styles.navBtn, styles.navNext].join(' ')}
              onClick={goNext}
              aria-label={t('productGallery.next')}
            >
              <ChevronRight size={22} />
            </button>
            {!showingVideo && (
              <span className={styles.counter}>
                {activeIndex + 1} / {slideCount}
              </span>
            )}
          </>
        )}
      </div>

      {hasMultiple && (
        <>
          <div className={styles.dots} role="tablist" aria-label={t('productGallery.tabsAria')}>
            {Array.from({ length: slideCount }, (_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                className={[styles.dot, activeIndex === index ? styles.dotActive : ''].filter(Boolean).join(' ')}
                onClick={() => goTo(index)}
                aria-label={
                  index === videoIndex
                    ? t('productGallery.video')
                    : t('productGallery.photo', { n: index + 1 })
                }
                aria-selected={activeIndex === index}
              />
            ))}
          </div>

          <div className={styles.thumbs} ref={thumbsRef}>
            {images.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                className={[styles.thumb, activeIndex === index ? styles.thumbActive : ''].filter(Boolean).join(' ')}
                onClick={() => goTo(index)}
                aria-label={t('productGallery.photo', { n: index + 1 })}
                aria-current={activeIndex === index}
              >
                <ThumbImage
                  src={src}
                  alt={t('productGallery.thumbnailAlt', { name: productName, n: index + 1 })}
                />
                {captions?.[index]?.title && (
                  <span className={styles.thumbCaption}>{captions[index]?.title}</span>
                )}
              </button>
            ))}
            {video && (
              <button
                type="button"
                className={[styles.thumb, showingVideo ? styles.thumbActive : ''].filter(Boolean).join(' ')}
                onClick={() => goTo(videoIndex)}
                aria-label={t('productGallery.video')}
                aria-current={showingVideo}
              >
                <VideoThumb src={video} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
