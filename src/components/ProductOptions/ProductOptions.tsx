import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type {
  Product,
  ProductVariant,
  MineralAttributes,
  ThreadAttributes,
  BraceletAttributes,
  IncenseAttributes,
  ProductAttributes,
} from '@/types'
import type { Language } from '@/i18n/Translations'
import { attributeValueEn } from '@/i18n/CatalogEn'
import { useTranslation, type TranslationKey } from '@/i18n/useTranslation'
import {
  getBraceletBeadSizes,
  getBraceletWristSizes,
  getIncenseOptionKey,
  getIncenseSaleMode,
  getIncenseWeights,
  getMineralStrandLengths,
  getThreadBeadSizes,
  getThreadStrandLengths,
} from '@/utils/productOptions'
import {
  getCatalogPricing,
  getProductGalleryImages,
  getProductVariants,
  getVariantOptionValues,
  getVariantUnitPrice,
  isOptionValueOutOfStock,
} from '@/utils/productVariants'
import { formatPrice } from '@/utils/formatPrice'
import styles from './ProductOptions.module.scss'

interface ProductOptionsProps {
  product: Product
  selectedOptions?: Record<string, string>
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

function useProductOptionState(
  onOptionsChange: (options: Record<string, string>) => void,
  selectedOptions?: Record<string, string>,
) {
  const [internal, setInternal] = useState<Record<string, string>>({})
  const selected = selectedOptions ?? internal

  const handleSelect = (key: string, value: string) => {
    const updated = { ...selected, [key]: value }
    if (selectedOptions == null) setInternal(updated)
    onOptionsChange(updated)
  }

  return { selected, handleSelect }
}

function optionValues(product: Product, key: string, fallback: string[]): string[] {
  const fromVariants = getVariantOptionValues(product, key)
  return fromVariants.length ? fromVariants : fallback
}

/** One selectable option group: chips for bead sizes, pills for everything else. */
function OptionGroup({
  product,
  optionKey,
  label,
  values,
  selectedValue,
  onSelect,
  appearance = 'pill',
  renderValue,
  divider,
  hint,
}: {
  product: Product
  optionKey: string
  label: string
  values: string[]
  selectedValue?: string
  onSelect: (value: string) => void
  appearance?: 'pill' | 'chip'
  renderValue?: (value: string) => string
  divider?: boolean
  hint?: string
}) {
  if (!values.length) return null
  const listClass = appearance === 'chip' ? styles.sizeGrid : styles.lengthPills
  const itemClass = appearance === 'chip' ? styles.sizeChip : styles.lengthPill
  const activeClass = appearance === 'chip' ? styles.sizeChipActive : styles.lengthPillActive

  return (
    <div className={styles.optionGroup}>
      {divider ? <span className={styles.sectionDivider} /> : null}
      <span className={styles.optionLabel}>{label}</span>
      <div className={listClass}>
        {values.map((value) => {
          const disabled = isOptionValueOutOfStock(product, optionKey, value)
          return (
            <button
              key={value}
              type="button"
              className={[
                itemClass,
                selectedValue === value ? activeClass : '',
                disabled ? styles.optionDisabled : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelect(value)}
              disabled={disabled}
            >
              {renderValue ? renderValue(value) : value}
            </button>
          )
        })}
      </div>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  )
}

export function ProductSelections({ product, selectedOptions, onOptionsChange }: ProductOptionsProps) {
  const { t, language } = useTranslation()
  const { selected, handleSelect } = useProductOptionState(onOptionsChange, selectedOptions)
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
              {optionValues(product, 'beadSize', attrs.beadSizes!).map((size) => {
                const disabled = isOptionValueOutOfStock(product, 'beadSize', size)
                return (
                <button
                  key={size}
                  type="button"
                  className={[
                    styles.sizeChip,
                    selected.beadSize === size ? styles.sizeChipActive : '',
                    disabled ? styles.optionDisabled : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleSelect('beadSize', size)}
                  disabled={disabled}
                >
                  {size}
                </button>
                )
              })}
            </div>
          </div>
        )}

        {hasWristSizes && (
          <div className={styles.optionGroup}>
            {hasBeadSizes ? <span className={styles.sectionDivider} /> : null}
            <span className={styles.optionLabel}>{t('productOptions.wristSize')}</span>
            <div className={styles.lengthPills}>
              {optionValues(product, 'wristSize', attrs.wristSizes!).map((size) => {
                const disabled = isOptionValueOutOfStock(product, 'wristSize', size)
                return (
                <button
                  key={size}
                  type="button"
                  className={[
                    styles.lengthPill,
                    selected.wristSize === size ? styles.lengthPillActive : '',
                    disabled ? styles.optionDisabled : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleSelect('wristSize', size)}
                  disabled={disabled}
                >
                  {formatWristSize(size, language)}
                </button>
                )
              })}
            </div>
          </div>
        )}

        {hasBeadCounts && (
          <div className={styles.optionGroup}>
            {hasBeadSizes || hasWristSizes ? <span className={styles.sectionDivider} /> : null}
            <span className={styles.optionLabel}>{t('productOptions.beadCount')}</span>
            <div className={styles.lengthPills}>
              {optionValues(product, 'beadCount', attrs.beadCounts!).map((count) => {
                const disabled = isOptionValueOutOfStock(product, 'beadCount', count)
                return (
                <button
                  key={count}
                  type="button"
                  className={[
                    styles.lengthPill,
                    selected.beadCount === count ? styles.lengthPillActive : '',
                    disabled ? styles.optionDisabled : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleSelect('beadCount', count)}
                  disabled={disabled}
                >
                  {t('productOptions.beadCountValue', { value: count })}
                </button>
                )
              })}
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
              {optionValues(
                product,
                'strandLength',
                strandLengths.map((length) => length.label),
              ).map((label) => {
                const length = strandLengths.find((item) => item.label === label) ?? {
                  label,
                  value: label,
                }
                const disabled = isOptionValueOutOfStock(product, 'strandLength', length.label)
                return (
                <button
                  key={length.value}
                  type="button"
                  className={[
                    styles.lengthPill,
                    selected.strandLength === length.label ? styles.lengthPillActive : '',
                    disabled ? styles.optionDisabled : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleSelect('strandLength', length.label)}
                  disabled={disabled}
                >
                  {length.label}
                </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (categorySlug === 'nytky') {
    const attrs = product.attributes as ThreadAttributes
    const beadSizes = optionValues(product, 'beadSize', getThreadBeadSizes(attrs))
    const strandLengths = getThreadStrandLengths(attrs)
    const strandLabels = optionValues(
      product,
      'strandLength',
      strandLengths.map((length) => length.label),
    )

    return (
      <div className={styles.options}>
        <OptionGroup
          product={product}
          optionKey="beadSize"
          label={t('productOptions.beadSize')}
          values={beadSizes}
          selectedValue={selected.beadSize}
          onSelect={(value) => handleSelect('beadSize', value)}
          appearance="chip"
        />
        <OptionGroup
          product={product}
          optionKey="strandLength"
          label={t('productOptions.strandLength')}
          values={strandLabels}
          selectedValue={selected.strandLength}
          onSelect={(value) => handleSelect('strandLength', value)}
          divider={beadSizes.length > 0}
        />
      </div>
    )
  }

  if (categorySlug === 'brаslety') {
    const attrs = product.attributes as BraceletAttributes
    const beadSizes = optionValues(product, 'beadSize', getBraceletBeadSizes(attrs))
    const wristSizes = optionValues(product, 'wristSize', getBraceletWristSizes(attrs))

    return (
      <div className={styles.options}>
        <OptionGroup
          product={product}
          optionKey="beadSize"
          label={t('productOptions.beadSize')}
          values={beadSizes}
          selectedValue={selected.beadSize}
          onSelect={(value) => handleSelect('beadSize', value)}
          appearance="chip"
        />
        <OptionGroup
          product={product}
          optionKey="wristSize"
          label={t('productOptions.wristSize')}
          values={wristSizes}
          selectedValue={selected.wristSize}
          onSelect={(value) => handleSelect('wristSize', value)}
          renderValue={(value) => formatWristSize(value, language)}
          divider={beadSizes.length > 0}
          hint={
            attrs.wristSize
              ? t('productOptions.availableWristSize', {
                  size: formatWristSize(attrs.wristSize, language),
                })
              : undefined
          }
        />
      </div>
    )
  }

  if (categorySlug === 'pahoshchi') {
    const attrs = product.attributes as IncenseAttributes
    const optionKey = getIncenseOptionKey(attrs)
    const values = optionValues(product, optionKey, getIncenseWeights(attrs))

    return (
      <div className={styles.options}>
        <OptionGroup
          product={product}
          optionKey={optionKey}
          label={
            optionKey === 'pieceWeight'
              ? t('productOptions.pieceWeight')
              : t('productOptions.packWeight')
          }
          values={values}
          selectedValue={selected[optionKey]}
          onSelect={(value) => handleSelect(optionKey, value)}
          renderValue={(value) => translateAttrValue(value, language)}
          hint={
            optionKey === 'pieceWeight'
              ? t('productOptions.saleModePieceHint')
              : t('productOptions.saleModeWeightHint')
          }
        />
      </div>
    )
  }

  return null
}

export function ProductCharacteristics({
  product,
  variant,
}: {
  product: Product
  variant?: ProductVariant
}) {
  const { t, language } = useTranslation()
  const { categorySlug } = product
  const overlay = variant?.attributes

  if (categorySlug === 'mineraly') {
    const attrs = {
      ...(product.attributes as MineralAttributes),
      ...(overlay ?? {}),
    }
    const strandLengths = getMineralStrandLengths(attrs)
    const hasStrandOptions = Boolean(
      attrs.beadSizes?.length || attrs.beadCounts?.length || strandLengths.length,
    )
    return (
      <CharacteristicsPanel
        items={buildMineralCharacteristics(attrs, t, language, {
          strand: hasStrandOptions && !overlay?.weight && !overlay?.size,
        })}
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

  if (categorySlug === 'pahoshchi') {
    const attrs = product.attributes as IncenseAttributes
    return (
      <CharacteristicsPanel
        items={buildIncenseCharacteristics(attrs, t, language)}
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

export function ProductOptions({ product, selectedOptions, onOptionsChange }: ProductOptionsProps) {
  return (
    <>
      <ProductSelections
        product={product}
        selectedOptions={selectedOptions}
        onOptionsChange={onOptionsChange}
      />
      <ProductCharacteristics product={product} />
    </>
  )
}

export function ProductVariantPicker({
  product,
  selectedId,
  onSelect,
}: {
  product: Product
  selectedId?: string
  onSelect: (variantId: string | null) => void
}) {
  const { t, language } = useTranslation()
  const variants = getProductVariants(product)
  if (variants.length === 0) return null

  const catalog = getCatalogPricing(product)
  const overviewImage = getProductGalleryImages(product)[0] ?? product.images[0]
  const overviewActive = !selectedId

  return (
    <div className={styles.variantPicker} aria-label={t('productOptions.choosePiece')}>
      <span className={styles.optionLabel}>{t('productOptions.choosePiece')}</span>
      <ul className={styles.variantList}>
        <li>
          <button
            type="button"
            className={[
              styles.variantCard,
              overviewActive ? styles.variantCardActive : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelect(null)}
          >
            {overviewImage ? <img src={overviewImage} alt="" /> : null}
            <span className={styles.variantMeta}>
              <span className={styles.variantName}>{t('productOptions.overview')}</span>
              <span className={styles.variantPrice}>
                {catalog.hasRange
                  ? t('product.fromPrice', { price: formatPrice(catalog.min, language) })
                  : formatPrice(catalog.min, language)}
              </span>
            </span>
          </button>
        </li>
        {variants.map((variant) => {
          const active = variant.id === selectedId
          const out = variant.stock <= 0
          const optionLabel = Object.values(variant.options ?? {}).join(' · ')
          const name = variant.name?.trim() || optionLabel || product.name
          return (
            <li key={variant.id}>
              <button
                type="button"
                className={[
                  styles.variantCard,
                  active ? styles.variantCardActive : '',
                  out ? styles.variantCardOut : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelect(variant.id)}
              >
                <img src={variant.image} alt="" />
                <span className={styles.variantMeta}>
                  <span className={styles.variantName}>{name}</span>
                  <span className={styles.variantPrice}>
                    {formatPrice(getVariantUnitPrice(product, variant), language)}
                  </span>
                  {out && (
                    <span className={styles.variantStockOut}>{t('product.outOfStock')}</span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
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

function buildIncenseCharacteristics(
  attrs: IncenseAttributes,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
  language: Language,
): CharacteristicItem[] {
  const items: CharacteristicItem[] = []
  items.push({
    label: t('productOptions.saleMode'),
    value:
      getIncenseSaleMode(attrs) === 'piece'
        ? t('productOptions.saleModePiece')
        : t('productOptions.saleModeWeight'),
  })
  if (attrs.scent) {
    items.push({
      label: t('productOptions.attrScent'),
      value: translateAttrValue(attrs.scent, language),
    })
  }
  if (attrs.burnTime) {
    items.push({
      label: t('productOptions.attrBurnTime'),
      value: translateAttrValue(attrs.burnTime, language),
    })
  }
  if (attrs.material) {
    items.push({
      label: t('productOptions.attrMaterial'),
      value: translateAttrValue(attrs.material, language),
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
