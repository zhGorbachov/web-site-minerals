import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { ensureCoreCategories } from '../src/lib/bootstrapCategories.js'
import { demoReviews } from './demo-reviews.js'
import seedData from './seed-data.json' with { type: 'json' }

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing seeded mock catalog...')

  const seedProductIds = seedData.products.map((product) => product.id)

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

  await ensureCoreCategories(prisma)
  console.log(
    `Kept core categories and ${seedData.subcategories.length} subcategories (empty ones stay for the storefront)`,
  )

  let deletedReviews = 0
  for (const review of demoReviews) {
    const result = await prisma.storeReview.deleteMany({
      where: { authorName: review.authorName, text: review.text, userId: null },
    })
    deletedReviews += result.count
  }
  console.log(`Removed ${deletedReviews} demo store reviews`)
  console.log('Done. Core categories, subcategories, users and bootstrap admin were not removed.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
