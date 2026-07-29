import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { optionalAuth, requireAuth } from '../lib/auth.js'
import { env, isLiqPayConfigured } from '../lib/env.js'
import { encodeCheckout } from '../lib/liqpay.js'
import {
  calculateCartPricing,
  getDiscountedUnitPrice,
  getUnitPrice,
} from '../lib/pricing.js'

export const ordersRouter = Router()

const guestOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  selectedOptions: z.record(z.string()).optional(),
})

const createOrderSchema = z.object({
  paymentMethod: z.string().min(1).default('cod'),
  deliveryMethod: z.string().min(1).default('nova_poshta'),
  language: z.enum(['uk', 'en']).optional(),
  items: z.array(guestOrderItemSchema).optional(),
})

function mapOrder(order: {
  id: string
  userId: string | null
  status: string
  paymentStatus: string
  totalPrice: { toNumber?: () => number } | number
  paymentMethod: string
  deliveryMethod: string
  liqpayOrderId: string | null
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
    paymentStatus: order.paymentStatus,
    totalPrice: Number(order.totalPrice),
    paymentMethod: order.paymentMethod,
    deliveryMethod: order.deliveryMethod,
    liqpayOrderId: order.liqpayOrderId,
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

function buildLiqPayPayment(order: {
  id: string
  totalPrice: { toNumber?: () => number } | number
  liqpayOrderId: string | null
}, language?: 'uk' | 'en') {
  const liqpayOrderId = order.liqpayOrderId!
  const amount = Number(order.totalPrice)
  return {
    payment: encodeCheckout({
      amount,
      orderId: liqpayOrderId,
      description: `Order ${order.id}`,
      language,
      resultUrl: `${env.clientUrl}/checkout/result?orderId=${encodeURIComponent(order.id)}`,
      serverUrl: `${env.apiUrl}/api/payments/liqpay/callback`,
    }),
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

ordersRouter.get('/:id/payment-status', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      totalPrice: true,
    },
  })

  if (!order) {
    res.status(404).json({ error: 'Order not found' })
    return
  }

  res.json({
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    totalPrice: Number(order.totalPrice),
  })
})

ordersRouter.post('/', optionalAuth, async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }

  const isLiqPay =
    parsed.data.paymentMethod === 'liqpay' ||
    parsed.data.paymentMethod === 'google_pay' ||
    parsed.data.paymentMethod === 'apple_pay'
  if (isLiqPay && !isLiqPayConfigured()) {
    res.status(503).json({ error: 'Online payment is not configured' })
    return
  }

  const paymentStatus = isLiqPay ? 'awaiting_payment' : 'unpaid'

  if (req.userId) {
    const [cart, user] = await Promise.all([
      prisma.cart.findUnique({
        where: { userId: req.userId },
        include: { items: { include: { product: true } } },
      }),
      prisma.user.findUnique({
        where: { id: req.userId },
        select: { discountPercent: true },
      }),
    ])

    if (!cart?.items.length) {
      res.status(400).json({ error: 'Cart is empty' })
      return
    }

    const pricingItems = cart.items.map((item) => ({
      categorySlug: item.product.categorySlug,
      unitPrice: getUnitPrice(item.product),
      quantity: item.quantity,
    }))
    const pricing = calculateCartPricing(pricingItems, user?.discountPercent)
    const pricedLines = cart.items.map((item) => {
      const unit = getUnitPrice(item.product)
      return {
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images[0] ?? '',
        quantity: item.quantity,
        price: getDiscountedUnitPrice(item.product.categorySlug, unit, pricing),
      }
    })
    const totalPrice = pricedLines.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: req.userId!,
          status: 'pending',
          paymentStatus,
          totalPrice,
          paymentMethod: parsed.data.paymentMethod,
          deliveryMethod: parsed.data.deliveryMethod,
          items: {
            create: pricedLines,
          },
        },
        include: { items: true },
      })

      const withLiqPayId = isLiqPay
        ? await tx.order.update({
            where: { id: created.id },
            data: { liqpayOrderId: created.id },
            include: { items: true },
          })
        : created

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
      return withLiqPayId
    })

    const mapped = mapOrder(order)
    if (isLiqPay) {
      res.status(201).json({ ...mapped, ...buildLiqPayPayment(order, parsed.data.language) })
      return
    }

    res.status(201).json(mapped)
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

  let resolvedItems
  try {
    resolvedItems = guestItems.map((item) => {
      const product = productById.get(item.productId)
      if (!product) throw new Error('Product not found')
      if (product.stock < item.quantity) throw new Error('Insufficient stock')
      return {
        product,
        quantity: item.quantity,
        unitPrice: getUnitPrice(product),
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create order'
    if (message === 'Product not found' || message === 'Insufficient stock') {
      res.status(400).json({ error: message })
      return
    }
    res.status(500).json({ error: 'Could not create order' })
    return
  }

  const pricing = calculateCartPricing(
    resolvedItems.map((item) => ({
      categorySlug: item.product.categorySlug,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    })),
  )
  const pricedLines = resolvedItems.map((item) => ({
    product: item.product,
    quantity: item.quantity,
    price: getDiscountedUnitPrice(item.product.categorySlug, item.unitPrice, pricing),
  }))
  const totalPrice = pricedLines.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: null,
          status: 'pending',
          paymentStatus,
          totalPrice,
          paymentMethod: parsed.data.paymentMethod,
          deliveryMethod: parsed.data.deliveryMethod,
          items: {
            create: pricedLines.map((item) => ({
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

      const withLiqPayId = isLiqPay
        ? await tx.order.update({
            where: { id: created.id },
            data: { liqpayOrderId: created.id },
            include: { items: true },
          })
        : created

      for (const item of resolvedItems) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stock: { decrement: item.quantity } },
        })
      }

      return withLiqPayId
    })

    const mapped = mapOrder(order)
    if (isLiqPay) {
      res.status(201).json({ ...mapped, ...buildLiqPayPayment(order, parsed.data.language) })
      return
    }

    res.status(201).json(mapped)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create order'
    if (message === 'Product not found' || message === 'Insufficient stock') {
      res.status(400).json({ error: message })
      return
    }
    res.status(500).json({ error: 'Could not create order' })
  }
})
