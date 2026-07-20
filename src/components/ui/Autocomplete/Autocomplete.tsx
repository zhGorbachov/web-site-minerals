import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Loader2 } from 'lucide-react'
import styles from './Autocomplete.module.scss'

export interface AutocompleteOption {
  id: string
  label: string
  description?: string
  /** Extra payload for the consumer (city/warehouse data, etc.). */
  data?: unknown
}

interface AutocompleteProps {
  label?: string
  value: string
  onChange: (value: string) => void
  onSelect: (option: AutocompleteOption) => void
  loadOptions: (query: string) => Promise<AutocompleteOption[]>
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: ReactNode
  debounceMs?: number
  minChars?: number
  emptyMessage?: string
  loadingMessage?: string
  autoComplete?: string
  id?: string
}

export function Autocomplete({
  label,
  value,
  onChange,
  onSelect,
  loadOptions,
  placeholder,
  disabled,
  required,
  error,
  hint,
  debounceMs = 280,
  minChars = 2,
  emptyMessage,
  loadingMessage,
  autoComplete = 'off',
  id,
}: AutocompleteProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const listboxId = `${inputId}-listbox`
  const wrapperRef = useRef<HTMLDivElement>(null)
  const requestIdRef = useRef(0)
  const loadOptionsRef = useRef(loadOptions)
  loadOptionsRef.current = loadOptions

  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<AutocompleteOption[]>([])
  const [loading, setLoading] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setHighlight(-1)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    if (disabled) {
      setOpen(false)
      setOptions([])
      setLoading(false)
      return
    }

    const query = value.trim()
    if (!touched || query.length < minChars) {
      setOptions([])
      setLoading(false)
      setOpen(false)
      return
    }

    const requestId = ++requestIdRef.current
    setLoading(true)

    const timer = window.setTimeout(() => {
      void loadOptionsRef
        .current(query)
        .then((next) => {
          if (requestId !== requestIdRef.current) return
          setOptions(next)
          setHighlight(next.length ? 0 : -1)
          setOpen(true)
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return
          setOptions([])
          setOpen(true)
        })
        .finally(() => {
          if (requestId === requestIdRef.current) setLoading(false)
        })
    }, debounceMs)

    return () => window.clearTimeout(timer)
  }, [value, disabled, debounceMs, minChars, touched])

  const selectOption = (option: AutocompleteOption) => {
    onSelect(option)
    setOpen(false)
    setHighlight(-1)
    setTouched(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp') && options.length) {
      setOpen(true)
      setHighlight(0)
      event.preventDefault()
      return
    }

    if (!open) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlight((prev) => (prev + 1) % Math.max(options.length, 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlight((prev) => (prev <= 0 ? options.length - 1 : prev - 1))
    } else if (event.key === 'Enter' && highlight >= 0 && options[highlight]) {
      event.preventDefault()
      selectOption(options[highlight])
    } else if (event.key === 'Escape') {
      setOpen(false)
      setHighlight(-1)
    }
  }

  const showList = open && !disabled && touched && value.trim().length >= minChars

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div
        className={[
          styles.inputWrapper,
          error ? styles.hasError : '',
          showList ? styles.open : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          id={inputId}
          className={styles.input}
          value={value}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            highlight >= 0 && options[highlight] ? `${listboxId}-option-${highlight}` : undefined
          }
          onChange={(e) => {
            setTouched(true)
            onChange(e.target.value)
          }}
          onFocus={() => {
            setTouched(true)
            setOpen(true)
          }}
          onKeyDown={onKeyDown}
        />
        {loading && (
          <span className={styles.spinner} aria-hidden="true">
            <Loader2 size={16} className={styles.spinnerIcon} />
          </span>
        )}

        {showList && (
          <ul id={listboxId} className={styles.list} role="listbox">
            {loading && options.length === 0 && (
              <li className={styles.message} role="presentation">
                {loadingMessage ?? '…'}
              </li>
            )}
            {!loading && options.length === 0 && (
              <li className={styles.message} role="presentation">
                {emptyMessage ?? '—'}
              </li>
            )}
            {options.map((option, index) => (
              <li
                key={option.id}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === highlight}
                className={[styles.option, index === highlight ? styles.highlighted : '']
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => setHighlight(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectOption(option)}
              >
                <span className={styles.optionLabel}>{option.label}</span>
                {option.description && (
                  <span className={styles.optionDescription}>{option.description}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <span className={styles.error}>{error}</span>}
      {!error && hint && <div className={styles.hint}>{hint}</div>}
    </div>
  )
}
