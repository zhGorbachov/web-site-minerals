import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import seedData from './seed-data.json' with { type: 'json' }

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding catalog...')

  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.productSubCategory.deleteMany()
  await prisma.product.deleteMany()
  await prisma.subCategory.deleteMany()
  await prisma.category.deleteMany()

  for (const category of seedData.categories) {
    await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image,
        description: category.description,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      },
    })
  }

  for (const sub of seedData.subcategories) {
    await prisma.subCategory.create({
      data: {
        id: sub.id,
        categoryId: sub.categoryId,
        categorySlug: sub.categorySlug,
        name: sub.name,
        slug: sub.slug,
        image: sub.image,
        createdAt: new Date(sub.createdAt),
        updatedAt: new Date(sub.updatedAt),
      },
    })
  }

  for (const product of seedData.products) {
    await prisma.product.create({
      data: {
        id: product.id,
        subCategoryId: product.subCategoryId,
        subCategorySlug: product.subCategorySlug,
        subCategories: {
          create: {
            subCategoryId: product.subCategoryId,
            subCategorySlug: product.subCategorySlug,
            position: 0,
          },
        },
        categorySlug: product.categorySlug,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        shortDescription: product.shortDescription,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice ?? null,
        stock: product.stock,
        images: product.images,
        attributes: product.attributes,
        variants: product.variants ?? [],
        featured: product.featured,
        popular: product.popular,
        isNew: product.isNew,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt),
      },
    })
  }

  console.log(
    `Seeded ${seedData.categories.length} categories, ${seedData.subcategories.length} subcategories, ${seedData.products.length} products`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
