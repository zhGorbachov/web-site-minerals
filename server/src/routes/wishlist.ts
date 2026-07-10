import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'

export const wishlistRouter = Router()

wishlistRouter.use(requireAuth)

wishlistRouter.get('/', async (req, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ productIds: items.map((item) => item.productId) })
})

const addSchema = z.object({
  productId: z.string().min(1),
})

wishlistRouter.post('/', async (req, res) => {
  const parsed = addSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } })
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  await prisma.wishlistItem.upsert({
    where: {
      userId_productId: {
        userId: req.userId!,
        productId: parsed.data.productId,
      },
    },
    create: {
      userId: req.userId!,
      productId: parsed.data.productId,
    },
    update: {},
  })

  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  })
  res.status(201).json({ productIds: items.map((item) => item.productId) })
})

wishlistRouter.delete('/:productId', async (req, res) => {
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.userId, productId: req.params.productId },
  })

  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ productIds: items.map((item) => item.productId) })
})

wishlistRouter.delete('/', async (req, res) => {
  await prisma.wishlistItem.deleteMany({ where: { userId: req.userId } })
  res.json({ productIds: [] })
})

const mergeSchema = z.object({
  productIds: z.array(z.string()),
})

wishlistRouter.post('/merge', async (req, res) => {
  const parsed = mergeSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }

  for (const productId of parsed.data.productIds) {
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) continue
    await prisma.wishlistItem.upsert({
      where: {
        userId_productId: { userId: req.userId!, productId },
      },
      create: { userId: req.userId!, productId },
      update: {},
    })
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ productIds: items.map((item) => item.productId) })
})
