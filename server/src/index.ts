import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './lib/env.js'
import { authRouter } from './routes/auth.js'
import { catalogRouter } from './routes/catalog.js'
import { cartRouter } from './routes/cart.js'
import { wishlistRouter } from './routes/wishlist.js'
import { ordersRouter } from './routes/orders.js'
import { paymentsRouter } from './routes/payments.js'
import { adminRouter } from './routes/admin.js'
import { uploadRouter, uploadsDir } from './routes/upload.js'
import { novaPoshtaRouter } from './routes/novaPoshta.js'
import { reviewsRouter } from './routes/reviews.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mediaDir = path.resolve(__dirname, '../../src/assets/mock')

const app = express()

app.use(
  cors({
    origin: env.clientOrigins.length === 1 ? env.clientOrigins[0] : env.clientOrigins,
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/media', express.static(mediaDir))
app.use('/uploads', express.static(uploadsDir))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRouter)
app.use('/api', catalogRouter)
app.use('/api/cart', cartRouter)
app.use('/api/wishlist', wishlistRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/admin', adminRouter)
app.use('/api/admin/upload', uploadRouter)
app.use('/api/nova-poshta', novaPoshtaRouter)
app.use('/api/reviews', reviewsRouter)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`)
})
