import crypto from 'node:crypto'
import { env, isLiqPayConfigured } from './env.js'

export const LIQPAY_CHECKOUT_URL = 'https://www.liqpay.ua/api/3/checkout'

export type LiqPayCheckoutParams = {
  amount: number
  orderId: string
  description: string
  language?: 'uk' | 'en'
  resultUrl: string
  serverUrl: string
}

export type LiqPayCheckoutPayload = {
  data: string
  signature: string
  checkoutUrl: string
}

export type LiqPayCallbackPayload = {
  order_id?: string
  status?: string
  amount?: number
  currency?: string
  err_code?: string
  err_description?: string
  payment_id?: number
  [key: string]: unknown
}

/** Official LiqPay SDK uses SHA-1: base64(sha1(private_key + data + private_key)). */
function sign(data: string): string {
  return crypto
    .createHash('sha1')
    .update(env.liqpayPrivateKey + data + env.liqpayPrivateKey)
    .digest('base64')
}

export function encodeCheckout(params: LiqPayCheckoutParams): LiqPayCheckoutPayload {
  if (!isLiqPayConfigured()) {
    throw new Error('LiqPay is not configured')
  }

  const payment = {
    version: 3,
    public_key: env.liqpayPublicKey,
    action: 'pay',
    amount: Number(params.amount.toFixed(2)),
    currency: 'UAH',
    description: params.description,
    order_id: params.orderId,
    language: params.language ?? 'uk',
    result_url: params.resultUrl,
    server_url: params.serverUrl,
  }

  const data = Buffer.from(JSON.stringify(payment)).toString('base64')
  const signature = sign(data)

  return {
    data,
    signature,
    checkoutUrl: LIQPAY_CHECKOUT_URL,
  }
}

export function verifyCallback(data: string, signature: string): boolean {
  if (!isLiqPayConfigured() || !data || !signature) return false
  const expected = sign(data)
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function decodeCallbackData(data: string): LiqPayCallbackPayload {
  return JSON.parse(Buffer.from(data, 'base64').toString('utf8')) as LiqPayCallbackPayload
}

export function isPaidStatus(status: string | undefined): boolean {
  return status === 'success' || status === 'sandbox' || status === 'wait_accept'
}

export function isFailedStatus(status: string | undefined): boolean {
  return status === 'failure' || status === 'error' || status === 'reversed'
}
