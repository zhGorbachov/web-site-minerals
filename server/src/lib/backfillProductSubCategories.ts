import type { PrismaClient } from '@prisma/client'
import { prisma } from './prisma.js'

/**
 * Products used to carry a single `subCategoryId`. Multi-subcategory support moved the links
 * into `ProductSubCategory`, so rows saved before that change have no link yet. Recreate the
 * main link from the scalar fields; safe to run on every start.
 */
export async function backfillProductSubCategories(client: PrismaClient = prisma) {
  const orphans = await client.product.findMany({
    where: { subCategories: { none: {} } },
    select: { id: true, subCategoryId: true, subCategorySlug: true },
  })

  if (orphans.length === 0) return

  await client.productSubCategory.createMany({
    data: orphans.map((product) => ({
      productId: product.id,
      subCategoryId: product.subCategoryId,
      subCategorySlug: product.subCategorySlug,
      position: 0,
    })),
    skipDuplicates: true,
  })

  console.log(`Product subcategory links backfilled: ${orphans.length}`)
}
