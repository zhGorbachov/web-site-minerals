import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { demoReviews } from './demo-reviews.js'
import seedData from './seed-data.json' with { type: 'json' }

const prisma = new PrismaClient()

const coreCategorySlugs = new Set(seedData.categories.map((category) => category.slug))
const coreCategoryIds = new Set(seedData.categories.map((category) => category.id))

async function main() {
  console.log('Clearing seeded mock catalog...')

  const seedProductIds = seedData.products.map((product) => product.id)
  const seedSubcategoryIds = seedData.subcategories.map((sub) => sub.id)

  const mockProducts = await prisma.product.findMany({
    where: {
      OR: [
        { id: { in: seedProductIds } },
        { id: { startsWith: 'prod-mock-' } },
        { slug: { startsWith: 'mock-novynka-' } },
        { sku: { startsWith: 'MOCK-' } },
      ],
    },
    select: { id: true },
  })
  const productIds = mockProducts.map((product) => product.id)

  if (productIds.length > 0) {
    const deletedOrderItems = await prisma.orderItem.deleteMany({
      where: { productId: { in: productIds } },
    })

    const emptyOrders = await prisma.order.findMany({
      where: { items: { none: {} } },
      select: { id: true },
    })
    const deletedOrders =
      emptyOrders.length > 0
        ? await prisma.order.deleteMany({ where: { id: { in: emptyOrders.map((order) => order.id) } } })
        : { count: 0 }

    const deletedCartItems = await prisma.cartItem.deleteMany({
      where: { productId: { in: productIds } },
    })
    const deletedWishlistItems = await prisma.wishlistItem.deleteMany({
      where: { productId: { in: productIds } },
    })
    const deletedProducts = await prisma.product.deleteMany({
      where: { id: { in: productIds } },
    })

    console.log(
      `Removed ${deletedProducts.count} products, ${deletedOrderItems.count} order items, ${deletedOrders.count} empty orders, ${deletedCartItems.count} cart items, ${deletedWishlistItems.count} wishlist items`,
    )
  } else {
    console.log('No seeded mock products found')
  }

  const leftoverSeedSubs = await prisma.subCategory.findMany({
    where: { id: { in: seedSubcategoryIds } },
    select: { id: true, _count: { select: { products: true } } },
  })
  const emptySubIds = leftoverSeedSubs.filter((sub) => sub._count.products === 0).map((sub) => sub.id)
  if (emptySubIds.length > 0) {
    const deletedSubs = await prisma.subCategory.deleteMany({ where: { id: { in: emptySubIds } } })
    console.log(`Removed ${deletedSubs.count} empty seeded subcategories`)
  }

  for (const category of seedData.categories) {
    const existing =
      (await prisma.category.findUnique({ where: { slug: category.slug } })) ??
      (await prisma.category.findUnique({ where: { id: category.id } }))
    if (existing) continue

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
  console.log(
    `Kept core categories: ${[...coreCategorySlugs].join(', ')} (ids ${[...coreCategoryIds].join(', ')})`,
  )

  let deletedReviews = 0
  for (const review of demoReviews) {
    const result = await prisma.storeReview.deleteMany({
      where: { authorName: review.authorName, text: review.text, userId: null },
    })
    deletedReviews += result.count
  }
  console.log(`Removed ${deletedReviews} demo store reviews`)
  console.log('Done. Core categories, users and bootstrap admin were not removed.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
