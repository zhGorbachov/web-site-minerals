import { Children, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { Product, MineralAttributes, ThreadAttributes, BraceletAttributes } from '@/types'
import styles from './ProductOptions.module.scss'

interface ProductOptionsProps {
  product: Product
  onOptionsChange: (options: Record<string, string>) => void
}

export function ProductOptions({ product, onOptionsChange }: ProductOptionsProps) {
  const [selected, setSelected] = useState<Record<string, string>>({})

  const handleSelect = (key: string, value: string) => {
    const updated = { ...selected, [key]: value }
    setSelected(updated)
    onOptionsChange(updated)
  }

  const { categorySlug } = product

  if (categorySlug === 'mineraly') {
    const attrs = product.attributes as MineralAttributes
    const hasStrandOptions = Boolean(attrs.beadSizes?.length || attrs.strandLengths?.length)

    if (hasStrandOptions) {
      return (
        <div className={styles.options}>
          {attrs.beadSizes && attrs.beadSizes.length > 0 && (
            <div className={styles.optionGroup}>
              <span className={styles.optionLabel}>Розмір намистини</span>
              <div className={styles.sizeGrid}>
                {attrs.beadSizes.map((size) => (
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

          {attrs.strandLengths && attrs.strandLengths.length > 0 && (
            <div className={styles.optionGroup}>
              <span className={styles.sectionDivider} />
              <span className={styles.optionLabel}>Довжина низки</span>
              <div className={styles.lengthPills}>
                {attrs.strandLengths.map((length) => (
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

          <StrandMeta attrs={attrs} />
        </div>
      )
    }

    return (
      <div className={styles.options}>
        <CharacteristicsPanel>
          {attrs.size && <AttributeRow label="Розмір" value={attrs.size} />}
          {attrs.weight && <AttributeRow label="Вага" value={attrs.weight} />}
          {attrs.color && <AttributeRow label="Колір" value={attrs.color} />}
          {attrs.origin && <AttributeRow label="Походження" value={attrs.origin} />}
          {attrs.hardness && <AttributeRow label="Твердість" value={`${attrs.hardness} (за Моосом)`} />}
          {attrs.shape && <AttributeRow label="Форма" value={attrs.shape} />}
        </CharacteristicsPanel>
      </div>
    )
  }

  if (categorySlug === 'nytky') {
    const attrs = product.attributes as ThreadAttributes
    const colors = ['Чорний', 'Білий', 'Бежевий', 'Рожевий', 'Синій', 'Зелений', 'Бордовий']
    return (
      <div className={styles.options}>
        <CharacteristicsPanel>
          {attrs.length && <AttributeRow label="Довжина" value={attrs.length} />}
          {attrs.diameter && <AttributeRow label="Товщина" value={attrs.diameter} />}
          {attrs.material && <AttributeRow label="Матеріал" value={attrs.material} />}
        </CharacteristicsPanel>
        <div className={styles.optionGroup}>
          <span className={styles.sectionDivider} />
          <span className={styles.optionLabel}>Колір</span>
          <div className={styles.lengthPills}>
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className={[styles.lengthPill, selected.color === color ? styles.lengthPillActive : ''].filter(Boolean).join(' ')}
                onClick={() => handleSelect('color', color)}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (categorySlug === 'brаslety') {
    const attrs = product.attributes as BraceletAttributes
    const wristSizes = ['14 см', '15 см', '16 см', '17 см', '18 см', '19 см', '20 см', '21 см']
    return (
      <div className={styles.options}>
        <CharacteristicsPanel>
          {attrs.stones && attrs.stones.length > 0 && (
            <AttributeRow label="Каміння" value={attrs.stones.join(', ')} />
          )}
          {attrs.material && <AttributeRow label="Матеріал" value={attrs.material} />}
          {attrs.threadColor && <AttributeRow label="Колір нитки" value={attrs.threadColor} />}
        </CharacteristicsPanel>
        <div className={styles.optionGroup}>
          <span className={styles.sectionDivider} />
          <span className={styles.optionLabel}>Розмір зап'ястка</span>
          <div className={styles.lengthPills}>
            {wristSizes.map((size) => (
              <button
                key={size}
                type="button"
                className={[styles.lengthPill, selected.wristSize === size ? styles.lengthPillActive : ''].filter(Boolean).join(' ')}
                onClick={() => handleSelect('wristSize', size)}
              >
                {size}
              </button>
            ))}
          </div>
          {attrs.wristSize && (
            <p className={styles.hint}>Доступний розмір: {attrs.wristSize}</p>
          )}
        </div>
      </div>
    )
  }

  return null
}

function StrandMeta({ attrs }: { attrs: MineralAttributes }) {
  const meta = [
    attrs.color && { label: 'Колір', value: attrs.color },
    attrs.origin && { label: 'Походження', value: attrs.origin },
    attrs.hardness && { label: 'Твердість', value: attrs.hardness },
  ].filter(Boolean) as { label: string; value: string }[]

  if (meta.length === 0) return null

  return (
    <CharacteristicsPanel>
      <div className={styles.metaGrid}>
        {meta.map(({ label, value }) => (
          <div key={label} className={styles.metaItem}>
            <span className={styles.metaLabel}>{label}</span>
            <span className={styles.metaValue}>{value}</span>
          </div>
        ))}
      </div>
    </CharacteristicsPanel>
  )
}

function CharacteristicsPanel({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const content = Children.toArray(children).filter(Boolean)
  if (content.length === 0) return null

  return (
    <div className={styles.characteristics}>
      <button
        type="button"
        className={[styles.characteristicsTitle, open ? styles.characteristicsTitleOpen : ''].filter(Boolean).join(' ')}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>Характеристики</span>
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
            <div className={styles.characteristicsBody}>{content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AttributeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.attrRow}>
      <span className={styles.attrLabel}>{label}</span>
      <span className={styles.attrValue}>{value}</span>
    </div>
  )
}
