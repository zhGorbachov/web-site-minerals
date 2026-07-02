import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

export const useIsDesktop = () => useMediaQuery('(min-width: 1280px)')
export const useIsTablet = () => useMediaQuery('(min-width: 768px)')
export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
