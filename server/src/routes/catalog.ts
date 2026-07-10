import { Router } from 'express'
import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { serializeCategory, serializeProduct, serializeSubCategory } from '../lib/serialize.js'

export const catalogRouter = Router()

const productInclude = {
  subCategory: {
    include: { category: true },
  },
} satisfies Prisma.ProductInclude

catalogRouter.get('/categories', async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  res.json(categories.map(serializeCategory))
})

catalogRouter.get('/categories/:slug', async (req, res) => {
  const category = await prisma.category.findUnique({ where: { slug: req.params.slug } })
  if (!category) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.json(serializeCategory(category))
})

catalogRouter.get('/subcategories', async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined
  const subcategories = await prisma.subCategory.findMany({
    where: category ? { categorySlug: category } : undefined,
    orderBy: { name: 'asc' },
  })
  res.json(subcategories.map(serializeSubCategory))
})

catalogRouter.get('/subcategories/:slug', async (req, res) => {
  const subcategory = await prisma.subCategory.findFirst({
    where: { slug: req.params.slug },
  })
  if (!subcategory) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.json(serializeSubCategory(subcategory))
})

catalogRouter.get('/products', async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined
  const subcategory =
    typeof req.query.subcategory === 'string' ? req.query.subcategory : undefined
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined
  const featured = req.query.featured === 'true'
  const popular = req.query.popular === 'true'
  const isNew = req.query.new === 'true'
  const ids =
    typeof req.query.ids === 'string'
      ? req.query.ids.split(',').map((id) => id.trim()).filter(Boolean)
      : undefined

  const where: Prisma.ProductWhereInput = {}
  if (category) where.categorySlug = category
  if (subcategory) where.subCategorySlug = subcategory
  if (featured) where.featured = true
  if (popular) where.popular = true
  if (isNew) where.isNew = true
  if (ids?.length) where.id = { in: ids }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const products = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  })

  res.json(products.map(serializeProduct))
})

catalogRouter.get('/products/:slug', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: productInclude,
  })
  if (!product) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.json(serializeProduct(product))
})

catalogRouter.get('/products/:slug/related', async (req, res) => {
  const product = await prisma.product.findUnique({ where: { slug: req.params.slug } })
  if (!product) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const limit = Math.min(Number(req.query.limit) || 4, 12)
  const related = await prisma.product.findMany({
    where: {
      subCategorySlug: product.subCategorySlug,
      id: { not: product.id },
    },
    include: productInclude,
    take: limit,
  })

  res.json(related.map(serializeProduct))
})
