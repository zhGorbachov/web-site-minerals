import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAdmin } from '../lib/auth.js'
import { serializeProduct, serializeSubCategory } from '../lib/serialize.js'
import { buildProductSku, uniqueSku } from '../lib/sku.js'

export const adminRouter = Router()

adminRouter.use(requireAdmin)

const productInclude = {
  subCategory: { include: { category: true } },
} as const

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9а-яіїєґ]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function resolveShortDescription(description: string, shortDescription?: string) {
  const trimmed = shortDescription?.trim()
  if (trimmed) return trimmed
  const text = description.trim().replace(/\s+/g, ' ')
  if (!text) return '—'
  return text.length <= 200 ? text : `${text.slice(0, 197).trimEnd()}…`
}

const productBodySchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  sku: z.string().trim().optional(),
  shortDescription: z.string().trim().optional(),
  description: z.string().trim().min(1),
  price: z.number().positive(),
  discountPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0),
  images: z.array(z.string().min(1)).min(1),
  video: z.string().trim().min(1).nullable().optional(),
  attributes: z.record(z.unknown()).optional(),
  featured: z.boolean().optional(),
  popular: z.boolean().optional(),
  isNew: z.boolean().optional(),
  subCategoryId: z.string().min(1),
})

const stockSchema = z.object({
  stock: z.number().int().min(0),
})

const subcategoryBodySchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  categoryId: z.string().min(1),
  image: z.string().trim().min(1).optional(),
})

const subcategoryPatchSchema = subcategoryBodySchema
  .extend({
    image: z.string().trim().optional(),
  })
  .partial()

adminRouter.get('/products', async (_req, res) => {
  const products = await prisma.product.findMany({
    include: productInclude,
    orderBy: { updatedAt: 'desc' },
  })
  res.json(products.map(serializeProduct))
})

adminRouter.post('/products', async (req, res) => {
  const parsed = productBodySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() })
    return
  }

  const sub = await prisma.subCategory.findUnique({ where: { id: parsed.data.subCategoryId } })
  if (!sub) {
    res.status(400).json({ error: 'Invalid subcategory' })
    return
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name)
  const existingSlug = await prisma.product.findUnique({ where: { slug } })
  if (existingSlug) {
    res.status(409).json({ error: 'slug_taken' })
    return
  }

  const skuBase =
    parsed.data.sku?.trim() ||
    buildProductSku({
      categorySlug: sub.categorySlug,
      subCategorySlug: sub.slug,
      name: parsed.data.name,
    })
  if (!skuBase) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }
  const takenSkus = await prisma.product.findMany({ select: { sku: true } })
  const sku = uniqueSku(
    skuBase,
    takenSkus.map((item) => item.sku),
  )

  const product = await prisma.product.create({
    data: {
      id: `prod-${Date.now()}`,
      name: parsed.data.name,
      slug,
      sku,
      shortDescription: resolveShortDescription(parsed.data.description, parsed.data.shortDescription),
      description: parsed.data.description,
      price: parsed.data.price,
      discountPrice: parsed.data.discountPrice ?? null,
      stock: parsed.data.stock,
      images: parsed.data.images,
      video: parsed.data.video ?? null,
      attributes: (parsed.data.attributes ?? {}) as Prisma.InputJsonValue,
      featured: parsed.data.featured ?? false,
      popular: parsed.data.popular ?? false,
      isNew: parsed.data.isNew ?? true,
      subCategoryId: sub.id,
      subCategorySlug: sub.slug,
      categorySlug: sub.categorySlug,
    },
    include: productInclude,
  })

  res.status(201).json(serializeProduct(product))
})

adminRouter.patch('/products/:id', async (req, res) => {
  const parsed = productBodySchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() })
    return
  }

  const existing = await prisma.product.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  let subCategoryId = existing.subCategoryId
  let subCategorySlug = existing.subCategorySlug
  let categorySlug = existing.categorySlug

  if (parsed.data.subCategoryId) {
    const sub = await prisma.subCategory.findUnique({ where: { id: parsed.data.subCategoryId } })
    if (!sub) {
      res.status(400).json({ error: 'Invalid subcategory' })
      return
    }
    subCategoryId = sub.id
    subCategorySlug = sub.slug
    categorySlug = sub.categorySlug
  }

  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const clash = await prisma.product.findUnique({ where: { slug: parsed.data.slug } })
    if (clash) {
      res.status(409).json({ error: 'slug_taken' })
      return
    }
  }

  if (parsed.data.sku && parsed.data.sku !== existing.sku) {
    const clash = await prisma.product.findUnique({ where: { sku: parsed.data.sku } })
    if (clash) {
      res.status(409).json({ error: 'sku_taken' })
      return
    }
  }

  const product = await prisma.product.update({
    where: { id: existing.id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      sku: parsed.data.sku?.trim() || undefined,
      shortDescription:
        parsed.data.shortDescription !== undefined || parsed.data.description !== undefined
          ? resolveShortDescription(
              parsed.data.description ?? existing.description,
              parsed.data.shortDescription,
            )
          : undefined,
      description: parsed.data.description,
      price: parsed.data.price,
      discountPrice:
        parsed.data.discountPrice === undefined ? undefined : parsed.data.discountPrice,
      stock: parsed.data.stock,
      images: parsed.data.images,
      video: parsed.data.video === undefined ? undefined : parsed.data.video,
      attributes: parsed.data.attributes as Prisma.InputJsonValue | undefined,
      featured: parsed.data.featured,
      popular: parsed.data.popular,
      isNew: parsed.data.isNew,
      subCategoryId,
      subCategorySlug,
      categorySlug,
    },
    include: productInclude,
  })

  res.json(serializeProduct(product))
})

adminRouter.patch('/products/:id/stock', async (req, res) => {
  const parsed = stockSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }

  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { stock: parsed.data.stock },
      include: productInclude,
    })
    res.json(serializeProduct(product))
  } catch {
    res.status(404).json({ error: 'Not found' })
  }
})

adminRouter.delete('/products/:id', async (req, res) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const orderCount = await prisma.orderItem.count({ where: { productId: existing.id } })
  if (orderCount > 0) {
    res.status(409).json({ error: 'product_in_orders' })
    return
  }

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { productId: existing.id } }),
    prisma.wishlistItem.deleteMany({ where: { productId: existing.id } }),
    prisma.product.delete({ where: { id: existing.id } }),
  ])

  res.status(204).send()
})

adminRouter.post('/subcategories', async (req, res) => {
  const parsed = subcategoryBodySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() })
    return
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } })
  if (!category) {
    res.status(400).json({ error: 'Invalid category' })
    return
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name)
  const clash = await prisma.subCategory.findFirst({
    where: { categorySlug: category.slug, slug },
  })
  if (clash) {
    res.status(409).json({ error: 'slug_taken' })
    return
  }

  const sub = await prisma.subCategory.create({
    data: {
      id: `sub-${Date.now()}`,
      name: parsed.data.name,
      slug,
      categoryId: category.id,
      categorySlug: category.slug,
      image: parsed.data.image || category.image,
    },
  })

  res.status(201).json(serializeSubCategory(sub))
})

adminRouter.patch('/subcategories/:id', async (req, res) => {
  const parsed = subcategoryPatchSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() })
    return
  }

  const existing = await prisma.subCategory.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const nextCategoryId = parsed.data.categoryId ?? existing.categoryId
  const category = await prisma.category.findUnique({ where: { id: nextCategoryId } })
  if (!category) {
    res.status(400).json({ error: 'Invalid category' })
    return
  }

  const slug = parsed.data.slug?.trim() || existing.slug
  if (slug !== existing.slug || category.slug !== existing.categorySlug) {
    const clash = await prisma.subCategory.findFirst({
      where: {
        categorySlug: category.slug,
        slug,
        NOT: { id: existing.id },
      },
    })
    if (clash) {
      res.status(409).json({ error: 'slug_taken' })
      return
    }
  }

  const image =
    parsed.data.image === undefined ? undefined : parsed.data.image || category.image

  const sub = await prisma.subCategory.update({
    where: { id: existing.id },
    data: {
      name: parsed.data.name,
      slug,
      categoryId: category.id,
      categorySlug: category.slug,
      image,
    },
  })

  if (slug !== existing.slug || category.slug !== existing.categorySlug) {
    await prisma.product.updateMany({
      where: { subCategoryId: existing.id },
      data: {
        subCategorySlug: slug,
        categorySlug: category.slug,
      },
    })
  }

  res.json(serializeSubCategory(sub))
})

adminRouter.delete('/subcategories/:id', async (req, res) => {
  const existing = await prisma.subCategory.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const products = await prisma.product.findMany({
    where: { subCategoryId: existing.id },
    select: { id: true },
  })
  const productIds = products.map((product) => product.id)

  if (productIds.length > 0) {
    const orderCount = await prisma.orderItem.count({
      where: { productId: { in: productIds } },
    })
    if (orderCount > 0) {
      res.status(409).json({ error: 'subcategory_has_products' })
      return
    }

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId: { in: productIds } } }),
      prisma.wishlistItem.deleteMany({ where: { productId: { in: productIds } } }),
      prisma.product.deleteMany({ where: { id: { in: productIds } } }),
      prisma.subCategory.delete({ where: { id: existing.id } }),
    ])
  } else {
    await prisma.subCategory.delete({ where: { id: existing.id } })
  }

  res.status(204).send()
})

const discountSchema = z.object({
  discountPercent: z.number().int().min(0).max(100).nullable(),
  discountLabel: z.string().trim().max(120).nullable().optional(),
})

adminRouter.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      discountPercent: true,
      discountLabel: true,
      createdAt: true,
    },
  })

  res.json(
    users.map((user) => ({
      ...user,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      createdAt: user.createdAt.toISOString(),
    })),
  )
})

adminRouter.patch('/users/:id/discount', async (req, res) => {
  const parsed = discountSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload' })
    return
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        discountPercent: parsed.data.discountPercent,
        discountLabel:
          parsed.data.discountPercent && parsed.data.discountPercent > 0
            ? parsed.data.discountLabel ?? null
            : null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        discountPercent: true,
        discountLabel: true,
        createdAt: true,
      },
    })

    res.json({
      ...user,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      createdAt: user.createdAt.toISOString(),
    })
  } catch {
    res.status(404).json({ error: 'Not found' })
  }
})

const orderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'processing',
  'assembling',
  'ready',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
])

const paymentStatusSchema = z.enum(['unpaid', 'awaiting_payment', 'paid', 'failed'])

const updateOrderSchema = z
  .object({
    status: orderStatusSchema.optional(),
    paymentStatus: paymentStatusSchema.optional(),
  })
  .refine((data) => data.status !== undefined || data.paymentStatus !== undefined, {
    message: 'At least one field is required',
  })

function mapAdminOrder(order: {
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
    productId: string
    productName: string
    productImage: string
    quantity: number
    price: { toNumber?: () => number } | number
  }>
  user: {
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
  } | null
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
    customer: order.user
      ? {
          firstName: order.user.firstName,
          lastName: order.user.lastName,
          email: order.user.email ?? undefined,
          phone: order.user.phone ?? undefined,
        }
      : null,
  }
}

adminRouter.get('/orders', async (req, res) => {
  const id = typeof req.query.id === 'string' ? req.query.id.trim() : ''

  const orders = await prisma.order.findMany({
    where: id
      ? {
          OR: [{ id }, { id: { contains: id, mode: 'insensitive' } }],
        }
      : undefined,
    include: {
      items: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json(orders.map(mapAdminOrder))
})

adminRouter.patch('/orders/:id', async (req, res) => {
  const parsed = updateOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() })
    return
  }

  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: parsed.data.status,
        paymentStatus: parsed.data.paymentStatus,
      },
      include: {
        items: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    })
    res.json(mapAdminOrder(order))
  } catch {
    res.status(404).json({ error: 'Not found' })
  }
})
