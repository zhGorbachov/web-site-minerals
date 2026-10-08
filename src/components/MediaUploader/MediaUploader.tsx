import { useCallback, useEffect, useRef, useState } from 'react'
import { ImagePlus, Film, X, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import { AdminApi } from '@/api'
import { mediaUrl } from '@/api/client'
import { ProductVideo } from '@/components/ProductVideo/ProductVideo'
import { uploadSiblingUrl } from '@/utils/uploadMedia'
import { useTranslation } from '@/i18n/useTranslation'
import styles from './MediaUploader.module.scss'

function AdminPreviewImage({ src }: { src: string }) {
  const thumb = uploadSiblingUrl(src, 'thumb')
  const [current, setCurrent] = useState(thumb ?? src)

  useEffect(() => {
    setCurrent(thumb ?? src)
  }, [src, thumb])

  return (
    <img
      src={current}
      alt=""
      draggable={false}
      onError={() => {
        if (current !== src) setCurrent(src)
      }}
    />
  )
}

type Props = {
  images: string[]
  video?: string | null
  onImagesChange: (images: string[]) => void
  onVideoChange?: (video: string | null) => void
  maxImages?: number
  allowVideo?: boolean
}

export function MediaUploader({
  images,
  video,
  onImagesChange,
  onVideoChange,
  maxImages,
  allowVideo = true,
}: Props) {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const reorderFrom = useRef<number | null>(null)
  const [reorderOver, setReorderOver] = useState<number | null>(null)
  // Product photos can be reordered. Index 0 is the cover shown on the product card.
  // A single-image uploader (subcategory) keeps the plain preview.
  const canArrange = maxImages !== 1

  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= images.length || to >= images.length) return
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onImagesChange(next)
  }

  // Checking "main" moves that photo to the front and leaves the other photos in their current order.
  const makeMain = (index: number) => {
    if (index <= 0) return
    reorder(index, 0)
  }

  const finishReorder = () => {
    reorderFrom.current = null
    setReorderOver(null)
  }

  const upload = useCallback(
    async (files: File[]) => {
      if (!files.length) return
      setUploading(true)
      setError(null)
      try {
        const uploaded = await AdminApi.uploadFiles(files)
        let nextImages = [...images]
        let nextVideo = video ?? null

        for (const file of uploaded) {
          if (file.type === 'video') {
            if (allowVideo) nextVideo = file.url
          } else if (!nextImages.includes(file.url)) {
            nextImages.push(file.url)
          }
        }

        if (maxImages != null && nextImages.length > maxImages) {
          nextImages = nextImages.slice(-maxImages)
        }

        onImagesChange(nextImages)
        onVideoChange?.(nextVideo)
      } catch {
        setError(t('admin.uploadError'))
      } finally {
        setUploading(false)
      }
    },
    [images, video, onImagesChange, onVideoChange, maxImages, allowVideo, t],
  )

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const files = items
      .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file))

    if (!files.length) return
    e.preventDefault()
    await upload(files)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      allowVideo
        ? f.type.startsWith('image/') || f.type.startsWith('video/')
        : f.type.startsWith('image/'),
    )
    await upload(files)
  }

  const removeImage = (url: string) => {
    onImagesChange(images.filter((img) => img !== url))
  }

  return (
    <div className={styles.wrap}>
      <div
        className={[styles.dropzone, dragOver ? styles.dropzoneActive : ''].filter(Boolean).join(' ')}
        tabIndex={0}
        onPaste={handlePaste}
        onDragOver={(e) => {
          if (!Array.from(e.dataTransfer.types).includes('Files')) return
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload size={22} aria-hidden="true" />
        <p className={styles.dropTitle}>{t('admin.mediaDropTitle')}</p>
        <p className={styles.dropHint}>
          {t(allowVideo ? 'admin.mediaDropHint' : 'admin.mediaDropHintImage')}
        </p>

        <div className={styles.dropActions}>
          <button
            type="button"
            className={styles.pickBtn}
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
          >
            <ImagePlus size={16} />
            {t(maxImages === 1 ? 'admin.addImage' : 'admin.addImages')}
          </button>
          {allowVideo && (
            <button
              type="button"
              className={styles.pickBtn}
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
            >
              <Film size={16} />
              {t('admin.addVideo')}
            </button>
          )}
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple={maxImages !== 1}
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            void upload(files)
            e.target.value = ''
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            void upload(files)
            e.target.value = ''
          }}
        />
      </div>

      {uploading && <p className={styles.status}>{t('admin.uploading')}</p>}
      {error && <p className={styles.error}>{error}</p>}

      {images.length > 0 && (
        <div className={styles.previewBlock}>
          {canArrange && <span className={styles.previewLabel}>{t('admin.images')}</span>}
          {canArrange && images.length > 1 && (
            <p className={styles.previewHint}>{t('admin.mainImageHint')}</p>
          )}
          <ul className={styles.previewGrid}>
            {images.map((src, index) => (
              <li
                key={src}
                className={[
                  styles.previewItem,
                  canArrange && index === 0 ? styles.previewItemMain : '',
                  reorderOver === index ? styles.previewItemDrop : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onDragOver={
                  canArrange && images.length > 1
                    ? (event) => {
                        if (event.dataTransfer.types.includes('Files')) return
                        event.preventDefault()
                        event.dataTransfer.dropEffect = 'move'
                        setReorderOver(index)
                      }
                    : undefined
                }
                onDrop={
                  canArrange && images.length > 1
                    ? (event) => {
                        if (event.dataTransfer.types.includes('Files')) return
                        event.preventDefault()
                        event.stopPropagation()
                        const from = reorderFrom.current
                        finishReorder()
                        if (from == null) return
                        reorder(from, index)
                      }
                    : undefined
                }
              >
                {canArrange && (
                  <label className={styles.mainToggle}>
                    <input
                      type="checkbox"
                      checked={index === 0}
                      onChange={() => makeMain(index)}
                      onClick={(event) => {
                        if (index === 0) event.preventDefault()
                      }}
                    />
                    <span>{t('admin.mainImage')}</span>
                  </label>
                )}
                <div className={styles.previewFrame}>
                  <div
                    className={styles.previewDrag}
                    draggable={canArrange && images.length > 1}
                    onDragStart={(event) => {
                      if (!canArrange || images.length < 2) return
                      reorderFrom.current = index
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', String(index))
                      setReorderOver(index)
                    }}
                    onDragEnd={finishReorder}
                  >
                    <AdminPreviewImage src={mediaUrl(src)} />
                  </div>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    aria-label={t('admin.removeMedia')}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => removeImage(src)}
                  >
                    <X size={14} />
                  </button>
                  {canArrange && images.length > 1 && (
                    <div className={styles.moveBar}>
                      <button
                        type="button"
                        className={styles.moveBtn}
                        aria-label={t('admin.moveImageEarlier')}
                        disabled={index === 0}
                        onClick={() => reorder(index, index - 1)}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        className={styles.moveBtn}
                        aria-label={t('admin.moveImageLater')}
                        disabled={index === images.length - 1}
                        onClick={() => reorder(index, index + 1)}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {video && (
        <div className={styles.previewBlock}>
          <span className={styles.previewLabel}>{t('admin.video')}</span>
          <div className={styles.videoPreview}>
            <ProductVideo src={mediaUrl(video)} />
            <button
              type="button"
              className={styles.removeBtn}
              aria-label={t('admin.removeMedia')}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onVideoChange?.(null)}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
