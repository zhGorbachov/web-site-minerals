import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, RotateCw } from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'
import { Button } from '@/components/ui'
import styles from './ErrorPage.module.scss'

function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk \d+ failed|error loading dynamically imported module/i.test(
    message,
  )
}

function getErrorMessage(error: unknown): string | undefined {
  if (isRouteErrorResponse(error)) {
    const data = error.data
    if (typeof data === 'string' && data.trim()) return data
    if (error.statusText) return `${error.status} ${error.statusText}`
    return String(error.status)
  }
  if (error instanceof Error) {
    return error.stack ?? error.message
  }
  if (typeof error === 'string') return error
  return undefined
}

function getStatusCode(error: unknown): string {
  if (isRouteErrorResponse(error)) return String(error.status)
  return '500'
}

interface ErrorFallbackProps {
  error?: unknown
}

export function ErrorFallback({ error }: ErrorFallbackProps) {
  const { t } = useTranslation()
  const chunkFailed = isChunkLoadError(error)
  const details = import.meta.env.DEV ? getErrorMessage(error) : undefined

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.gem} aria-hidden="true">
          ◆
        </div>
        <h1 className={styles.code}>{getStatusCode(error)}</h1>
        <h2 className={styles.title}>{t(chunkFailed ? 'error.chunkTitle' : 'error.title')}</h2>
        <p className={styles.text}>{t(chunkFailed ? 'error.chunkDescription' : 'error.description')}</p>
        <div className={styles.actions}>
          <Button leftIcon={<RotateCw size={18} />} onClick={() => window.location.reload()}>
            {t('error.retry')}
          </Button>
          <Button
            variant="outline"
            leftIcon={<Home size={18} />}
            onClick={() => {
              window.location.assign('/')
            }}
          >
            {t('error.goHome')}
          </Button>
        </div>
        {details && (
          <details className={styles.details}>
            <summary className={styles.detailsSummary}>{t('error.details')}</summary>
            <pre className={styles.detailsBody}>{details}</pre>
          </details>
        )}
      </motion.div>
    </div>
  )
}

export function ErrorPage() {
  const error = useRouteError()
  return <ErrorFallback error={error} />
}
