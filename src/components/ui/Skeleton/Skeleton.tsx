import type { CSSProperties } from 'react'
import styles from './Skeleton.module.scss'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
}

export function Skeleton({ width, height, borderRadius, className }: SkeletonProps) {
  const style: CSSProperties = {}
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width
  if (height !== undefined) style.height = typeof height === 'number' ? `${height}px` : height
  if (borderRadius !== undefined)
    style.borderRadius =
      typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius

  return (
    <span
      className={[styles.skeleton, className ?? ''].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <Skeleton height={220} borderRadius={12} />
      <div className={styles.cardContent}>
        <Skeleton height={18} width="70%" />
        <Skeleton height={14} width="40%" />
        <Skeleton height={40} borderRadius={24} />
      </div>
    </div>
  )
}
