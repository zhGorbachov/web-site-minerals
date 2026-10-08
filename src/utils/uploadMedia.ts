/**
 * Sibling files created next to an upload: `photo.jpeg` -> `photo-thumb.jpeg`,
 * `clip.mp4` -> `clip-poster.jpg`. Null for catalog images that have no sibling.
 * Must stay in sync with thumbPathFor / posterPathFor on the server.
 */
export function uploadSiblingUrl(url: string, kind: 'thumb' | 'poster'): string | null {
  if (!url) return null
  const match = url.match(/^(.*\/uploads\/)([^/?#]+)([?#].*)?$/)
  if (!match) return null
  const [, prefix, filename, suffix = ''] = match
  const dot = filename.lastIndexOf('.')
  if (dot <= 0) return null
  const stem = filename.slice(0, dot)
  if (/-thumb$/i.test(stem) || /-poster$/i.test(stem)) return null
  if (kind === 'poster') return `${prefix}${stem}-poster.jpg${suffix}`
  const ext = filename.slice(dot)
  return `${prefix}${stem}-thumb${ext}${suffix}`
}
