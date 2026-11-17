/** Mimics AxiosError enough for existing `isAxiosError` checks. */
export class MockApiError extends Error {
  isAxiosError = true as const
  response: { status: number; data: { error: string; slug?: string; takenBy?: string } }

  constructor(status: number, error: string, details?: { slug?: string; takenBy?: string }) {
    super(error)
    this.name = 'MockApiError'
    this.response = { status, data: { error, ...details } }
  }
}
