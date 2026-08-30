import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAdmin } from '../lib/auth.js'
import { serializeProduct, serializeSubCategory } from '../lib/serialize.js'
import { buildProductSku, uniqueSku } from '../lib/sku.js'
import {
  deriveProductPricingFromVariants,
  parseVariants,
} from '../lib/productVariants.js'
import { categoryHasSubcategories } from '../lib/catalogDefaults.js'

export const adminRouter = Router()

adminRouter.use(requireAdmin)

const productInclude = {
  subCategory: { include: { category: true } },
  subCategories: { include: { subCategory: true }, orderBy: { position: 'asc' } },
} as const satisfies Prisma.ProductInclude

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

function toDiscountPrice(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value) || value <= 0) return null
  return value
}

function resolveShortDescription(description: string, shortDescription?: string) {
  const trimmed = shortDescription?.trim()
  if (trimmed) return trimmed
  const text = description.trim().replace(/\s+/g, ' ')
  if (!text) return '—'
  return text.length <= 200 ? text : `${text.slice(0, 197).trimEnd()}…`
}

const variantSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().optional(),
  image: z.string().min(1),
  price: z.number().positive().optional(),
  discountPrice: z.number().min(0).nullable().optional(),
  stock: z.number().int().min(0),
  options: z.record(z.string()).optional(),
  attributes: z.record(z.string()).optional(),
})

const productBodySchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  sku: z.string().trim().optional(),
  shortDescription: z.string().trim().optional(),
  description: z.string().trim().min(1),
  price: z.number().positive(),
  discountPrice: z.number().min(0).nullable().optional(),
  stock: z.number().int().min(0),
  images: z.array(z.string().min(1)).min(1),
  video: z.string().trim().min(1).nullable().optional(),
  attributes: z.record(z.unknown()).optional(),
  variants: z.array(variantSchema).optional(),
  featured: z.boolean().optional(),
  popular: z.boolean().optional(),
  isNew: z.boolean().optional(),
  subCategoryId: z.string().min(1).optional(),
  subCategoryIds: z.array(z.string().min(1)).optional(),
  categoryId: z.string().min(1).optional(),
})

/**
 * Flat categories (incense) have no subcategories in the storefront, but a product row always
 * needs one. Keep a single technical subcategory per flat category, named and slugged after it,
 * so the admin can save a product with only a category selected.
 */
async function getFlatCategorySubCategory(categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category || categoryHasSubcategories(category.slug)) return null

  const existing = await prisma.subCategory.findUnique({
    where: { categorySlug_slug: { categorySlug: category.slug, slug: category.slug } },
  })
  if (existing) return existing

  return prisma.subCategory.create({
    data: {
      id: `sub-${category.slug}`,
      categoryId: category.id,
      categorySlug: category.slug,
      name: category.name,
      slug: category.slug,
      image: category.image,
    },
  })
}

type ProductSubCategoryInput = {
  subCategoryId?: string
  subCategoryIds?: string[]
  categoryId?: string
}

function hasSubCategoryInput(input: ProductSubCategoryInput) {
  return Boolean(input.subCategoryIds?.length || input.subCategoryId || input.categoryId)
}

/**
 * A product can sit in several subcategories, but all of them must belong to the same category.
 * The first one is the main subcategory kept on the product row itself.
 */
async function resolveProductSubCategories(input: ProductSubCategoryInput) {
  const requestedIds = [...new Set([...(input.subCategoryIds ?? []), ...(input.subCategoryId ? [input.subCategoryId] : [])])]

  if (requestedIds.length === 0) {
    if (!input.categoryId) return null
    const flat = await getFlatCategorySubCategory(input.categoryId)
    return flat ? [flat] : null
  }

  const found = await prisma.subCategory.findMany({ where: { id: { in: requestedIds } } })
  if (found.length !== requestedIds.length) return null

  const byId = new Map(found.map((sub) => [sub.id, sub]))
  const ordered = requestedIds.map((id) => byId.get(id)!)
  if (ordered.some((sub) => sub.categoryId !== ordered[0].categoryId)) return null

  return ordered
}

function subCategoryLinkData(subs: { id: string; slug: string }[]) {
  return subs.map((sub, position) => ({
    subCategoryId: sub.id,
    subCategorySlug: sub.slug,
    position,
  }))
}

function skuSubCategoryToken(sub: { categorySlug: string; slug: string }) {
  return categoryHasSubcategories(sub.categorySlug) ? sub.slug : ''
}

function resolveVariantPricing(
  data: { price: number; stock: number; variants?: z.infer<typeof variantSchema>[] },
) {
  const variants = parseVariants(data.variants)
  if (!variants.length) {
    return { price: data.price, stock: data.stock, variants }
  }
  const derived = deriveProductPricingFromVariants(variants, data.price)
  return { price: derived.price, stock: derived.stock, variants }
}

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

  const subs = await resolveProductSubCategories(parsed.data)
  if (!subs?.length) {
    res.status(400).json({ error: 'Invalid subcategory' })
    return
  }
  const sub = subs[0]

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
      subCategorySlug: skuSubCategoryToken(sub),
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
  const pricing = resolveVariantPricing(parsed.data)

  const product = await prisma.product.create({
    data: {
      id: `prod-${Date.now()}`,
      name: parsed.data.name,
      slug,
      sku,
      shortDescription: resolveShortDescription(parsed.data.description, parsed.data.shortDescription),
      description: parsed.data.description,
      price: pricing.price,
      discountPrice: toDiscountPrice(parsed.data.discountPrice),
      stock: pricing.stock,
      images: parsed.data.images,
      video: parsed.data.video ?? null,
      attributes: (parsed.data.attributes ?? {}) as Prisma.InputJsonValue,
      variants: pricing.variants as Prisma.InputJsonValue,
      featured: parsed.data.featured ?? false,
      popular: parsed.data.popular ?? false,
      isNew: parsed.data.isNew ?? true,
      subCategoryId: sub.id,
      subCategorySlug: sub.slug,
      categorySlug: sub.categorySlug,
      subCategories: { create: subCategoryLinkData(subs) },
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
  let nextSubs: { id: string; slug: string }[] | undefined

  if (hasSubCategoryInput(parsed.data)) {
    const subs = await resolveProductSubCategories(parsed.data)
    if (!subs?.length) {
      res.status(400).json({ error: 'Invalid subcategory' })
      return
    }
    subCategoryId = subs[0].id
    subCategorySlug = subs[0].slug
    categorySlug = subs[0].categorySlug
    nextSubs = subs
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

  let nextPrice = parsed.data.price
  let nextStock = parsed.data.stock
  let nextVariants: Prisma.InputJsonValue | undefined

  if (parsed.data.variants !== undefined) {
    const pricing = resolveVariantPricing({
      price: parsed.data.price ?? Number(existing.price),
      stock: parsed.data.stock ?? existing.stock,
      variants: parsed.data.variants,
    })
    nextPrice = pricing.price
    nextStock = pricing.stock
    nextVariants = pricing.variants as Prisma.InputJsonValue
  }

  const product = await prisma.$transaction(async (tx) => {
    // Links are replaced rather than merged, so the old ones must go before the new ones land.
    if (nextSubs) {
      await tx.productSubCategory.deleteMany({ where: { productId: existing.id } })
    }

    return tx.product.update({
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
        price: nextPrice,
        discountPrice:
          parsed.data.discountPrice === undefined
            ? undefined
            : toDiscountPrice(parsed.data.discountPrice),
        stock: nextStock,
        images: parsed.data.images,
        video: parsed.data.video === undefined ? undefined : parsed.data.video,
        attributes: parsed.data.attributes as Prisma.InputJsonValue | undefined,
        variants: nextVariants,
        featured: parsed.data.featured,
        popular: parsed.data.popular,
        isNew: parsed.data.isNew,
        subCategoryId,
        subCategorySlug,
        categorySlug,
        subCategories: nextSubs ? { create: subCategoryLinkData(nextSubs) } : undefined,
      },
      include: productInclude,
    })
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
    await prisma.$transaction([
      prisma.product.updateMany({
        where: { subCategoryId: existing.id },
        data: {
          subCategorySlug: slug,
          categorySlug: category.slug,
        },
      }),
      prisma.productSubCategory.updateMany({
        where: { subCategoryId: existing.id },
        data: { subCategorySlug: slug },
      }),
    ])
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
    where: {
      OR: [
        { subCategoryId: existing.id },
        { subCategories: { some: { subCategoryId: existing.id } } },
      ],
    },
    select: {
      id: true,
      subCategoryId: true,
      subCategories: {
        orderBy: { position: 'asc' },
        select: {
          subCategoryId: true,
          subCategorySlug: true,
          subCategory: { select: { categorySlug: true } },
        },
      },
    },
  })

  /** Products kept alive because they also sit in other subcategories. */
  const kept = products.flatMap((product) => {
    const remaining = product.subCategories.filter((link) => link.subCategoryId !== existing.id)
    return remaining.length ? [{ product, next: remaining[0] }] : []
  })
  const orphanIds = products
    .filter((product) => !kept.some((item) => item.product.id === product.id))
    .map((product) => product.id)

  if (orphanIds.length > 0) {
    const orderCount = await prisma.orderItem.count({
      where: { productId: { in: orphanIds } },
    })
    if (orderCount > 0) {
      res.status(409).json({ error: 'subcategory_has_products' })
      return
    }
  }

  // The product row keeps a main subcategory FK that cascade-deletes the product, so products
  // that survive must be moved onto another of their subcategories before the row is removed.
  await prisma.$transaction([
    ...kept
      .filter((item) => item.product.subCategoryId === existing.id)
      .map((item) =>
        prisma.product.update({
          where: { id: item.product.id },
          data: {
            subCategoryId: item.next.subCategoryId,
            subCategorySlug: item.next.subCategorySlug,
            categorySlug: item.next.subCategory.categorySlug,
          },
        }),
      ),
    ...(orphanIds.length
      ? [
          prisma.cartItem.deleteMany({ where: { productId: { in: orphanIds } } }),
          prisma.wishlistItem.deleteMany({ where: { productId: { in: orphanIds } } }),
          prisma.product.deleteMany({ where: { id: { in: orphanIds } } }),
        ]
      : []),
    prisma.subCategory.delete({ where: { id: existing.id } }),
  ])

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
