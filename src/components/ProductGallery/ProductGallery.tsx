import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'
import styles from './ProductGallery.module.scss'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

const SWIPE_THRESHOLD = 48

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const thumbsRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isSwiping = useRef(false)

  const hasMultiple = images.length > 1
  const lastIndex = images.length - 1

  const goTo = useCallback((index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, lastIndex)))
  }, [lastIndex])

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? lastIndex : i - 1))
  }, [lastIndex])

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i === lastIndex ? 0 : i + 1))
  }, [lastIndex])

  useEffect(() => {
    const thumb = thumbsRef.current?.children[activeIndex] as HTMLElement | undefined
    thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
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
          />
        </AnimatePresence>

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
            <span className={styles.counter}>
              {activeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {hasMultiple && (
        <>
          <div className={styles.dots} role="tablist" aria-label={t('productGallery.tabsAria')}>
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                className={[styles.dot, activeIndex === index ? styles.dotActive : ''].filter(Boolean).join(' ')}
                onClick={() => goTo(index)}
                aria-label={t('productGallery.photo', { n: index + 1 })}
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
                <img
                  src={src}
                  alt={t('productGallery.thumbnailAlt', { name: productName, n: index + 1 })}
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
