import type { PrismaClient } from '@prisma/client'
import { prisma } from './prisma.js'

/**
 * Products used to store a single `video`. Copy that clip into `videos` when the list is still
 * empty, so the gallery and the admin form read one field. Safe to run on every start.
 */
export async function backfillProductVideos(client: PrismaClient = prisma) {
  const updated = await client.$executeRaw`
    UPDATE "Product"
    SET "videos" = ARRAY["video"]
    WHERE "video" IS NOT NULL
      AND cardinality("videos") = 0
  `

  if (Number(updated) > 0) {
    console.log(`Product videos backfilled: ${updated}`)
  }
}
