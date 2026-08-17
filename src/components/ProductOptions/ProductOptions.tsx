import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type {
  Product,
  MineralAttributes,
  ThreadAttributes,
  BraceletAttributes,
  ProductAttributes,
} from '@/types'
import type { Language } from '@/i18n/Translations'
import { attributeValueEn, colorKeyByUk } from '@/i18n/CatalogEn'
import { getColorOptions } from '@/i18n/localizeCatalog'
import { useTranslation, type TranslationKey } from '@/i18n/useTranslation'
import { getBraceletWristSizes, getMineralStrandLengths } from '@/utils/productOptions'
import styles from './ProductOptions.module.scss'

interface ProductOptionsProps {
  product: Product
  onOptionsChange: (options: Record<string, string>) => void
}

type CharacteristicItem = {
  label: string
  value: string
}

const GENERIC_ATTR_KEYS: Record<string, TranslationKey> = {
  size: 'productOptions.attrSize',
  weight: 'productOptions.attrWeight',
  color: 'productOptions.attrColor',
  origin: 'productOptions.attrOrigin',
  hardness: 'productOptions.attrHardness',
  shape: 'productOptions.attrShape',
  length: 'productOptions.attrLength',
  diameter: 'productOptions.attrDiameter',
  material: 'productOptions.attrMaterial',
  wristSize: 'productOptions.attrSize',
  threadColor: 'productOptions.attrThreadColor',
}

function translateAttrValue(value: string, language: Language): string {
  if (language === 'uk') return value
  return attributeValueEn[value] ?? value
}

function formatWristSize(size: string, language: Language): string {
  if (language === 'uk') return size
  return size.replace(/\s*см/gi, ' cm')
}

function getStoredColorValue(key: string): string {
  return Object.entries(colorKeyByUk).find(([, value]) => value === key)?.[0] ?? key
}

function useProductOptionState(onOptionsChange: (options: Record<string, string>) => void) {
  const [selected, setSelected] = useState<Record<string, string>>({})

  const handleSelect = (key: string, value: string) => {
    const updated = { ...selected, [key]: value }
    setSelected(updated)
    onOptionsChange(updated)
  }

  return { selected, handleSelect }
}

export function ProductSelections({ product, onOptionsChange }: ProductOptionsProps) {
  const { t, language } = useTranslation()
  const { selected, handleSelect } = useProductOptionState(onOptionsChange)
  const { categorySlug } = product

  if (categorySlug === 'mineraly') {
    const attrs = product.attributes as MineralAttributes
    const hasBeadSizes = Boolean(attrs.beadSizes?.length)
    const hasWristSizes = Boolean(attrs.wristSizes?.length)
    const hasBeadCounts = Boolean(attrs.beadCounts?.length)
    const strandLengths = getMineralStrandLengths(attrs)
    const hasOptions = Boolean(
      hasBeadSizes || hasWristSizes || hasBeadCounts || strandLengths.length,
    )
    if (!hasOptions) return null

    return (
      <div className={styles.options}>
        {hasBeadSizes && (
          <div className={styles.optionGroup}>
            <span className={styles.optionLabel}>{t('productOptions.beadSize')}</span>
            <div className={styles.sizeGrid}>
              {attrs.beadSizes!.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={[styles.sizeChip, selected.beadSize === size ? styles.sizeChipActive : ''].filter(Boolean).join(' ')}
                  onClick={() => handleSelect('beadSize', size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasWristSizes && (
          <div className={styles.optionGroup}>
            {hasBeadSizes ? <span className={styles.sectionDivider} /> : null}
            <span className={styles.optionLabel}>{t('productOptions.wristSize')}</span>
            <div className={styles.lengthPills}>
              {attrs.wristSizes!.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={[styles.lengthPill, selected.wristSize === size ? styles.lengthPillActive : ''].filter(Boolean).join(' ')}
                  onClick={() => handleSelect('wristSize', size)}
                >
                  {formatWristSize(size, language)}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasBeadCounts && (
          <div className={styles.optionGroup}>
            {hasBeadSizes || hasWristSizes ? <span className={styles.sectionDivider} /> : null}
            <span className={styles.optionLabel}>{t('productOptions.beadCount')}</span>
            <div className={styles.lengthPills}>
              {attrs.beadCounts!.map((count) => (
                <button
                  key={count}
                  type="button"
                  className={[styles.lengthPill, selected.beadCount === count ? styles.lengthPillActive : ''].filter(Boolean).join(' ')}
                  onClick={() => handleSelect('beadCount', count)}
                >
                  {t('productOptions.beadCountValue', { value: count })}
                </button>
              ))}
            </div>
          </div>
        )}

        {strandLengths.length > 0 && (
          <div className={styles.optionGroup}>
            {hasBeadSizes || hasWristSizes || hasBeadCounts ? (
              <span className={styles.sectionDivider} />
            ) : null}
            <span className={styles.optionLabel}>{t('productOptions.strandLength')}</span>
            <div className={styles.lengthPills}>
              {strandLengths.map((length) => (
                <button
                  key={length.value}
                  type="button"
                  className={[styles.lengthPill, selected.strandLength === length.label ? styles.lengthPillActive : ''].filter(Boolean).join(' ')}
                  onClick={() => handleSelect('strandLength', length.label)}
                >
                  {length.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (categorySlug === 'nytky') {
    const attrs = product.attributes as ThreadAttributes
    const colors = getColorOptions(language)
    return (
      <div className={styles.options}>
        {attrs.lengths && attrs.lengths.length > 0 && (
          <div className={styles.optionGroup}>
            <span className={styles.optionLabel}>{t('productOptions.threadLength')}</span>
            <div className={styles.lengthPills}>
              {attrs.lengths.map((length) => (
                <button
                  key={length}
                  type="button"
                  className={[styles.lengthPill, selected.length === length ? styles.lengthPillActive : ''].filter(Boolean).join(' ')}
                  onClick={() => handleSelect('length', length)}
                >
                  {translateAttrValue(length, language)}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className={styles.optionGroup}>
          {attrs.lengths?.length ? <span className={styles.sectionDivider} /> : null}
          <span className={styles.optionLabel}>{t('productOptions.color')}</span>
          <div className={styles.lengthPills}>
            {colors.map((color) => {
              const storedValue = getStoredColorValue(color.key)
              return (
                <button
                  key={color.key}
                  type="button"
                  className={[styles.lengthPill, selected.color === storedValue ? styles.lengthPillActive : ''].filter(Boolean).join(' ')}
                  onClick={() => handleSelect('color', storedValue)}
                >
                  {color.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (categorySlug === 'brаslety') {
    const attrs = product.attributes as BraceletAttributes
    const wristSizes = getBraceletWristSizes(attrs)
    return (
      <div className={styles.options}>
        <div className={styles.optionGroup}>
          <span className={styles.optionLabel}>{t('productOptions.wristSize')}</span>
          <div className={styles.lengthPills}>
            {wristSizes.map((size) => (
              <button
                key={size}
                type="button"
                className={[styles.lengthPill, selected.wristSize === size ? styles.lengthPillActive : ''].filter(Boolean).join(' ')}
                onClick={() => handleSelect('wristSize', size)}
              >
                {formatWristSize(size, language)}
              </button>
            ))}
          </div>
          {attrs.wristSize && (
            <p className={styles.hint}>
              {t('productOptions.availableWristSize', {
                size: formatWristSize(attrs.wristSize, language),
              })}
            </p>
          )}
        </div>
      </div>
    )
  }

  return null
}

export function ProductCharacteristics({ product }: Pick<ProductOptionsProps, 'product'>) {
  const { t, language } = useTranslation()
  const { categorySlug } = product

  if (categorySlug === 'mineraly') {
    const attrs = product.attributes as MineralAttributes
    const strandLengths = getMineralStrandLengths(attrs)
    const hasStrandOptions = Boolean(
      attrs.beadSizes?.length || attrs.beadCounts?.length || strandLengths.length,
    )
    return (
      <CharacteristicsPanel
        items={buildMineralCharacteristics(attrs, t, language, { strand: hasStrandOptions })}
        characteristicsLabel={t('productOptions.characteristics')}
      />
    )
  }

  if (categorySlug === 'nytky') {
    const attrs = product.attributes as ThreadAttributes
    return (
      <CharacteristicsPanel
        items={buildThreadCharacteristics(attrs, t, language)}
        characteristicsLabel={t('productOptions.characteristics')}
      />
    )
  }

  if (categorySlug === 'brаslety') {
    const attrs = product.attributes as BraceletAttributes
    return (
      <CharacteristicsPanel
        items={buildBraceletCharacteristics(attrs, t, language)}
        characteristicsLabel={t('productOptions.characteristics')}
      />
    )
  }

  const genericItems = buildGenericCharacteristics(product.attributes, t, language)
  if (genericItems.length === 0) return null

  return (
    <CharacteristicsPanel
      items={genericItems}
      characteristicsLabel={t('productOptions.characteristics')}
    />
  )
}

export function ProductOptions({ product, onOptionsChange }: ProductOptionsProps) {
  return (
    <>
      <ProductSelections product={product} onOptionsChange={onOptionsChange} />
      <ProductCharacteristics product={product} />
    </>
  )
}

function buildMineralCharacteristics(
  attrs: MineralAttributes,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
  language: Language,
  options?: { strand?: boolean },
): CharacteristicItem[] {
  const items: CharacteristicItem[] = []

  if (!options?.strand) {
    if (attrs.size) {
      items.push({
        label: t('productOptions.attrSize'),
        value: translateAttrValue(attrs.size, language),
      })
    }
    if (attrs.weight) {
      items.push({
        label: t('productOptions.attrWeight'),
        value: translateAttrValue(attrs.weight, language),
      })
    }
  }
  if (attrs.color) {
    items.push({
      label: t('productOptions.attrColor'),
      value: translateAttrValue(attrs.color, language),
    })
  }
  if (attrs.origin) {
    items.push({
      label: t('productOptions.attrOrigin'),
      value: translateAttrValue(attrs.origin, language),
    })
  }
  if (attrs.hardness) {
    items.push({
      label: t('productOptions.attrHardness'),
      value: options?.strand
        ? translateAttrValue(attrs.hardness, language)
        : `${translateAttrValue(attrs.hardness, language)}${t('productOptions.mohsScale')}`,
    })
  }
  if (!options?.strand && attrs.shape) {
    items.push({
      label: t('productOptions.attrShape'),
      value: translateAttrValue(attrs.shape, language),
    })
  }

  return items
}

function buildThreadCharacteristics(
  attrs: ThreadAttributes,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
  language: Language,
): CharacteristicItem[] {
  const items: CharacteristicItem[] = []
  if (attrs.length && !attrs.lengths?.length) {
    items.push({
      label: t('productOptions.attrLength'),
      value: translateAttrValue(attrs.length, language),
    })
  }
  if (attrs.diameter) {
    items.push({
      label: t('productOptions.attrDiameter'),
      value: translateAttrValue(attrs.diameter, language),
    })
  }
  if (attrs.material) {
    items.push({
      label: t('productOptions.attrMaterial'),
      value: translateAttrValue(attrs.material, language),
    })
  }
  if (attrs.color) {
    items.push({
      label: t('productOptions.attrColor'),
      value: translateAttrValue(attrs.color, language),
    })
  }
  return items
}

function buildBraceletCharacteristics(
  attrs: BraceletAttributes,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
  language: Language,
): CharacteristicItem[] {
  const items: CharacteristicItem[] = []
  if (attrs.stones?.length) {
    items.push({
      label: t('productOptions.attrStones'),
      value: attrs.stones.map((stone) => translateAttrValue(stone, language)).join(', '),
    })
  }
  if (attrs.material) {
    items.push({
      label: t('productOptions.attrMaterial'),
      value: translateAttrValue(attrs.material, language),
    })
  }
  if (attrs.threadColor) {
    items.push({
      label: t('productOptions.attrThreadColor'),
      value: translateAttrValue(attrs.threadColor, language),
    })
  }
  if (attrs.wristSize) {
    items.push({
      label: t('productOptions.attrSize'),
      value: formatWristSize(attrs.wristSize, language),
    })
  }
  return items
}

function buildGenericCharacteristics(
  attributes: ProductAttributes,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
  language: Language,
): CharacteristicItem[] {
  return Object.entries(attributes)
    .filter(([key, value]) => {
      if (Array.isArray(value) || typeof value === 'object') return false
      return key in GENERIC_ATTR_KEYS && Boolean(value)
    })
    .map(([key, value]) => ({
      label: t(GENERIC_ATTR_KEYS[key]),
      value: key === 'wristSize'
        ? formatWristSize(String(value), language)
        : translateAttrValue(String(value), language),
    }))
}

function CharacteristicsPanel({
  items,
  characteristicsLabel,
}: {
  items: CharacteristicItem[]
  characteristicsLabel: string
}) {
  const [open, setOpen] = useState(false)
  if (items.length === 0) return null

  return (
    <section className={styles.characteristics} aria-label={characteristicsLabel}>
      <button
        type="button"
        className={[styles.characteristicsTitle, open ? styles.characteristicsTitleOpen : ''].filter(Boolean).join(' ')}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>{characteristicsLabel}</span>
        <ChevronDown
          size={18}
          className={[styles.chevron, open ? styles.chevronOpen : ''].filter(Boolean).join(' ')}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="characteristics-body"
            className={styles.characteristicsCollapse}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className={styles.characteristicsBody}>
              <div className={styles.metaGrid}>
                {items.map((item) => (
                  <div key={item.label} className={styles.metaItem}>
                    <span className={styles.metaLabel}>{item.label}</span>
                    <span className={styles.metaValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
