import { MAX_PARTICIPANTS, MAX_PLACES, MIN_PARTICIPANTS, type AppState, type PrizePlan } from '@/types/tournament'
import { DEFAULT_SETTINGS, defaultState } from './calculator'

export const STORAGE_KEY = 'btb-calculator:v1'

const num = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback

function parsePlan(raw: unknown): PrizePlan | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (!Array.isArray(r.placements) || r.placements.length === 0 || r.placements.length > MAX_PLACES) return null
  if (!r.placements.every((p) => typeof p === 'number' && Number.isFinite(p))) return null
  return {
    placements: r.placements as number[],
    raffleEnabled: r.raffleEnabled !== false,
    rafflePacks: Math.max(0, Math.floor(num(r.rafflePacks, 0))),
  }
}

/** Validates unknown JSON into an AppState, falling back to defaults per field. */
export function parseState(raw: unknown): AppState {
  const base = defaultState()
  if (!raw || typeof raw !== 'object') return base
  const r = raw as Record<string, unknown>
  const s = (r.settings && typeof r.settings === 'object' ? r.settings : {}) as Record<string, unknown>
  const participants = Math.round(num(s.participants, DEFAULT_SETTINGS.participants))
  base.settings = {
    participants: Math.min(MAX_PARTICIPANTS, Math.max(MIN_PARTICIPANTS, participants)),
    entryFee: num(s.entryFee, DEFAULT_SETTINGS.entryFee),
    boxPrice: num(s.boxPrice, DEFAULT_SETTINGS.boxPrice),
    boxes: num(s.boxes, DEFAULT_SETTINGS.boxes),
    packsPerBox: num(s.packsPerBox, DEFAULT_SETTINGS.packsPerBox),
  }
  if (r.customPlans && typeof r.customPlans === 'object') {
    for (const [k, v] of Object.entries(r.customPlans as Record<string, unknown>)) {
      const key = Number(k)
      const plan = parsePlan(v)
      if (Number.isInteger(key) && key >= MIN_PARTICIPANTS && key <= MAX_PARTICIPANTS && plan) {
        base.customPlans[key] = plan
      }
    }
  }
  return base
}

export function loadState(): AppState {
  try {
    const text = localStorage.getItem(STORAGE_KEY)
    if (!text) return defaultState()
    return parseState(JSON.parse(text))
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage unavailable or full: app keeps working in memory
  }
}
