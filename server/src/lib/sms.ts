import { env } from './env.js'

function toInternationalPhone(phone: string) {
  return `38${phone}`
}

/**
 * Sends OTP messages through TurboSMS. Without a token the server deliberately
 * does not contact a provider, which keeps local development safe and explicit.
 */
export async function sendVerificationSms(phone: string, code: string) {
  const text = `Код підтвердження Lux Stones: ${code}. Діє ${env.otpTtlMinutes} хв. Не повідомляйте його нікому.`

  if (!env.turboSmsToken) {
    if (env.nodeEnv !== 'production') {
      console.info(`[SMS disabled] Verification code for ${phone}: ${code}`)
      return
    }
    throw new Error('TurboSMS is not configured')
  }

  const response = await fetch('https://api.turbosms.ua/message/send.json', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.turboSmsToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipients: [toInternationalPhone(phone)],
      sms: {
        sender: env.turboSmsSender,
        text,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`TurboSMS request failed with status ${response.status}`)
  }
}
