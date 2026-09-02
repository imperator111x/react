const STORAGE_KEY = 'bot-check-verified'
const CHALLENGE_TTL_MS = 30 * 60 * 1000 // 30 Minuten

export interface BotChallenge {
  a: number
  b: number
  createdAt: number
}

export function createBotChallenge(): BotChallenge {
  return {
    a: Math.floor(Math.random() * 8) + 2,
    b: Math.floor(Math.random() * 8) + 2,
    createdAt: Date.now(),
  }
}

export function verifyBotChallenge(
  challenge: BotChallenge,
  answer: string,
  honeypot: string
): boolean {
  if (honeypot.trim() !== '') return false
  if (Date.now() - challenge.createdAt > CHALLENGE_TTL_MS) return false
  const parsed = Number.parseInt(answer.trim(), 10)
  return parsed === challenge.a + challenge.b
}

export function isBotCheckVerified(): boolean {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const passedAt = Number.parseInt(raw, 10)
    if (Number.isNaN(passedAt)) return false
    return Date.now() - passedAt < CHALLENGE_TTL_MS
  } catch {
    return false
  }
}

export function markBotCheckVerified(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
}

export function clearBotCheckVerified(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
