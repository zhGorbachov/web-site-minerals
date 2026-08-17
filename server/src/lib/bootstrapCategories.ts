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
 * Does not overwrite names/images if the row is already there.
 */
export async function ensureCoreCategories() {
  const categories = loadCoreCategories()

  for (const category of categories) {
    const bySlug = await prisma.category.findUnique({ where: { slug: category.slug } })
    if (bySlug) continue

    const byId = await prisma.category.findUnique({ where: { id: category.id } })
    if (byId) continue

    await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image,
        description: category.description,
      },
    })
  }

  console.log(`Core categories ready: ${categories.map((c) => c.slug).join(', ')}`)
}
