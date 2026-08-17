import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { prisma } from './prisma.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export type CoreCategory = {
  id: string
  name: string
  slug: string
  image: string
  description: string
}

/** The five storefront categories — always present, not mock catalog. */
export function loadCoreCategories(): CoreCategory[] {
  const seedPath = path.resolve(__dirname, '../../prisma/seed-data.json')
  const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8')) as {
    categories: CoreCategory[]
  }
  return seedData.categories
}

export function coreCategorySlugs(): string[] {
  return loadCoreCategories().map((category) => category.slug)
}

/**
 * Ensures the hardcoded storefront categories exist.
 * Syncs image from seed-data so catalog photos can be updated on deploy.
 */
export async function ensureCoreCategories() {
  const categories = loadCoreCategories()

  for (const category of categories) {
    const existing =
      (await prisma.category.findUnique({ where: { slug: category.slug } })) ??
      (await prisma.category.findUnique({ where: { id: category.id } }))

    if (!existing) {
      await prisma.category.create({
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
      await prisma.category.update({
        where: { id: existing.id },
        data: { image: category.image },
      })
    }
  }

  console.log(`Core categories ready: ${categories.map((c) => c.slug).join(', ')}`)
}
