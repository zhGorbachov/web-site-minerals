const EXTRA_SCROLL_GAP = 16

export function getHashScrollOffset(): number {
  const headerHeight = window.innerWidth >= 768 ? 64 : 56
  return headerHeight + EXTRA_SCROLL_GAP
}

export function isHashNavLinkActive(linkTo: string, pathname: string, hash: string): boolean {
  const hashIndex = linkTo.indexOf('#')
  const linkPath = hashIndex >= 0 ? linkTo.slice(0, hashIndex) : linkTo
  const linkHash = hashIndex >= 0 ? linkTo.slice(hashIndex) : ''

  if (pathname !== linkPath) return false

  if (!linkHash) {
    return !hash
  }

  return hash === linkHash
}

export function scrollToHashTarget(rawHash: string): void {
  const hash = rawHash.replace('#', '')

  if (!hash) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const section = document.getElementById(hash)
  if (!section) return

  const heading = section.querySelector('h2')
  const scrollTarget = heading instanceof HTMLElement ? heading : section

  const top = scrollTarget.getBoundingClientRect().top + window.scrollY - getHashScrollOffset()
  window.scrollTo({ top, behavior: 'smooth' })
}
