import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store'
import { HomePage } from '@/pages/HomePage'

export function CatalogPage() {
  const { openCatalog } = useUIStore()
  const navigate = useNavigate()
  const location = useLocation()
  const hasHandled = useRef(false)

  useEffect(() => {
    if (hasHandled.current) return
    hasHandled.current = true
    openCatalog()

    if (location.key !== 'default') {
      navigate(-1)
    }
  }, [openCatalog, navigate, location.key])

  if (location.key !== 'default') {
    return null
  }

  return <HomePage />
}
