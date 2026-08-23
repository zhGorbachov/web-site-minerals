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

type SeedData = {
  categories: CoreCategory[]
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

export function coreCategorySlugs(): string[] {
  return loadCoreCategories().map((category) => category.slug)
}

/**
 * Ensures the five hardcoded storefront categories exist.
 * Syncs images from seed-data so catalog photos can be updated on deploy.
 * If a core category has no subcategories, creates a default one with the same
 * name so products can be added without a separate admin step.
 */
export async function ensureCoreCategories(client: PrismaClient = prisma) {
  const { categories } = loadSeedData()

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

  await ensureDefaultSubcategories(client, categories)

  console.log(`Core categories ready: ${categories.map((c) => c.slug).join(', ')}`)
}

async function ensureDefaultSubcategories(client: PrismaClient, categories: CoreCategory[]) {
  const created: string[] = []

  for (const category of categories) {
    const dbCat = await client.category.findUnique({ where: { slug: category.slug } })
    if (!dbCat) continue

    const existingCount = await client.subCategory.count({ where: { categoryId: dbCat.id } })
    if (existingCount > 0) continue

    const slug = category.slug
    const clash = await client.subCategory.findFirst({
      where: { categorySlug: dbCat.slug, slug },
    })
    if (clash) continue

    await client.subCategory.create({
      data: {
        id: `sub-core-${category.slug}`,
        categoryId: dbCat.id,
        categorySlug: dbCat.slug,
        name: category.name,
        slug,
        image: dbCat.image,
      },
    })
    created.push(category.slug)
  }

  if (created.length) {
    console.log(`Default subcategories created: ${created.join(', ')}`)
  }
}
