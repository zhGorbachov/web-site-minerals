import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'

export const ordersRouter = Router()

ordersRouter.use(requireAuth)

ordersRouter.get('/', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  res.json(
    orders.map((order) => ({
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
    })),
  )
})

const createOrderSchema = z.object({
  paymentMethod: z.string().min(1).default('cod'),
  deliveryMethod: z.string().min(1).default('nova_poshta'),
})

ordersRouter.post('/', async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }

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

  res.status(201).json({
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
  })
})
