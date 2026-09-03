import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { optionalAuth, requireAuth } from '../lib/auth.js'
import {
  calculateCartPricing,
  getDiscountedUnitPrice,
} from '../lib/pricing.js'
import {
  applyVariantStockChange,
  getCartUnitPrice,
  getSelectedVariant,
  getVariantDisplayName,
  parseVariants,
} from '../lib/productVariants.js'

export const ordersRouter = Router()

const guestOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  selectedOptions: z.record(z.string()).optional(),
})

const createOrderSchema = z
  .object({
    paymentMethod: z.enum(['bank_transfer', 'pickup', 'cod']).default('pickup'),
    deliveryMethod: z.string().min(1).default('nova_poshta'),
    language: z.enum(['uk', 'en']).optional(),
    payerFullName: z.string().trim().optional(),
    items: z.array(guestOrderItemSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === 'bank_transfer' && !data.payerFullName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'payerFullName is required for bank transfer',
        path: ['payerFullName'],
      })
    }
  })

function mapOrder(order: {
  id: string
  userId: string | null
  status: string
  paymentStatus: string
  totalPrice: { toNumber?: () => number } | number
  paymentMethod: string
  deliveryMethod: string
  payerFullName?: string | null
  createdAt: Date
  items: Array<{
    id: string
    orderId: string
    productId: string | null
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
    payerFullName: order.payerFullName ?? null,
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

  const paymentMethod =
    parsed.data.paymentMethod === 'cod' ? 'pickup' : parsed.data.paymentMethod

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
      unitPrice: getCartUnitPrice(
        item.product,
        item.selectedOptions as Record<string, string> | null,
      ),
      quantity: item.quantity,
    }))
    const pricing = calculateCartPricing(pricingItems, user?.discountPercent)
    const pricedLines = cart.items.map((item) => {
      const options = (item.selectedOptions as Record<string, string> | null) ?? undefined
      const variants = parseVariants(item.product.variants)
      const variant = getSelectedVariant(variants, options)
      const unit = getCartUnitPrice(item.product, options)
      return {
        productId: item.productId,
        productName: getVariantDisplayName(item.product.name, variant),
        productImage: variant?.image ?? item.product.images[0] ?? '',
        quantity: item.quantity,
        price: getDiscountedUnitPrice(item.product.categorySlug, unit, pricing),
      }
    })
    const totalPrice = pricedLines.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    )

    try {
      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            userId: req.userId!,
            status: 'pending',
            paymentStatus: 'unpaid',
            totalPrice,
            paymentMethod,
            deliveryMethod: parsed.data.deliveryMethod,
            payerFullName:
              paymentMethod === 'bank_transfer' ? parsed.data.payerFullName! : null,
            items: {
              create: pricedLines,
            },
          },
          include: { items: true },
        })

        for (const item of cart.items) {
          const options = (item.selectedOptions as Record<string, string> | null) ?? undefined
          const next = applyVariantStockChange(item.product, options, item.quantity)
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: next.stock,
              ...(next.variants
                ? { variants: next.variants as Prisma.InputJsonValue }
                : {}),
            },
          })
        }

        await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
        return created
      })

      res.status(201).json(mapOrder(order))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create order'
      if (message === 'Insufficient stock') {
        res.status(400).json({ error: message })
        return
      }
      res.status(500).json({ error: 'Could not create order' })
    }
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
      applyVariantStockChange(product, item.selectedOptions, item.quantity)
      const variants = parseVariants(product.variants)
      const variant = getSelectedVariant(variants, item.selectedOptions)
      return {
        product,
        quantity: item.quantity,
        unitPrice: getCartUnitPrice(product, item.selectedOptions),
        selectedOptions: item.selectedOptions,
        variant,
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
    productName: getVariantDisplayName(item.product.name, item.variant),
    productImage: item.variant?.image ?? item.product.images[0] ?? '',
    selectedOptions: item.selectedOptions,
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
          paymentStatus: 'unpaid',
          totalPrice,
          paymentMethod,
          deliveryMethod: parsed.data.deliveryMethod,
          payerFullName:
            paymentMethod === 'bank_transfer' ? parsed.data.payerFullName! : null,
          items: {
            create: pricedLines.map((item) => ({
              productId: item.product.id,
              productName: item.productName,
              productImage: item.productImage,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      })

      for (const item of resolvedItems) {
        const next = applyVariantStockChange(
          item.product,
          item.selectedOptions,
          item.quantity,
        )
        await tx.product.update({
          where: { id: item.product.id },
          data: {
            stock: next.stock,
            ...(next.variants
              ? { variants: next.variants as Prisma.InputJsonValue }
              : {}),
          },
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
