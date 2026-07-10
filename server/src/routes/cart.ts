import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'
import { serializeProduct } from '../lib/serialize.js'

export const cartRouter = Router()

cartRouter.use(requireAuth)

async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { subCategory: { include: { category: true } } },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (existing) return existing

  return prisma.cart.create({
    data: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { subCategory: { include: { category: true } } },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

function serializeCart(
  cart: Awaited<ReturnType<typeof getOrCreateCart>>,
) {
  return {
    id: cart.id,
    items: cart.items.map((item) => ({
      id: item.id,
      product: serializeProduct(item.product),
      quantity: item.quantity,
      selectedOptions: (item.selectedOptions as Record<string, string> | null) ?? undefined,
    })),
    createdAt: cart.createdAt.toISOString(),
  }
}

cartRouter.get('/', async (req, res) => {
  const cart = await getOrCreateCart(req.userId!)
  res.json(serializeCart(cart))
})

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  selectedOptions: z.record(z.string()).optional(),
})

cartRouter.post('/items', async (req, res) => {
  const parsed = addItemSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } })
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  const cart = await getOrCreateCart(req.userId!)
  const optionsKey = JSON.stringify(parsed.data.selectedOptions ?? {})
  const existing = cart.items.find(
    (item) =>
      item.productId === parsed.data.productId &&
      JSON.stringify(item.selectedOptions ?? {}) === optionsKey,
  )

  if (existing) {
    const nextQty = Math.min(existing.quantity + parsed.data.quantity, product.stock)
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty },
    })
  } else {
    const qty = Math.min(parsed.data.quantity, product.stock)
    if (qty <= 0) {
      res.status(400).json({ error: 'Out of stock' })
      return
    }
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity: qty,
        selectedOptions: parsed.data.selectedOptions ?? undefined,
      },
    })
  }

  const updated = await getOrCreateCart(req.userId!)
  res.status(201).json(serializeCart(updated))
})

const updateItemSchema = z.object({
  quantity: z.number().int().positive(),
})

cartRouter.patch('/items/:itemId', async (req, res) => {
  const parsed = updateItemSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }

  const cart = await getOrCreateCart(req.userId!)
  const item = cart.items.find((i) => i.id === req.params.itemId)
  if (!item) {
    res.status(404).json({ error: 'Item not found' })
    return
  }

  const quantity = Math.min(parsed.data.quantity, item.product.stock)
  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
  })

  const updated = await getOrCreateCart(req.userId!)
  res.json(serializeCart(updated))
})

cartRouter.delete('/items/:itemId', async (req, res) => {
  const cart = await getOrCreateCart(req.userId!)
  const item = cart.items.find((i) => i.id === req.params.itemId)
  if (!item) {
    res.status(404).json({ error: 'Item not found' })
    return
  }

  await prisma.cartItem.delete({ where: { id: item.id } })
  const updated = await getOrCreateCart(req.userId!)
  res.json(serializeCart(updated))
})

cartRouter.delete('/', async (req, res) => {
  const cart = await getOrCreateCart(req.userId!)
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  const updated = await getOrCreateCart(req.userId!)
  res.json(serializeCart(updated))
})

const mergeSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      selectedOptions: z.record(z.string()).optional(),
    }),
  ),
})

cartRouter.post('/merge', async (req, res) => {
  const parsed = mergeSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }

  for (const item of parsed.data.items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (!product) continue

    const cart = await getOrCreateCart(req.userId!)
    const optionsKey = JSON.stringify(item.selectedOptions ?? {})
    const existing = cart.items.find(
      (ci) =>
        ci.productId === item.productId &&
        JSON.stringify(ci.selectedOptions ?? {}) === optionsKey,
    )

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.min(existing.quantity + item.quantity, product.stock) },
      })
    } else {
      const qty = Math.min(item.quantity, product.stock)
      if (qty > 0) {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            quantity: qty,
            selectedOptions: item.selectedOptions ?? undefined,
          },
        })
      }
    }
  }

  const updated = await getOrCreateCart(req.userId!)
  res.json(serializeCart(updated))
})
