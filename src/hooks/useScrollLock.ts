import { useEffect } from 'react'

// overflow: hidden does not stop touch scrolling on iOS Safari.
// Pinning the body is what actually keeps drawers and dialogs from dragging the page.
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const scrollY = window.scrollY
    const { body, documentElement } = document
    const previousBody = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    }
    const previousHtmlOverflow = documentElement.style.overflow
    const lockedUrl = window.location.pathname + window.location.search

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    documentElement.style.overflow = 'hidden'

    return () => {
      body.style.position = previousBody.position
      body.style.top = previousBody.top
      body.style.left = previousBody.left
      body.style.right = previousBody.right
      body.style.width = previousBody.width
      body.style.overflow = previousBody.overflow
      documentElement.style.overflow = previousHtmlOverflow
      // If the lock was released because the user navigated (menu / catalog link),
      // the new page must stay at the top instead of jumping to the old offset.
      const navigated = window.location.pathname + window.location.search !== lockedUrl
      window.scrollTo(0, navigated ? 0 : scrollY)
    }
  }, [locked])
}
