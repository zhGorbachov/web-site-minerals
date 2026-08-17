import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PrismaClient } from '@prisma/client'
import { prisma } from './prisma.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export type CoreCategory = {
  id: string
  name: string
  slug: string
  image: string
  description: string
}

export type CoreSubCategory = {
  id: string
  categoryId: string
  categorySlug: string
  name: string
  slug: string
  image: string
}

type SeedData = {
  categories: CoreCategory[]
  subcategories: CoreSubCategory[]
}

let cachedSeed: SeedData | undefined

function loadSeedData(): SeedData {
  if (cachedSeed) return cachedSeed
  const seedPath = path.resolve(__dirname, '../../prisma/seed-data.json')
  cachedSeed = JSON.parse(fs.readFileSync(seedPath, 'utf8')) as SeedData
  return cachedSeed
}

/** The five storefront categories — always present, not mock catalog. */
export function loadCoreCategories(): CoreCategory[] {
  return loadSeedData().categories
}

export function loadCoreSubcategories(): CoreSubCategory[] {
  return loadSeedData().subcategories
}

export function coreCategorySlugs(): string[] {
  return loadCoreCategories().map((category) => category.slug)
}

/**
 * Ensures the hardcoded storefront categories and subcategories exist.
 * Syncs images from seed-data so catalog photos can be updated on deploy.
 * Empty subcategories are kept — the storefront shows an empty state.
 */
export async function ensureCoreCategories(client: PrismaClient = prisma) {
  const { categories, subcategories } = loadSeedData()

  for (const category of categories) {
    const existing =
      (await client.category.findUnique({ where: { slug: category.slug } })) ??
      (await client.category.findUnique({ where: { id: category.id } }))

    if (!existing) {
      await client.category.create({
        data: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          image: category.image,
          description: category.description,
        },
      })
      continue
    }

    if (existing.image !== category.image) {
      await client.category.update({
        where: { id: existing.id },
        data: { image: category.image },
      })
    }
  }

  const dbCategories = await client.category.findMany({
    where: { slug: { in: categories.map((category) => category.slug) } },
    select: { id: true, slug: true },
  })
  const categoryIdBySlug = new Map(dbCategories.map((category) => [category.slug, category.id]))

  for (const sub of subcategories) {
    const categoryId = categoryIdBySlug.get(sub.categorySlug)
    if (!categoryId) continue

    const existing =
      (await client.subCategory.findUnique({ where: { id: sub.id } })) ??
      (await client.subCategory.findFirst({
        where: { categorySlug: sub.categorySlug, slug: sub.slug },
      }))

    if (!existing) {
      await client.subCategory.create({
        data: {
          id: sub.id,
          categoryId,
          categorySlug: sub.categorySlug,
          name: sub.name,
          slug: sub.slug,
          image: sub.image,
        },
      })
      continue
    }

    if (existing.image !== sub.image || existing.categoryId !== categoryId) {
      await client.subCategory.update({
        where: { id: existing.id },
        data: {
          image: sub.image,
          categoryId,
          categorySlug: sub.categorySlug,
        },
      })
    }
  }

  console.log(`Core categories ready: ${categories.map((c) => c.slug).join(', ')}`)
  console.log(`Core subcategories ready: ${subcategories.length}`)
}
