import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ElementType, ReactNode } from 'react'
import { motion } from 'framer-motion'
import styles from './Button.module.scss'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  as?: ElementType
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

export const Button = forwardRef<HTMLElement, ButtonProps>(
  (
    {
      as,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const Component = as ? motion.create(as) : motion.button
    const isDisabled = disabled || loading

    return (
      <Component
        ref={ref}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        className={[
          styles.button,
          styles[variant],
          styles[size],
          fullWidth ? styles.fullWidth : '',
          loading ? styles.loading : '',
          isDisabled ? styles.disabled : '',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={as ? undefined : isDisabled}
        aria-disabled={as && isDisabled ? true : undefined}
        {...(props as object)}
      >
        {loading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : (
          <>
            {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
            {children}
            {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
          </>
        )}
      </Component>
    )
  },
)

Button.displayName = 'Button'
