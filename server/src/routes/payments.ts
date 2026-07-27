import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import {
  decodeCallbackData,
  isFailedStatus,
  isPaidStatus,
  verifyCallback,
} from '../lib/liqpay.js'

export const paymentsRouter = Router()

paymentsRouter.post('/liqpay/callback', async (req, res) => {
  const data = typeof req.body?.data === 'string' ? req.body.data : ''
  const signature = typeof req.body?.signature === 'string' ? req.body.signature : ''

  if (!verifyCallback(data, signature)) {
    res.status(400).send('Invalid signature')
    return
  }

  let payload
  try {
    payload = decodeCallbackData(data)
  } catch {
    res.status(400).send('Invalid data')
    return
  }

  const liqpayOrderId = payload.order_id
  if (!liqpayOrderId) {
    res.status(200).send('OK')
    return
  }

  const order = await prisma.order.findUnique({
    where: { liqpayOrderId },
    include: { items: true },
  })

  if (!order) {
    res.status(200).send('OK')
    return
  }

  if (isPaidStatus(payload.status)) {
    if (order.paymentStatus !== 'paid') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          status: 'confirmed',
        },
      })
    }
    res.status(200).send('OK')
    return
  }

  if (isFailedStatus(payload.status)) {
    if (order.paymentStatus === 'paid' || order.status === 'cancelled') {
      res.status(200).send('OK')
      return
    }

    await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id: order.id } })
      if (!current || current.paymentStatus === 'paid' || current.status === 'cancelled') {
        return
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'failed',
          status: 'cancelled',
        },
      })

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }
    })

    res.status(200).send('OK')
    return
  }

  res.status(200).send('OK')
})
