import type { ChangeEvent } from 'react'
import { UA_COUNTRY_PREFIX } from '@/utils/phone'
import styles from './PhoneInput.module.scss'

type PhoneInputProps = {
  label?: string
  name?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  autoComplete?: string
}

export function PhoneInput({
  label,
  name = 'phone',
  value,
  onChange,
  required,
  autoComplete = 'tel',
}: PhoneInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    onChange(digits)
  }

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.field}>
        <span className={styles.prefix} aria-hidden="true">
          {UA_COUNTRY_PREFIX}
        </span>
        <input
          id={name}
          name={name}
          type="tel"
          inputMode="numeric"
          autoComplete={autoComplete}
          className={styles.input}
          value={value}
          onChange={handleChange}
          required={required}
          aria-label={label ? `${label}, ${UA_COUNTRY_PREFIX}` : UA_COUNTRY_PREFIX}
        />
      </div>
    </div>
  )
}
