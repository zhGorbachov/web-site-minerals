import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { optionalAuth, requireAuth } from '../lib/auth.js'

export const reviewsRouter = Router()

const ANONYMOUS_AUTHOR: Record<'uk' | 'en', string> = {
  uk: 'Анонім',
  en: 'Anonymous',
}

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(10).max(1000),
  language: z.enum(['uk', 'en']).optional(),
})

function mapReview(review: {
  id: string
  userId: string | null
  authorName: string
  rating: number
  text: string
  createdAt: Date
}) {
  return {
    id: review.id,
    userId: review.userId,
    author: review.authorName,
    rating: review.rating,
    text: review.text,
    createdAt: review.createdAt.toISOString(),
  }
}

reviewsRouter.get('/', async (req, res) => {
  const sort = req.query.sort === 'rating' ? 'rating' : 'date'
  const rawLimit = Number(req.query.limit)
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 20) : 5

  const reviews = await prisma.storeReview.findMany({
    take: limit,
    orderBy:
      sort === 'rating'
        ? [{ rating: 'desc' }, { createdAt: 'desc' }]
        : [{ createdAt: 'desc' }],
  })

  res.json(reviews.map(mapReview))
})

reviewsRouter.get('/mine', requireAuth, async (req, res) => {
  const review = await prisma.storeReview.findUnique({
    where: { userId: req.userId! },
  })
  res.json({ review: review ? mapReview(review) : null })
})

reviewsRouter.post('/', optionalAuth, async (req, res) => {
  const parsed = createReviewSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid_payload' })
    return
  }

  const language = parsed.data.language === 'en' ? 'en' : 'uk'

  if (req.userId) {
    const existing = await prisma.storeReview.findUnique({
      where: { userId: req.userId },
    })
    if (existing) {
      res.status(409).json({ error: 'already_reviewed' })
      return
    }

    const orderCount = await prisma.order.count({
      where: { userId: req.userId },
    })
    if (orderCount === 0) {
      res.status(403).json({ error: 'purchase_required' })
      return
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }

    const authorName = `${user.firstName} ${user.lastName.charAt(0)}.`.trim()

    const review = await prisma.storeReview.create({
      data: {
        userId: user.id,
        authorName,
        rating: parsed.data.rating,
        text: parsed.data.text,
      },
    })

    res.status(201).json(mapReview(review))
    return
  }

  const review = await prisma.storeReview.create({
    data: {
      userId: null,
      authorName: ANONYMOUS_AUTHOR[language],
      rating: parsed.data.rating,
      text: parsed.data.text,
    },
  })

  res.status(201).json(mapReview(review))
})
