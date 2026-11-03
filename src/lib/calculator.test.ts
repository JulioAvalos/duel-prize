import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SETTINGS,
  buildComparison,
  buildSummaryText,
  calculate,
  defaultState,
  formatMoney,
  swissRounds,
  validatePlan,
  validateSettings,
} from './calculator'
import { getPresetPlan } from './prizePresets'

const TEST_SETTINGS = { ...DEFAULT_SETTINGS, entryFee: 6, boxPrice: 83 }

describe('defaults', () => {
  it('default entry fee is $5 and box price is $70', () => {
    expect(DEFAULT_SETTINGS.entryFee).toBe(5)
    expect(DEFAULT_SETTINGS.boxPrice).toBe(70)
    expect(validateSettings(DEFAULT_SETTINGS)).toEqual({})
  })
})

describe('8-player baseline', () => {
  const plan = getPresetPlan(8)
  const b = calculate(TEST_SETTINGS, plan)

  it('awards 10 placement + 2 raffle = 12 packs', () => {
    expect(plan.placements).toEqual([4, 3, 2, 1])
    expect(b.placementPacks).toBe(10)
    expect(b.rafflePacks).toBe(2)
    expect(b.awardedPacks).toBe(12)
  })

  it('matches plan financials', () => {
    expect(b.revenue).toBe(48)
    expect(b.awardedCost).toBeCloseTo(41.5, 10)
    expect(b.surplus).toBeCloseTo(6.5, 10)
    expect(b.remainingPacks).toBe(12)
    expect(b.cashBalance).toBe(-35)
    expect(b.warnings).toEqual([])
  })

  it('12 x (83/24) = 41.50', () => {
    expect(12 * (83 / 24)).toBeCloseTo(41.5, 10)
  })
})

describe('attendance 4-18', () => {
  it('revenue and cost per pack are correct for every count', () => {
    for (let p = 4; p <= 18; p++) {
      const b = calculate({ ...TEST_SETTINGS, participants: p }, getPresetPlan(p))
      expect(b.revenue).toBe(p * 6)
      expect(b.costPerPack).toBeCloseTo(83 / 24, 10)
    }
  })

  it('presets give every place >= 1 pack and fit one box without warnings', () => {
    for (let p = 4; p <= 18; p++) {
      const plan = getPresetPlan(p)
      expect(plan.placements.every((x) => x >= 1)).toBe(true)
      expect(plan.placements.length).toBeGreaterThanOrEqual(2)
      expect(plan.placements.length).toBeLessThanOrEqual(8)
      expect(plan.placements.length).toBeLessThan(p)
      expect(calculate({ ...TEST_SETTINGS, participants: p }, plan).warnings).toEqual([])
    }
  })

  it('comparison returns 15 rows (4-18) and uses custom plans', () => {
    const state = defaultState()
    state.customPlans[10] = { placements: [2, 1, 1, 1], raffleEnabled: false, rafflePacks: 2 }
    const rows = buildComparison(state)
    expect(rows).toHaveLength(15)
    expect(rows[0].participants).toBe(4)
    expect(rows[14].participants).toBe(18)
    expect(rows[6].participants).toBe(10)
    expect(rows[6].places).toBe(4)
    expect(rows[6].awardedPacks).toBe(5)
    expect(rows[4].awardedPacks).toBe(12)
  })
})

describe('validation', () => {
  it('rejects invalid prices and quantities', () => {
    const e = validateSettings({ participants: 30, entryFee: 0, boxPrice: -1, boxes: 1.5, packsPerBox: NaN })
    expect(Object.keys(e).sort()).toEqual(['boxPrice', 'boxes', 'entryFee', 'packsPerBox', 'participants'])
    expect(validateSettings(TEST_SETTINGS)).toEqual({})
  })

  it('warns on over-allocation', () => {
    const w = validatePlan({ placements: [10, 10, 5, 1], raffleEnabled: true, rafflePacks: 2 }, 8, 24)
    expect(w.map((x) => x.code)).toContain('OVER_INVENTORY')
  })

  it('warns on placement below 1', () => {
    const w = validatePlan({ placements: [3, 0], raffleEnabled: false, rafflePacks: 0 }, 8, 24)
    expect(w.map((x) => x.code)).toContain('PLACEMENT_BELOW_MIN')
  })

  it('raffle eligibility: no entrants when all rewarded', () => {
    const w = validatePlan({ placements: [1, 1, 1, 1, 1, 1, 1, 1], raffleEnabled: true, rafflePacks: 2 }, 8, 24)
    expect(w.map((x) => x.code)).toContain('NO_RAFFLE_ENTRANTS')
  })

  it('raffle packs cannot exceed eligible players', () => {
    const w = validatePlan({ placements: [1, 1, 1, 1, 1, 1, 1], raffleEnabled: true, rafflePacks: 2 }, 8, 24)
    expect(w.map((x) => x.code)).toContain('RAFFLE_EXCEEDS_ENTRANTS')
  })

  it('disabled raffle counts zero and gives no raffle warning', () => {
    const plan = { placements: [1, 1, 1, 1, 1, 1, 1, 1], raffleEnabled: false, rafflePacks: 2 }
    expect(calculate({ ...TEST_SETTINGS }, plan).rafflePacks).toBe(0)
    expect(validatePlan(plan, 8, 24)).toEqual([])
  })
})

describe('swiss rounds', () => {
  it('follows ceil(log2) with a minimum of 3', () => {
    const expected: Record<number, number> = { 4: 3, 5: 3, 8: 3, 9: 4, 16: 4, 17: 5, 18: 5 }
    for (const [p, r] of Object.entries(expected)) expect(swissRounds(Number(p))).toBe(r)
  })
  it('is included in breakdown and summary', () => {
    const plan = getPresetPlan(8)
    const b = calculate(TEST_SETTINGS, plan)
    expect(b.swissRounds).toBe(3)
    expect(buildSummaryText(TEST_SETTINGS, plan, b)).toContain('Swiss rounds: 3')
  })
})

describe('formatting', () => {
  it('formats money to two decimals', () => {
    expect(formatMoney(41.5)).toBe('$41.50')
    expect(formatMoney(-35)).toBe('-$35.00')
    expect(formatMoney(-0.001)).toBe('$0.00')
  })

  it('summary includes key figures', () => {
    const plan = getPresetPlan(8)
    const text = buildSummaryText(TEST_SETTINGS, plan, calculate(TEST_SETTINGS, plan))
    expect(text).toContain('Total awarded: 12 packs')
    expect(text).toContain('Surplus on awarded packs: $6.50')
    expect(text).toContain('-$35.00')
  })
})

import { distributePacks } from './prizePresets'
describe('distributePacks', () => {
  it('keeps total and min 1 per place for any target', () => {
    expect(distributePacks([4, 3, 2, 1], 10)).toEqual([4, 3, 2, 1])
    for (let t = 4; t <= 40; t++) {
      const r = distributePacks([4, 3, 2, 1], t)
      expect(r.reduce((a, b) => a + b, 0)).toBe(t)
      expect(r.every((x) => x >= 1)).toBe(true)
    }
  })
  it('spreads added packs evenly across all placements', () => {
    expect(distributePacks([4, 3, 2, 1], 11)).toEqual([4, 3, 2, 2])
    expect(distributePacks([4, 3, 2, 1], 14)).toEqual([4, 4, 3, 3])
    expect(distributePacks([1, 1, 1, 1], 8)).toEqual([2, 2, 2, 2])
  })
  it('removes packs from the largest placements first', () => {
    expect(distributePacks([4, 3, 2, 1], 9)).toEqual([3, 3, 2, 1])
    expect(distributePacks([4, 3, 2, 1], 8)).toEqual([3, 2, 2, 1])
  })
  it('raises total to number of places when too low', () => {
    expect(distributePacks([4, 3, 2, 1], 1)).toEqual([1, 1, 1, 1])
  })
})
