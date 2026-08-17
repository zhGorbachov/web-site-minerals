import { useCallback, useRef, useState } from 'react'
import { ImagePlus, Film, X, Upload } from 'lucide-react'
import { AdminApi } from '@/api'
import { mediaUrl } from '@/api/client'
import { useTranslation } from '@/i18n/useTranslation'
import styles from './MediaUploader.module.scss'

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
          {maxImages !== 1 && <span className={styles.previewLabel}>{t('admin.images')}</span>}
          <ul className={styles.previewGrid}>
            {images.map((src) => (
              <li key={src} className={styles.previewItem}>
                <img src={mediaUrl(src)} alt="" />
                <button
                  type="button"
                  className={styles.removeBtn}
                  aria-label={t('admin.removeMedia')}
                  onClick={() => removeImage(src)}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {video && (
        <div className={styles.previewBlock}>
          <span className={styles.previewLabel}>{t('admin.video')}</span>
          <div className={styles.videoPreview}>
            <video src={mediaUrl(video)} controls playsInline preload="metadata" />
            <button
              type="button"
              className={styles.removeBtn}
              aria-label={t('admin.removeMedia')}
              onClick={() => onVideoChange(null)}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
