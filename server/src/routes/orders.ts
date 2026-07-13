import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { optionalAuth, requireAuth } from '../lib/auth.js'

export const ordersRouter = Router()

const guestOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  selectedOptions: z.record(z.string()).optional(),
})

const createOrderSchema = z.object({
  paymentMethod: z.string().min(1).default('cod'),
  deliveryMethod: z.string().min(1).default('nova_poshta'),
  items: z.array(guestOrderItemSchema).optional(),
})

function mapOrder(order: {
  id: string
  userId: string | null
  status: string
  totalPrice: { toNumber?: () => number } | number
  paymentMethod: string
  deliveryMethod: string
  createdAt: Date
  items: Array<{
    id: string
    orderId: string
    productId: string
    productName: string
    productImage: string
    quantity: number
    price: { toNumber?: () => number } | number
  }>
}) {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    totalPrice: Number(order.totalPrice),
    paymentMethod: order.paymentMethod,
    deliveryMethod: order.deliveryMethod,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      quantity: item.quantity,
      price: Number(item.price),
    })),
  }
}

ordersRouter.get('/', requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  res.json(orders.map(mapOrder))
})

ordersRouter.post('/', optionalAuth, async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }

  if (req.userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
      include: { items: { include: { product: true } } },
    })

    if (!cart?.items.length) {
      res.status(400).json({ error: 'Cart is empty' })
      return
    }

    const totalPrice = cart.items.reduce((sum, item) => {
      const unit = item.product.discountPrice ?? item.product.price
      return sum + Number(unit) * item.quantity
    }, 0)

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: req.userId!,
          status: 'pending',
          totalPrice,
          paymentMethod: parsed.data.paymentMethod,
          deliveryMethod: parsed.data.deliveryMethod,
          items: {
            create: cart.items.map((item) => {
              const unit = item.product.discountPrice ?? item.product.price
              return {
                productId: item.productId,
                productName: item.product.name,
                productImage: item.product.images[0] ?? '',
                quantity: item.quantity,
                price: unit,
              }
            }),
          },
        },
        include: { items: true },
      })

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
      return created
    })

    res.status(201).json(mapOrder(order))
    return
  }

  const guestItems = parsed.data.items
  if (!guestItems?.length) {
    res.status(400).json({ error: 'Cart is empty' })
    return
  }

  const products = await prisma.product.findMany({
    where: { id: { in: guestItems.map((item) => item.productId) } },
  })
  const productById = new Map(products.map((product) => [product.id, product]))

  const resolvedItems = guestItems.map((item) => {
    const product = productById.get(item.productId)
    if (!product) throw new Error('Product not found')
    if (product.stock < item.quantity) throw new Error('Insufficient stock')
    const unit = product.discountPrice ?? product.price
    return {
      product,
      quantity: item.quantity,
      price: unit,
    }
  })

  const totalPrice = resolvedItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  )

  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: null,
          status: 'pending',
          totalPrice,
          paymentMethod: parsed.data.paymentMethod,
          deliveryMethod: parsed.data.deliveryMethod,
          items: {
            create: resolvedItems.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              productImage: item.product.images[0] ?? '',
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      })

      for (const item of resolvedItems) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stock: { decrement: item.quantity } },
        })
      }

      return created
    })

    res.status(201).json(mapOrder(order))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create order'
    if (message === 'Product not found' || message === 'Insufficient stock') {
      res.status(400).json({ error: message })
      return
    }
    res.status(500).json({ error: 'Could not create order' })
  }
})
