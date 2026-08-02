import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import styles from './Select.module.scss'

export type SelectOption = {
  value: string
  label: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}

type SelectProps = {
  label?: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  disabled?: boolean
  id?: string
  className?: string
}

export function Select({
  label,
  value,
  options,
  onChange,
  disabled,
  id,
  className,
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const listboxId = `${selectId}-listbox`
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)

  const selected = options.find((option) => option.value === value) ?? options[0]
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )

  useEffect(() => {
    if (!open) return
    setHighlight(selectedIndex)

    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, selectedIndex])

  const choose = (next: string) => {
    if (next !== value) onChange(next)
    setOpen(false)
  }

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen(true)
      return
    }
  }

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlight((index) => (index + 1) % options.length)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlight((index) => (index <= 0 ? options.length - 1 : index - 1))
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const option = options[highlight]
      if (option) choose(option.value)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={[styles.wrapper, open ? styles.listOpen : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
    >
      {label && (
        <label className={styles.label} id={`${selectId}-label`} htmlFor={selectId}>
          {label}
        </label>
      )}

      <button
        id={selectId}
        type="button"
        className={[styles.trigger, open ? styles.triggerOpen : ''].filter(Boolean).join(' ')}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? `${selectId}-label` : undefined}
        aria-controls={listboxId}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={styles.triggerValue}>
          {selected?.tone && (
            <span className={[styles.dot, styles[`tone_${selected.tone}`]].join(' ')} aria-hidden />
          )}
          <span className={styles.triggerLabel}>{selected?.label ?? value}</span>
        </span>
        <ChevronDown
          size={16}
          className={[styles.chevron, open ? styles.chevronOpen : ''].filter(Boolean).join(' ')}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={label ? `${selectId}-label` : undefined}
            className={styles.list}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            onKeyDown={onListKeyDown}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value
              const isHighlighted = index === highlight
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    styles.option,
                    isSelected ? styles.optionSelected : '',
                    isHighlighted ? styles.optionHighlighted : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() => choose(option.value)}
                >
                  <span className={styles.optionMain}>
                    {option.tone && (
                      <span
                        className={[styles.dot, styles[`tone_${option.tone}`]].join(' ')}
                        aria-hidden
                      />
                    )}
                    <span className={styles.optionLabel}>{option.label}</span>
                  </span>
                  {isSelected && <Check size={14} className={styles.check} aria-hidden />}
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
