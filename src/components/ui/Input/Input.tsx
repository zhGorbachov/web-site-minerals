import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import styles from './Input.module.scss'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  /** Soft red highlight without an error message. */
  invalid?: boolean
  hint?: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, invalid, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`
    const hasError = Boolean(error) || Boolean(invalid)

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={[styles.inputWrapper, hasError ? styles.hasError : ''].filter(Boolean).join(' ')}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={[styles.input, leftIcon ? styles.withLeft : '', rightIcon ? styles.withRight : '', className ?? ''].filter(Boolean).join(' ')}
            aria-invalid={hasError || undefined}
            {...props}
          />
          {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
        </div>
        {error && <span className={styles.error}>{error}</span>}
        {!error && hint && <div className={styles.hint}>{hint}</div>}
      </div>
    )
  },
)

Input.displayName = 'Input'
