import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import sharp, { type Metadata } from 'sharp'

const execFileAsync = promisify(execFile)

/** Longest side of the photo stored in the catalog. Matches a retina product gallery. */
const DISPLAY_EDGE = 1600
/** Longest side of the gallery/admin thumbnail sibling. */
const THUMB_EDGE = 320
const VIDEO_EDGE = 1280

/**
 * Filenames already include a unique timestamp, and optimized bytes are not rewritten.
 * Browsers may keep them for a year. Unoptimized files keep Express's default max-age=0
 * until a thumbnail or poster exists, so a half-finished file is not pinned in cache.
 */
export const IMMUTABLE_UPLOAD_CACHE = 'public, max-age=31536000, immutable'

const IN_PLACE_IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
const VIDEO_EXT = new Set(['.mp4', '.mov', '.m4v'])

/** Caps the long edge at 1280 without upscaling. Commas stay literal: execFile does not use a shell. */
const VIDEO_SCALE =
  "scale=w='if(gte(iw,ih),min(1280,iw),-2)':h='if(gte(iw,ih),-2,min(1280,ih))'"

export type StoredUpload = {
  filePath: string
  type: 'image' | 'video'
  size: number
}

export type OptimizeStats = {
  images: number
  videos: number
  skipped: number
  failed: number
}

type VideoInfo = {
  needsTranscode: boolean
}

let ffmpegMissingLogged = false

export function thumbPathFor(filePath: string) {
  const ext = path.extname(filePath)
  return `${filePath.slice(0, -ext.length)}-thumb${ext}`
}

export function posterPathFor(filePath: string) {
  const ext = path.extname(filePath)
  return `${filePath.slice(0, -ext.length)}-poster.jpg`
}

export function cacheControlForUpload(filePath: string): string | null {
  const name = path.basename(filePath)
  if (isDerivedName(name)) return IMMUTABLE_UPLOAD_CACHE
  const ext = path.extname(name).toLowerCase()
  if (IN_PLACE_IMAGE_EXT.has(ext) && existsSync(thumbPathFor(filePath))) {
    return IMMUTABLE_UPLOAD_CACHE
  }
  if (VIDEO_EXT.has(ext) && existsSync(posterPathFor(filePath))) {
    return IMMUTABLE_UPLOAD_CACHE
  }
  return null
}

/**
 * Shrink a just-uploaded file. The returned path is what gets saved on the product.
 * On any failure the original file is left in place and returned, so the upload still succeeds.
 */
export async function processNewUpload(filePath: string, mime: string): Promise<StoredUpload> {
  try {
    if (isVideo(mime, filePath)) return await storeNewVideo(filePath)
    if (mime.startsWith('image/')) return await storeNewImage(filePath)
  } catch (error) {
    if (!isMissingFfmpeg(error)) {
      console.error('[media] kept original upload', path.basename(filePath), brief(error))
    }
  }
  return {
    filePath,
    type: isVideo(mime, filePath) ? 'video' : 'image',
    size: await fileSize(filePath),
  }
}

/**
 * One pass over files already on disk. Paths stay the same, so product records,
 * orders and carts keep working. Safe to run again: finished files are skipped.
 */
export async function optimizeUploadsDir(dir: string): Promise<OptimizeStats> {
  const stats: OptimizeStats = { images: 0, videos: 0, skipped: 0, failed: 0 }
  let names: string[]
  try {
    names = await fs.readdir(dir)
  } catch {
    return stats
  }

  for (const name of names) {
    if (shouldSkipName(name)) continue
    const filePath = path.join(dir, name)
    let isFile = false
    try {
      isFile = (await fs.stat(filePath)).isFile()
    } catch {
      continue
    }
    if (!isFile) continue

    const ext = path.extname(name).toLowerCase()
    try {
      if (IN_PLACE_IMAGE_EXT.has(ext)) {
        const changed = await optimizeExistingImage(filePath)
        if (changed) stats.images += 1
        else stats.skipped += 1
      } else if (VIDEO_EXT.has(ext)) {
        const changed = await optimizeExistingVideo(filePath)
        if (changed) stats.videos += 1
        else stats.skipped += 1
      }
    } catch (error) {
      stats.failed += 1
      if (!isMissingFfmpeg(error)) {
        console.error('[media] skipped', name, brief(error))
      }
    }
  }

  return stats
}

async function storeNewImage(filePath: string): Promise<StoredUpload> {
  const meta = await sharp(filePath, { failOn: 'none' }).metadata()
  if ((meta.pages ?? 1) > 1) {
    await writeThumb(filePath).catch((error) => {
      console.error('[media] thumb failed', path.basename(filePath), brief(error))
    })
    return { filePath, type: 'image', size: await fileSize(filePath) }
  }

  const dest = path.join(path.dirname(filePath), `${path.parse(filePath).name}.webp`)
  const before = await fileSize(filePath)
  const tmp = tempPath(dest)
  try {
    await sharp(filePath, { failOn: 'none' })
      .rotate()
      .resize({
        width: DISPLAY_EDGE,
        height: DISPLAY_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(tmp)
    if ((await fileSize(tmp)) <= 0) throw new Error('empty image output')
    await replaceFile(tmp, dest)
  } catch (error) {
    await fs.rm(tmp, { force: true })
    throw error
  }

  if (path.resolve(dest) !== path.resolve(filePath)) {
    await fs.rm(filePath, { force: true })
  }
  await writeThumb(dest).catch((error) => {
    console.error('[media] thumb failed', path.basename(dest), brief(error))
  })
  const size = await fileSize(dest)
  console.log(`[media] image ${path.basename(filePath)} ${kb(before)}KB -> ${path.basename(dest)} ${kb(size)}KB`)
  return { filePath: dest, type: 'image', size }
}

async function optimizeExistingImage(filePath: string): Promise<boolean> {
  const meta = await sharp(filePath, { failOn: 'none' }).metadata()
  if ((meta.pages ?? 1) > 1) return false

  const { width, height } = orientedPixels(meta)
  if (width <= 0 || height <= 0) return false

  const thumb = thumbPathFor(filePath)
  const needsResize = width > DISPLAY_EDGE || height > DISPLAY_EDGE
  let changed = false

  if (needsResize) {
    const before = await fileSize(filePath)
    const tmp = tempPath(filePath)
    try {
      await encodeToFile(filePath, tmp, DISPLAY_EDGE, path.extname(filePath).toLowerCase(), 82)
      const after = await fileSize(tmp)
      if (after > 0 && after < before) {
        await fs.rm(thumb, { force: true })
        await replaceFile(tmp, filePath)
        changed = true
        console.log(`[media] image ${path.basename(filePath)} ${kb(before)}KB -> ${kb(after)}KB`)
      } else {
        await fs.rm(tmp, { force: true })
      }
    } catch (error) {
      await fs.rm(tmp, { force: true })
      throw error
    }
  }

  if (!existsSync(thumb)) {
    await writeThumb(filePath)
    changed = true
  }

  return changed
}

async function storeNewVideo(filePath: string): Promise<StoredUpload> {
  const dest = path.join(path.dirname(filePath), `${path.parse(filePath).name}.mp4`)
  const before = await fileSize(filePath)
  await prepareVideo(filePath, dest)
  if (path.resolve(dest) !== path.resolve(filePath)) {
    await fs.rm(filePath, { force: true })
  }
  await writePoster(dest).catch((error) => {
    console.error('[media] poster failed', path.basename(dest), brief(error))
  })
  const size = await fileSize(dest)
  console.log(`[media] video ${path.basename(filePath)} ${kb(before)}KB -> ${path.basename(dest)} ${kb(size)}KB`)
  return { filePath: dest, type: 'video', size }
}

async function optimizeExistingVideo(filePath: string): Promise<boolean> {
  const poster = posterPathFor(filePath)
  const info = await inspectVideo(filePath)
  const moovFirst = await moovBeforeMdat(filePath)
  if (info && !info.needsTranscode && moovFirst && existsSync(poster)) return false

  if (!info || info.needsTranscode || !moovFirst) {
    const before = await fileSize(filePath)
    await prepareVideo(filePath, filePath)
    console.log(
      `[media] video ${path.basename(filePath)} ${kb(before)}KB -> ${kb(await fileSize(filePath))}KB`,
    )
  }
  if (!existsSync(poster)) await writePoster(filePath)
  return true
}

async function prepareVideo(source: string, dest: string) {
  const info = await inspectVideo(source)
  const tmp = tempPath(dest)
  try {
    if (info && !info.needsTranscode) {
      try {
        await remuxFaststart(source, tmp)
      } catch (error) {
        console.error('[media] remux failed, transcoding', path.basename(source), brief(error))
        await fs.rm(tmp, { force: true })
        await transcodeVideo(source, tmp)
      }
    } else {
      await transcodeVideo(source, tmp)
    }
    if ((await fileSize(tmp)) <= 0) throw new Error('empty video output')
    await replaceFile(tmp, dest)
  } catch (error) {
    await fs.rm(tmp, { force: true })
    throw error
  }
}

async function writeThumb(filePath: string) {
  const thumb = thumbPathFor(filePath)
  const tmp = tempPath(thumb)
  try {
    await encodeToFile(filePath, tmp, THUMB_EDGE, path.extname(filePath).toLowerCase(), 70)
    if ((await fileSize(tmp)) <= 0) throw new Error('empty thumbnail')
    await replaceFile(tmp, thumb)
  } catch (error) {
    await fs.rm(tmp, { force: true })
    throw error
  }
}

async function encodeToFile(input: string, output: string, edge: number, ext: string, quality: number) {
  let pipeline = sharp(input, { failOn: 'none' })
    .rotate()
    .resize({
      width: edge,
      height: edge,
      fit: 'inside',
      withoutEnlargement: true,
    })

  if (ext === '.png') pipeline = pipeline.png({ compressionLevel: 9 })
  else if (ext === '.webp') pipeline = pipeline.webp({ quality })
  else if (ext === '.avif') pipeline = pipeline.avif({ quality })
  else if (ext === '.gif') pipeline = pipeline.gif()
  else pipeline = pipeline.jpeg({ quality, mozjpeg: true })

  await pipeline.toFile(output)
}

function orientedPixels(meta: Metadata) {
  const width = meta.width ?? 0
  const height = meta.height ?? 0
  const orientation = meta.orientation ?? 1
  if (orientation >= 5 && orientation <= 8) return { width: height, height: width }
  return { width, height }
}

async function inspectVideo(filePath: string): Promise<VideoInfo | null> {
  try {
    const { stdout } = await execFileAsync(
      'ffprobe',
      [
        '-v',
        'error',
        '-show_entries',
        'stream=codec_name,codec_type,width,height,pix_fmt',
        '-of',
        'json',
        filePath,
      ],
      { timeout: 20_000, maxBuffer: 2 * 1024 * 1024 },
    )
    const parsed = JSON.parse(stdout) as {
      streams?: Array<{
        codec_name?: string
        codec_type?: string
        width?: number
        height?: number
        pix_fmt?: string
      }>
    }
    const streams = parsed.streams ?? []
    const video = streams.find((stream) => stream.codec_type === 'video')
    if (!video) return null
    const audio = streams.find((stream) => stream.codec_type === 'audio')
    const longEdge = Math.max(Number(video.width ?? 0), Number(video.height ?? 0))
    const playable =
      video.codec_name === 'h264' &&
      video.pix_fmt === 'yuv420p' &&
      (!audio || audio.codec_name === 'aac') &&
      longEdge > 0 &&
      longEdge <= VIDEO_EDGE
    return { needsTranscode: !playable }
  } catch (error) {
    if (isMissingFfmpeg(error)) throw error
    console.error('[media] ffprobe failed', path.basename(filePath), brief(error))
    return null
  }
}

async function moovBeforeMdat(filePath: string): Promise<boolean> {
  const handle = await fs.open(filePath, 'r')
  try {
    const { size } = await handle.stat()
    let offset = 0
    const header = Buffer.alloc(16)
    while (offset + 8 <= size) {
      const { bytesRead } = await handle.read(header, 0, 8, offset)
      if (bytesRead < 8) return false
      let atomSize = header.readUInt32BE(0)
      const type = header.toString('latin1', 4, 8)
      let headerLength = 8
      if (atomSize === 1) {
        const large = await handle.read(header, 0, 8, offset + 8)
        if (large.bytesRead < 8) return false
        atomSize = Number(header.readBigUInt64BE(0))
        headerLength = 16
      } else if (atomSize === 0) {
        atomSize = size - offset
      }
      if (!Number.isFinite(atomSize) || atomSize < headerLength) return false
      if (type === 'moov') return true
      if (type === 'mdat') return false
      offset += atomSize
    }
    return false
  } catch {
    return false
  } finally {
    await handle.close()
  }
}

async function remuxFaststart(source: string, dest: string) {
  await runFfmpeg(['-i', source, '-c', 'copy', '-movflags', '+faststart', '-f', 'mp4', dest])
}

async function transcodeVideo(source: string, dest: string) {
  await runFfmpeg([
    '-i',
    source,
    '-map',
    '0:v:0',
    '-map',
    '0:a?',
    '-c:v',
    'libx264',
    '-profile:v',
    'main',
    '-pix_fmt',
    'yuv420p',
    '-preset',
    'veryfast',
    '-crf',
    '23',
    '-vf',
    VIDEO_SCALE,
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
    '-f',
    'mp4',
    dest,
  ])
}

async function writePoster(videoPath: string) {
  const poster = posterPathFor(videoPath)
  const tmp = tempPath(poster)
  try {
    try {
      await extractPoster(videoPath, tmp, '0.2')
    } catch {
      await fs.rm(tmp, { force: true })
      await extractPoster(videoPath, tmp, '0')
    }
    if ((await fileSize(tmp)) <= 0) throw new Error('empty poster')
    await replaceFile(tmp, poster)
  } catch (error) {
    await fs.rm(tmp, { force: true })
    throw error
  }
}

function extractPoster(videoPath: string, dest: string, timestamp: string) {
  return runFfmpeg([
    '-ss',
    timestamp,
    '-i',
    videoPath,
    '-frames:v',
    '1',
    '-vf',
    VIDEO_SCALE,
    '-q:v',
    '4',
    '-f',
    'image2',
    dest,
  ])
}

function runFfmpeg(args: string[]) {
  return execFileAsync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    timeout: 180_000,
    maxBuffer: 8 * 1024 * 1024,
  })
}

async function replaceFile(tmp: string, dest: string) {
  try {
    await fs.rename(tmp, dest)
    return
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code !== 'EEXIST' && code !== 'EPERM' && code !== 'EBUSY') throw error
  }

  const backup = path.join(path.dirname(dest), `.${path.basename(dest)}.bak`)
  await fs.rename(dest, backup)
  try {
    await fs.rename(tmp, dest)
  } catch (error) {
    await fs.rename(backup, dest).catch(() => undefined)
    throw error
  }
  await fs.rm(backup, { force: true })
}

function tempPath(dest: string) {
  const ext = path.extname(dest)
  const stem = ext ? path.basename(dest, ext) : path.basename(dest)
  return path.join(path.dirname(dest), `.${stem}.processing${ext || '.bin'}`)
}

function isVideo(mime: string, filePath: string) {
  return mime.startsWith('video/') || VIDEO_EXT.has(path.extname(filePath).toLowerCase())
}

function isDerivedName(name: string) {
  return /-thumb\.[^.]+$/i.test(name) || /-poster\.jpe?g$/i.test(name)
}

function shouldSkipName(name: string) {
  return name.startsWith('.') || isDerivedName(name)
}

function isMissingFfmpeg(error: unknown) {
  const code = (error as NodeJS.ErrnoException).code
  if (code !== 'ENOENT') return false
  if (!ffmpegMissingLogged) {
    ffmpegMissingLogged = true
    console.error('[media] ffmpeg is not installed; videos are stored unchanged')
  }
  return true
}

function brief(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 500)
  return String(error).slice(0, 500)
}

async function fileSize(filePath: string) {
  return (await fs.stat(filePath)).size
}

function kb(bytes: number) {
  return Math.round(bytes / 1024)
}
