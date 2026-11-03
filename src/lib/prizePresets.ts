import type { PrizePlan } from '@/types/tournament'

const PRESET_PLACEMENTS: Record<number, number[]> = {
  4: [2, 1],
  5: [3, 2, 1],
  6: [3, 2, 1],
  7: [3, 2, 1, 1],
  8: [4, 3, 2, 1],
  9: [4, 3, 2, 1],
  10: [5, 3, 2, 1, 1],
  11: [5, 3, 2, 1, 1],
  12: [5, 4, 3, 2, 1, 1],
  13: [5, 4, 3, 2, 1, 1],
  14: [6, 4, 3, 2, 1, 1, 1],
  15: [6, 4, 3, 2, 1, 1, 1],
  16: [6, 4, 3, 2, 1, 1, 1, 1],
  17: [6, 4, 3, 2, 1, 1, 1, 1],
  18: [7, 4, 3, 2, 1, 1, 1, 1],
}

const DEFAULT_RAFFLE_PACKS = 2

export function getPresetPlan(participants: number): PrizePlan {
  const key = Math.min(18, Math.max(4, Math.round(participants)))
  return {
    placements: [...PRESET_PLACEMENTS[key]],
    raffleEnabled: true,
    rafflePacks: DEFAULT_RAFFLE_PACKS,
  }
}

/**
 * Set the placement total by spreading the difference evenly across all current placements.
 * Adding: each extra pack goes to the place with the fewest packs (earliest on ties).
 * Removing: each pack comes from the place with the most packs (latest on ties).
 * Every place keeps at least 1 pack, so the total is raised to the number of places if lower.
 */
export function distributePacks(current: number[], total: number): number[] {
  const result = current.map((c) => Math.max(1, Math.floor(c) || 1))
  const target = Math.max(result.length, Math.floor(total))
  let sum = result.reduce((a, b) => a + b, 0)
  while (sum < target) {
    let idx = 0
    for (let i = 1; i < result.length; i++) if (result[i] < result[idx]) idx = i
    result[idx] += 1
    sum += 1
  }
  while (sum > target) {
    let idx = -1
    for (let i = 0; i < result.length; i++) {
      if (result[i] > 1 && (idx === -1 || result[i] >= result[idx])) idx = i
    }
    if (idx === -1) break
    result[idx] -= 1
    sum -= 1
  }
  return result
}
