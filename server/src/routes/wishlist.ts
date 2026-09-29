import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'

function selectionKey(options?: Record<string, string> | null) {
  const entries = Object.entries(options ?? {})
    .filter(([, value]) => value != null && String(value) !== '')
    .sort(([a], [b]) => a.localeCompare(b))
  return JSON.stringify(entries)
}

export const wishlistRouter = Router()

wishlistRouter.use(requireAuth)

function mapItem(item: {
  id: string
  productId: string
  selectedOptions: Prisma.JsonValue | null
}) {
  const options =
    item.selectedOptions && typeof item.selectedOptions === 'object' && !Array.isArray(item.selectedOptions)
      ? (item.selectedOptions as Record<string, string>)
      : undefined
  return {
    id: item.id,
    productId: item.productId,
    selectedOptions: options && Object.keys(options).length ? options : undefined,
  }
}

async function listForUser(userId: string) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return items.map(mapItem)
}

wishlistRouter.get('/', async (req, res) => {
  res.json({ items: await listForUser(req.userId!) })
})

const itemSchema = z.object({
  productId: z.string().min(1),
  selectedOptions: z.record(z.string()).optional(),
})

wishlistRouter.post('/', async (req, res) => {
  const parsed = itemSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } })
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  const options = parsed.data.selectedOptions
  const existing = await listForUser(req.userId!)
  const alreadySaved = existing.some(
    (item) =>
      item.productId === parsed.data.productId &&
      selectionKey(item.selectedOptions) === selectionKey(options),
  )

  if (!alreadySaved) {
    await prisma.wishlistItem.create({
      data: {
        userId: req.userId!,
        productId: parsed.data.productId,
        selectedOptions: options ? (options as Prisma.InputJsonValue) : undefined,
      },
    })
  }

  res.status(201).json({ items: await listForUser(req.userId!) })
})

wishlistRouter.delete('/', async (req, res) => {
  await prisma.wishlistItem.deleteMany({ where: { userId: req.userId } })
  res.json({ items: [] })
})

wishlistRouter.delete('/:id', async (req, res) => {
  await prisma.wishlistItem.deleteMany({
    where: { id: req.params.id, userId: req.userId },
  })
  res.json({ items: await listForUser(req.userId!) })
})

const mergeSchema = z.object({
  items: z.array(itemSchema),
})

wishlistRouter.post('/merge', async (req, res) => {
  const parsed = mergeSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }

  let existing = await listForUser(req.userId!)

  for (const entry of parsed.data.items) {
    const product = await prisma.product.findUnique({ where: { id: entry.productId } })
    if (!product) continue
    const alreadySaved = existing.some(
      (item) =>
        item.productId === entry.productId &&
        selectionKey(item.selectedOptions) === selectionKey(entry.selectedOptions),
    )
    if (alreadySaved) continue

    await prisma.wishlistItem.create({
      data: {
        userId: req.userId!,
        productId: entry.productId,
        selectedOptions: entry.selectedOptions
          ? (entry.selectedOptions as Prisma.InputJsonValue)
          : undefined,
      },
    })
    existing = await listForUser(req.userId!)
  }

  res.json({ items: existing })
})
