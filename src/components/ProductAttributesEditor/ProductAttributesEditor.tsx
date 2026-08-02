import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Plus, X } from 'lucide-react'
import type { StrandLengthOption } from '@/types'
import { useTranslation } from '@/i18n/useTranslation'
import {
  DEFAULT_STRAND_LENGTHS,
  DEFAULT_WRIST_SIZES,
} from '@/utils/productOptions'
import styles from './ProductAttributesEditor.module.scss'

const BEAD_SIZE_PRESETS = ['4', '6', '8', '10', '12', '14']
const BEAD_COUNT_PRESETS = ['20', '24', '28', '32', '36', '40', '44', '48']
const THREAD_LENGTH_PRESETS = ['1 м', '5 м', '10 м', '25 м', '50 м', '100 м']
const STRAND_LENGTH_PRESETS: StrandLengthOption[] = [
  ...DEFAULT_STRAND_LENGTHS,
  { label: 'Низка 40 см', value: '40 см' },
]

type AttrMap = Record<string, unknown>

interface ProductAttributesEditorProps {
  categorySlug: string
  attributes: AttrMap
  onChange: (attributes: AttrMap) => void
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : []
}

function asStrandLengths(value: unknown): StrandLengthOption[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const entry = item as Record<string, unknown>
      const label = String(entry.label ?? '')
      const val = String(entry.value ?? label)
      if (!label) return null
      return { label, value: val }
    })
    .filter((item): item is StrandLengthOption => item != null)
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function ChipMultiSelect({
  label,
  hint,
  values,
  presets,
  onChange,
  addPlaceholder,
}: {
  label: string
  hint?: string
  values: string[]
  presets: string[]
  onChange: (next: string[]) => void
  addPlaceholder: string
}) {
  const [draft, setDraft] = useState('')
  const extras = values.filter((v) => !presets.includes(v))
  const options = [...presets, ...extras]

  const addCustom = () => {
    const next = draft.trim()
    if (!next) return
    if (!values.includes(next)) onChange([...values, next])
    setDraft('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustom()
    }
  }

  return (
    <div className={styles.group}>
      <span className={styles.groupLabel}>{label}</span>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
      <div className={styles.chips}>
        {options.map((option) => {
          const active = values.includes(option)
          return (
            <button
              key={option}
              type="button"
              className={[styles.chip, active ? styles.chipActive : ''].filter(Boolean).join(' ')}
              onClick={() => onChange(toggleValue(values, option))}
              aria-pressed={active}
            >
              {option}
            </button>
          )
        })}
      </div>
      <div className={styles.addRow}>
        <input
          className={styles.addInput}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={addPlaceholder}
        />
        <button type="button" className={styles.addBtn} onClick={addCustom} aria-label={addPlaceholder}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

function StrandLengthsEditor({
  values,
  onChange,
}: {
  values: StrandLengthOption[]
  onChange: (next: StrandLengthOption[]) => void
}) {
  const { t } = useTranslation()
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')

  const togglePreset = (preset: StrandLengthOption) => {
    const exists = values.some((item) => item.value === preset.value)
    onChange(
      exists
        ? values.filter((item) => item.value !== preset.value)
        : [...values, preset],
    )
  }

  const addCustom = (e?: FormEvent) => {
    e?.preventDefault()
    const nextLabel = label.trim()
    const nextValue = value.trim() || nextLabel
    if (!nextLabel) return
    if (values.some((item) => item.value === nextValue)) {
      setLabel('')
      setValue('')
      return
    }
    onChange([...values, { label: nextLabel, value: nextValue }])
    setLabel('')
    setValue('')
  }

  return (
    <div className={styles.group}>
      <span className={styles.groupLabel}>{t('admin.attrStrandLengths')}</span>
      <p className={styles.hint}>{t('admin.attrStrandLengthsHint')}</p>
      <div className={styles.chips}>
        {STRAND_LENGTH_PRESETS.map((preset) => {
          const active = values.some((item) => item.value === preset.value)
          return (
            <button
              key={preset.value}
              type="button"
              className={[styles.chip, active ? styles.chipActive : ''].filter(Boolean).join(' ')}
              onClick={() => togglePreset(preset)}
              aria-pressed={active}
            >
              {preset.label}
            </button>
          )
        })}
      </div>
      {values.length > 0 && (
        <ul className={styles.selectedList}>
          {values.map((item) => (
            <li key={item.value} className={styles.selectedItem}>
              <span>
                {item.label}
                {item.value !== item.label ? ` (${item.value})` : ''}
              </span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => onChange(values.filter((v) => v.value !== item.value))}
                aria-label={t('admin.remove')}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.strandAdd}>
        <input
          className={styles.addInput}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t('admin.attrStrandLabel')}
        />
        <input
          className={styles.addInput}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('admin.attrStrandValue')}
        />
        <button type="button" className={styles.addBtn} onClick={() => addCustom()}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className={styles.textField}>
      <span>{label}</span>
      <input
        className={styles.addInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}

function patchAttr(attrs: AttrMap, key: string, value: unknown): AttrMap {
  const next = { ...attrs }
  if (
    value == null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  ) {
    delete next[key]
  } else {
    next[key] = value
  }
  return next
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.subtitle}>{subtitle}</p>
    </>
  )
}

export function ProductAttributesEditor({
  categorySlug,
  attributes,
  onChange,
}: ProductAttributesEditorProps) {
  const { t } = useTranslation()

  if (!categorySlug) return null

  // Мінерали: здебільшого лише характеристики. Вибір покупця — лише якщо потрібно (намистини / низка).
  if (categorySlug === 'mineraly') {
    return (
      <section className={styles.section} aria-label={t('admin.attributesMineralTitle')}>
        <SectionHeader
          title={t('admin.attributesMineralTitle')}
          subtitle={t('admin.attributesMineralHint')}
        />

        <div className={styles.textGrid}>
          <TextField
            label={t('admin.attrSize')}
            value={String(attributes.size ?? '')}
            onChange={(size) => onChange(patchAttr(attributes, 'size', size))}
            placeholder="10 мм"
          />
          <TextField
            label={t('admin.attrWeight')}
            value={String(attributes.weight ?? '')}
            onChange={(weight) => onChange(patchAttr(attributes, 'weight', weight))}
            placeholder="1.5 г"
          />
          <TextField
            label={t('admin.attrColor')}
            value={String(attributes.color ?? '')}
            onChange={(color) => onChange(patchAttr(attributes, 'color', color))}
          />
          <TextField
            label={t('admin.attrOrigin')}
            value={String(attributes.origin ?? '')}
            onChange={(origin) => onChange(patchAttr(attributes, 'origin', origin))}
          />
          <TextField
            label={t('admin.attrHardness')}
            value={String(attributes.hardness ?? '')}
            onChange={(hardness) => onChange(patchAttr(attributes, 'hardness', hardness))}
          />
          <TextField
            label={t('admin.attrShape')}
            value={String(attributes.shape ?? '')}
            onChange={(shape) => onChange(patchAttr(attributes, 'shape', shape))}
          />
        </div>

        <div className={styles.optionalBlock}>
          <h4 className={styles.optionalTitle}>{t('admin.attributesBuyerOptionsTitle')}</h4>
          <p className={styles.hint}>{t('admin.attributesBuyerOptionsMineralHint')}</p>
          <ChipMultiSelect
            label={t('admin.attrBeadSizes')}
            hint={t('admin.attrBeadSizesHint')}
            values={asStringArray(attributes.beadSizes)}
            presets={BEAD_SIZE_PRESETS}
            onChange={(beadSizes) => {
              let next = patchAttr(attributes, 'beadSizes', beadSizes)
              if (
                beadSizes.length > 0 &&
                asStrandLengths(next.strandLengths).length === 0
              ) {
                next = patchAttr(next, 'strandLengths', DEFAULT_STRAND_LENGTHS)
              }
              onChange(next)
            }}
            addPlaceholder={t('admin.attrAddCustom')}
          />
          <ChipMultiSelect
            label={t('admin.attrBeadCounts')}
            hint={t('admin.attrBeadCountsHint')}
            values={asStringArray(attributes.beadCounts)}
            presets={BEAD_COUNT_PRESETS}
            onChange={(beadCounts) => {
              let next = patchAttr(attributes, 'beadCounts', beadCounts)
              if (
                beadCounts.length > 0 &&
                asStrandLengths(next.strandLengths).length === 0
              ) {
                next = patchAttr(next, 'strandLengths', DEFAULT_STRAND_LENGTHS)
              }
              onChange(next)
            }}
            addPlaceholder={t('admin.attrAddCustom')}
          />
          <StrandLengthsEditor
            values={
              asStrandLengths(attributes.strandLengths).length
                ? asStrandLengths(attributes.strandLengths)
                : asStringArray(attributes.beadSizes).length ||
                    asStringArray(attributes.beadCounts).length ||
                    String(attributes.shape ?? '') === 'Низка'
                  ? DEFAULT_STRAND_LENGTHS
                  : []
            }
            onChange={(strandLengths) =>
              onChange(patchAttr(attributes, 'strandLengths', strandLengths))
            }
          />
        </div>
      </section>
    )
  }

  // Низки (nytky): свої параметри — довжина тощо.
  if (categorySlug === 'nytky') {
    return (
      <section className={styles.section} aria-label={t('admin.attributesThreadTitle')}>
        <SectionHeader
          title={t('admin.attributesThreadTitle')}
          subtitle={t('admin.attributesThreadHint')}
        />
        <ChipMultiSelect
          label={t('admin.attrThreadLengths')}
          hint={t('admin.attrThreadLengthsHint')}
          values={asStringArray(attributes.lengths)}
          presets={THREAD_LENGTH_PRESETS}
          onChange={(lengths) => onChange(patchAttr(attributes, 'lengths', lengths))}
          addPlaceholder={t('admin.attrAddCustom')}
        />
        <div className={styles.textGrid}>
          <TextField
            label={t('admin.attrDiameter')}
            value={String(attributes.diameter ?? '')}
            onChange={(diameter) => onChange(patchAttr(attributes, 'diameter', diameter))}
            placeholder="0.8 мм"
          />
          <TextField
            label={t('admin.attrMaterial')}
            value={String(attributes.material ?? '')}
            onChange={(material) => onChange(patchAttr(attributes, 'material', material))}
          />
          <TextField
            label={t('admin.attrColor')}
            value={String(attributes.color ?? '')}
            onChange={(color) => onChange(patchAttr(attributes, 'color', color))}
          />
          <TextField
            label={t('admin.attrDefaultLength')}
            value={String(attributes.length ?? '')}
            onChange={(length) => onChange(patchAttr(attributes, 'length', length))}
            placeholder="50 м"
          />
        </div>
      </section>
    )
  }

  // Браслети: свої параметри — розмір зап'ястка тощо.
  if (categorySlug === 'brаslety') {
    return (
      <section className={styles.section} aria-label={t('admin.attributesBraceletTitle')}>
        <SectionHeader
          title={t('admin.attributesBraceletTitle')}
          subtitle={t('admin.attributesBraceletHint')}
        />
        <ChipMultiSelect
          label={t('admin.attrWristSizes')}
          hint={t('admin.attrWristSizesHint')}
          values={asStringArray(attributes.wristSizes)}
          presets={DEFAULT_WRIST_SIZES}
          onChange={(wristSizes) => onChange(patchAttr(attributes, 'wristSizes', wristSizes))}
          addPlaceholder={t('admin.attrAddCustom')}
        />
        <div className={styles.textGrid}>
          <TextField
            label={t('admin.attrWristRange')}
            value={String(attributes.wristSize ?? '')}
            onChange={(wristSize) => onChange(patchAttr(attributes, 'wristSize', wristSize))}
            placeholder="14–21 см"
          />
          <TextField
            label={t('admin.attrThreadColor')}
            value={String(attributes.threadColor ?? '')}
            onChange={(threadColor) => onChange(patchAttr(attributes, 'threadColor', threadColor))}
          />
          <TextField
            label={t('admin.attrMaterial')}
            value={String(attributes.material ?? '')}
            onChange={(material) => onChange(patchAttr(attributes, 'material', material))}
          />
          <TextField
            label={t('admin.attrStones')}
            value={asStringArray(attributes.stones).join(', ')}
            onChange={(raw) => {
              const stones = raw
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
              onChange(patchAttr(attributes, 'stones', stones))
            }}
            placeholder="Аметист, Кварц"
          />
        </div>
      </section>
    )
  }

  // Підвіски / пахощі тощо — лише характеристики, без вибірки.
  return (
    <section className={styles.section} aria-label={t('admin.attributesGenericTitle')}>
      <SectionHeader
        title={t('admin.attributesGenericTitle')}
        subtitle={t('admin.attributesGenericHint')}
      />
      <div className={styles.textGrid}>
        <TextField
          label={t('admin.attrMaterial')}
          value={String(attributes.material ?? '')}
          onChange={(material) => onChange(patchAttr(attributes, 'material', material))}
        />
        <TextField
          label={t('admin.attrColor')}
          value={String(attributes.color ?? '')}
          onChange={(color) => onChange(patchAttr(attributes, 'color', color))}
        />
        <TextField
          label={t('admin.attrSize')}
          value={String(attributes.size ?? '')}
          onChange={(size) => onChange(patchAttr(attributes, 'size', size))}
        />
      </div>
    </section>
  )
}
