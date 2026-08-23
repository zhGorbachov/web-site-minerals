import { useState } from 'react'
import { mediaUrl } from '@/api/client'
import { MediaUploader } from '@/components/MediaUploader'
import { useTranslation } from '@/i18n/useTranslation'
import type { ProductVariant } from '@/types'
import {
  decodeBindToken,
  encodeBindToken,
  getBindableOptions,
  isBoundVariant,
  syncVariantsWithImages,
  toStoredVariants,
} from '@/utils/productVariants'
import styles from './ProductVariantsEditor.module.scss'

type Props = {
  images: string[]
  video?: string | null
  variants: ProductVariant[]
  categorySlug: string
  attributes: Record<string, unknown>
  defaultName: string
  defaultPrice: string
  onImagesChange: (images: string[]) => void
  onVideoChange: (video: string | null) => void
  onVariantsChange: (variants: ProductVariant[]) => void
}

function bindTokenOf(variant?: ProductVariant) {
  const entries = Object.entries(variant?.options ?? {})
  if (!entries.length) return ''
  const [key, value] = entries[0]
  return encodeBindToken(key, value)
}

export function ProductVariantsEditor({
  images,
  video,
  variants,
  categorySlug,
  attributes,
  defaultName,
  defaultPrice,
  onImagesChange,
  onVideoChange,
  onVariantsChange,
}: Props) {
  const { t } = useTranslation()
  const [enabledImages, setEnabledImages] = useState<Set<string>>(() => new Set())
  const bindable = getBindableOptions(categorySlug, attributes, {
    wristSize: t('productOptions.wristSize'),
    beadSize: t('productOptions.beadSize'),
    beadCount: t('productOptions.beadCount'),
    strandLength: t('productOptions.strandLength'),
    length: t('productOptions.threadLength'),
  })
  const drafts = syncVariantsWithImages(images, variants)

  const emit = (nextDrafts: ProductVariant[]) => {
    onVariantsChange(toStoredVariants(nextDrafts))
  }

  const handleImagesChange = (nextImages: string[]) => {
    onImagesChange(nextImages)
    setEnabledImages((prev) => new Set([...prev].filter((image) => nextImages.includes(image))))
    emit(syncVariantsWithImages(nextImages, drafts))
  }

  const patchDraft = (image: string, patch: Partial<ProductVariant> | ((current: ProductVariant) => ProductVariant)) => {
    emit(
      drafts.map((draft) => {
        if (draft.image !== image) return draft
        return typeof patch === 'function' ? patch(draft) : { ...draft, ...patch }
      }),
    )
  }

  const toggleBound = (draft: ProductVariant, enabled: boolean) => {
    setEnabledImages((prev) => {
      const next = new Set(prev)
      if (enabled) next.add(draft.image)
      else next.delete(draft.image)
      return next
    })
    if (!enabled) {
      patchDraft(draft.image, {
        name: undefined,
        price: undefined,
        discountPrice: undefined,
        stock: 0,
        options: undefined,
        attributes: undefined,
      })
    }
  }

  return (
    <div className={styles.wrap}>
      <MediaUploader
        images={images}
        video={video}
        onImagesChange={handleImagesChange}
        onVideoChange={onVideoChange}
      />

      {drafts.length > 0 && (
        <div className={styles.list}>
          <div className={styles.listHead}>
            <h3 className={styles.title}>{t('admin.variantsTitle')}</h3>
            <p className={styles.hint}>{t('admin.variantsHint')}</p>
          </div>
          <ul className={styles.cards}>
            {drafts.map((draft, index) => {
              const enabled = enabledImages.has(draft.image) || isBoundVariant(draft)
              const bindToken = bindTokenOf(draft)
              return (
                <li key={draft.id} className={[styles.card, enabled ? styles.cardOn : ''].filter(Boolean).join(' ')}>
                  <div className={styles.cardTop}>
                    <img src={mediaUrl(draft.image)} alt="" className={styles.thumb} />
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => toggleBound(draft, e.target.checked)}
                      />
                      <span>{t('admin.variantBind')}</span>
                    </label>
                  </div>

                  {enabled && (
                    <div className={styles.fields}>
                      <label className={styles.field}>
                        <span>{t('admin.variantName')}</span>
                        <input
                          value={draft.name ?? ''}
                          onChange={(e) => patchDraft(draft.image, { name: e.target.value })}
                          placeholder={
                            index === 0
                              ? defaultName || t('admin.variantPiece')
                              : t('admin.variantNameOther')
                          }
                        />
                      </label>
                      <div className={styles.row}>
                        <label className={styles.field}>
                          <span>{t('admin.variantPrice')}</span>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={draft.price ?? ''}
                            onChange={(e) =>
                              patchDraft(draft.image, {
                                price: e.target.value === '' ? undefined : Number(e.target.value),
                              })
                            }
                            placeholder={defaultPrice || t('admin.price')}
                          />
                        </label>
                        <label className={styles.field}>
                          <span>{t('admin.stock')}</span>
                          <input
                            type="number"
                            min={0}
                            value={draft.stock > 0 ? draft.stock : ''}
                            onChange={(e) =>
                              patchDraft(draft.image, {
                                stock: e.target.value === '' ? 0 : Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            placeholder="0"
                          />
                        </label>
                      </div>
                      {bindable.length > 0 && (
                        <label className={styles.field}>
                          <span>{t('admin.variantOption')}</span>
                          <select
                            value={bindToken}
                            onChange={(e) => {
                              const decoded = decodeBindToken(e.target.value)
                              patchDraft(draft.image, {
                                options: decoded ? { [decoded.key]: decoded.value } : undefined,
                              })
                            }}
                          >
                            <option value="">{t('admin.variantOptionNone')}</option>
                            {bindable.map((option) => (
                              <option key={option.token} value={option.token}>
                                {option.groupLabel}: {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      <div className={styles.row}>
                        <label className={styles.field}>
                          <span>{t('admin.attrWeight')}</span>
                          <input
                            value={draft.attributes?.weight ?? ''}
                            onChange={(e) =>
                              patchDraft(draft.image, {
                                attributes: { ...draft.attributes, weight: e.target.value },
                              })
                            }
                            placeholder="110 г"
                          />
                        </label>
                        <label className={styles.field}>
                          <span>{t('admin.attrSize')}</span>
                          <input
                            value={draft.attributes?.size ?? ''}
                            onChange={(e) =>
                              patchDraft(draft.image, {
                                attributes: { ...draft.attributes, size: e.target.value },
                              })
                            }
                            placeholder="6 см"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
