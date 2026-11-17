/** Clips attached to a product, in gallery order. Falls back to the single legacy `video`. */
export function productVideos(product: {
  videos?: string[] | null
  video?: string | null
}): string[] {
  const clips = (product.videos ?? []).map((item) => item.trim()).filter(Boolean)
  if (clips.length) return clips
  const legacy = product.video?.trim()
  return legacy ? [legacy] : []
}
