import { env } from './env.js'

type TurboSmsResponse = {
  response_code?: number
  response_status?: string
  response_result?: Array<{
    message_id?: string | null
    response_code?: number
    response_status?: string
    recipient?: string
  }> | null
}

const SUCCESS_CODES = new Set([0, 800, 801, 802, 803])

function toInternationalPhone(phone: string) {
  return `38${phone}`
}

/**
 * Sends OTP messages through TurboSMS. Without a token the server deliberately
 * does not contact a provider, which keeps local development safe and explicit.
 *
 * TurboSMS returns HTTP 200 even for business errors — always inspect response_code.
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

  const raw = await response.text()
  let data: TurboSmsResponse | null = null
  try {
    data = raw ? (JSON.parse(raw) as TurboSmsResponse) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    console.error('[TurboSMS] HTTP error', response.status, raw)
    throw new Error(`TurboSMS request failed with status ${response.status}`)
  }

  const codeStatus = data?.response_code
  if (data == null || codeStatus == null || !SUCCESS_CODES.has(codeStatus)) {
    console.error('[TurboSMS] send rejected', {
      phone: toInternationalPhone(phone),
      sender: env.turboSmsSender,
      response_code: codeStatus,
      response_status: data?.response_status,
      response_result: data?.response_result,
    })
    throw new Error(
      `TurboSMS rejected send: ${data?.response_status ?? 'UNKNOWN'} (${codeStatus ?? 'no_code'})`,
    )
  }

  const failedRecipient = data.response_result?.find(
    (item) => item.message_id == null && item.response_code != null && item.response_code !== 0,
  )
  if (failedRecipient) {
    console.error('[TurboSMS] recipient rejected', failedRecipient)
    throw new Error(
      `TurboSMS rejected recipient: ${failedRecipient.response_status ?? 'UNKNOWN'} (${failedRecipient.response_code})`,
    )
  }

  console.info('[TurboSMS] queued', {
    phone: toInternationalPhone(phone),
    response_code: codeStatus,
    response_status: data.response_status,
    message_id: data.response_result?.[0]?.message_id ?? null,
  })
}
