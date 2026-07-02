import { useCallback } from 'react'
import { useUIStore } from '@/store'

export function useOpenCatalog() {
  const openCatalog = useUIStore((s) => s.openCatalog)

  return useCallback(
    (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.()
      openCatalog()
    },
    [openCatalog],
  )
}
