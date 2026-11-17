import fs from 'node:fs/promises'
import path from 'node:path'
import type { UploadRename } from './mediaProcess.js'
import { prisma } from './prisma.js'

function fileNameOf(stored: string): string {
  const pathPart = stored.split(/[?#]/)[0]
  return pathPart.split('/').pop() ?? ''
}

function replaceFileName(stored: string, fromName: string, toName: string): string {
  const pathPart = stored.split(/[?#]/)[0]
  const suffix = stored.slice(pathPart.length)
  if (pathPart !== fromName && !pathPart.endsWith(`/${fromName}`)) return stored
  return `${pathPart.slice(0, -fromName.length)}${toName}${suffix}`
}

/**
 * Point products at the mp4 that replaced a .mov/.webm, then delete the old file.
 * Also heals a previous run that wrote the mp4 and stopped before updating the row.
 */
export async function relinkProductVideos(uploadsDir: string, renames: UploadRename[]): Promise<number> {
  const products = await prisma.product.findMany({
    select: { id: true, video: true, videos: true },
  })

  const map = new Map(renames.map((item) => [item.fromName, item.toName]))

  for (const product of products) {
    const urls = [product.video, ...product.videos].filter((item): item is string => Boolean(item))
    for (const url of urls) {
      const name = fileNameOf(url)
      if (!name || map.has(name)) continue
      const mp4Name = `${path.parse(name).name}.mp4`
      if (mp4Name === name) continue
      try {
        await fs.access(path.join(uploadsDir, name))
        continue
      } catch {
        // The stored file is gone. Use the mp4 sibling when this run (or a previous one) made it.
      }
      try {
        await fs.access(path.join(uploadsDir, mp4Name))
      } catch {
        continue
      }
      map.set(name, mp4Name)
    }
  }

  if (map.size === 0) return 0

  const finalNames = new Set<string>()
  let updated = 0

  for (const product of products) {
    const nextVideo = product.video
      ? [...map].reduce((url, [fromName, toName]) => replaceFileName(url, fromName, toName), product.video)
      : product.video
    const nextVideos = product.videos.map((url) =>
      [...map].reduce((item, [fromName, toName]) => replaceFileName(item, fromName, toName), url),
    )
    for (const url of [nextVideo, ...nextVideos]) {
      if (url) finalNames.add(fileNameOf(url))
    }

    const videoChanged = nextVideo !== product.video
    const videosChanged = nextVideos.some((url, index) => url !== product.videos[index])
    if (!videoChanged && !videosChanged) continue

    await prisma.product.update({
      where: { id: product.id },
      data: {
        video: nextVideo,
        videos: nextVideos,
      },
    })
    updated += 1
  }

  for (const [fromName, toName] of map) {
    if (finalNames.has(fromName)) continue
    try {
      await fs.access(path.join(uploadsDir, toName))
    } catch {
      continue
    }
    await fs.rm(path.join(uploadsDir, fromName), { force: true })
  }

  return updated
}
