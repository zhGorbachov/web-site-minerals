import styles from './Loader.module.scss'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  fullPage?: boolean
}

export function Loader({ size = 'md', fullPage = false }: LoaderProps) {
  const spinner = (
    <span
      className={[styles.spinner, styles[size]].join(' ')}
      role="status"
      aria-label="Завантаження..."
    />
  )

  if (fullPage) {
    return <div className={styles.fullPage}>{spinner}</div>
  }

  return spinner
}
