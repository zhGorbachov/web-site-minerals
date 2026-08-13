import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import seedData from './seed-data.json' with { type: 'json' }

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding catalog...')

  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.storeReview.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.wishlistItem.deleteMany()
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

  const demoReviews = [
    {
      authorName: 'Олена К.',
      rating: 5,
      text: 'Чудові браслети ручної роботи! Камінці справжні, упаковка акуратна. Замовляла вже двічі.',
      createdAt: new Date('2026-06-18T12:00:00Z'),
    },
    {
      authorName: 'Марія С.',
      rating: 5,
      text: 'Дуже швидка доставка і приємне спілкування. Аметист виглядає ще краще, ніж на фото.',
      createdAt: new Date('2026-05-22T09:30:00Z'),
    },
    {
      authorName: 'Ірина В.',
      rating: 4,
      text: "Гарний вибір ниток для плетіння. Якість на висоті, обов'язково замовлю ще.",
      createdAt: new Date('2026-04-10T16:45:00Z'),
    },
    {
      authorName: 'Андрій П.',
      rating: 5,
      text: 'Магазин відповідає швидко, товар якісний. Дякую за допомогу з вибором каменів.',
      createdAt: new Date('2026-03-28T11:15:00Z'),
    },
    {
      authorName: 'Наталія М.',
      rating: 4,
      text: 'Все сподобалось: і упаковка, і сервіс. Трохи довше чекала на відповідь у месенджері, але результатом задоволена.',
      createdAt: new Date('2026-02-14T18:20:00Z'),
    },
  ]

  await prisma.storeReview.createMany({ data: demoReviews })
  console.log(`Seeded ${demoReviews.length} store reviews`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
