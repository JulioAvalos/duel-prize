import {
  MAX_PARTICIPANTS,
  MIN_PARTICIPANTS,
  type AppState,
  type Breakdown,
  type PrizePlan,
  type Settings,
  type SettingsErrors,
  type Warning,
} from '@/types/tournament'
import { getPresetPlan } from './prizePresets'

export const DEFAULT_SETTINGS: Settings = {
  participants: 8,
  entryFee: 5,
  boxPrice: 70,
  boxes: 1,
  packsPerBox: 24,
}

export function defaultState(): AppState {
  return { settings: { ...DEFAULT_SETTINGS }, customPlans: {} }
}

const isPositive = (n: number) => Number.isFinite(n) && n > 0
const isPositiveInt = (n: number) => Number.isInteger(n) && n > 0

export function validateSettings(s: Settings): SettingsErrors {
  const e: SettingsErrors = {}
  if (
    !Number.isInteger(s.participants) ||
    s.participants < MIN_PARTICIPANTS ||
    s.participants > MAX_PARTICIPANTS
  ) {
    e.participants = `Must be a whole number from ${MIN_PARTICIPANTS} to ${MAX_PARTICIPANTS}`
  }
  if (Number.isNaN(s.entryFee)) e.entryFee = 'Enter the entry fee'
  else if (!isPositive(s.entryFee)) e.entryFee = 'Must be greater than 0'
  if (Number.isNaN(s.boxPrice)) e.boxPrice = 'Enter the box price'
  else if (!isPositive(s.boxPrice)) e.boxPrice = 'Must be greater than 0'
  if (!isPositiveInt(s.boxes)) e.boxes = 'Must be a whole number of at least 1'
  if (!isPositiveInt(s.packsPerBox)) e.packsPerBox = 'Must be a whole number of at least 1'
  return e
}

/** Rewarded places default to the attendance preset; a custom plan may add or remove places. */
export function resolvePlan(state: AppState, participants: number): PrizePlan {
  return state.customPlans[participants] ?? getPresetPlan(participants)
}

export function sumPlacements(plan: PrizePlan): number {
  return plan.placements.reduce((a, b) => a + b, 0)
}

export function raffleCount(plan: PrizePlan): number {
  return plan.raffleEnabled ? plan.rafflePacks : 0
}

export function validatePlan(plan: PrizePlan, participants: number, totalPacks: number): Warning[] {
  const warnings: Warning[] = []
  const places = plan.placements.length
  const raffle = raffleCount(plan)
  const awarded = sumPlacements(plan) + raffle
  const entrants = Math.max(0, participants - places)

  if (plan.placements.some((p) => !Number.isInteger(p) || p < 1)) {
    warnings.push({
      code: 'PLACEMENT_BELOW_MIN',
      message: 'Every rewarded placement needs at least 1 pack.',
    })
  }
  if (places > participants) {
    warnings.push({
      code: 'MORE_PLACES_THAN_PLAYERS',
      message: 'There are more rewarded placements than participants.',
    })
  }
  if (awarded > totalPacks) {
    warnings.push({
      code: 'OVER_INVENTORY',
      message: `Awarding ${awarded} packs but only ${totalPacks} are available.`,
    })
  }
  if (plan.raffleEnabled && entrants === 0) {
    warnings.push({
      code: 'NO_RAFFLE_ENTRANTS',
      message: 'All participants are rewarded, so there are no non-Top raffle entrants.',
    })
  } else if (plan.raffleEnabled && raffle > entrants) {
    warnings.push({
      code: 'RAFFLE_EXCEEDS_ENTRANTS',
      message: `${raffle} raffle packs but only ${entrants} eligible players (one pack per winner).`,
    })
  }
  return warnings
}

/** Swiss rounds: ceil(log2(players)), minimum 3 (4-8 -> 3, 9-16 -> 4, 17-32 -> 5). */
export function swissRounds(participants: number): number {
  if (!Number.isFinite(participants) || participants < 2) return 0
  return Math.max(3, Math.ceil(Math.log2(participants)))
}

/** Pure arithmetic: no rounding. Round only when displaying. */
export function calculate(settings: Settings, plan: PrizePlan): Breakdown {
  const { participants, entryFee, boxPrice, boxes, packsPerBox } = settings
  const revenue = participants * entryFee
  const costPerPack = packsPerBox > 0 ? boxPrice / packsPerBox : 0
  const placementPacks = sumPlacements(plan)
  const rafflePacks = raffleCount(plan)
  const awardedPacks = placementPacks + rafflePacks
  const totalPacks = boxes * packsPerBox
  const awardedCost = awardedPacks * costPerPack
  const boxCost = boxPrice * boxes
  return {
    participants,
    revenue,
    costPerPack,
    swissRounds: swissRounds(participants),
    places: plan.placements.length,
    placementPacks,
    rafflePacks,
    awardedPacks,
    totalPacks,
    remainingPacks: totalPacks - awardedPacks,
    awardedCost,
    surplus: revenue - awardedCost,
    boxCost,
    cashBalance: revenue - boxCost,
    warnings: validatePlan(plan, participants, totalPacks),
  }
}

export function buildComparison(state: AppState): Breakdown[] {
  const rows: Breakdown[] = []
  for (let p = MIN_PARTICIPANTS; p <= MAX_PARTICIPANTS; p++) {
    rows.push(calculate({ ...state.settings, participants: p }, resolvePlan(state, p)))
  }
  return rows
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMoney(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const rounded = Math.round(n * 100) / 100
  return usd.format(Object.is(rounded, -0) ? 0 : rounded)
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
}

const plural = (n: number) => `${n} pack${n === 1 ? '' : 's'}`

export function buildSummaryText(settings: Settings, plan: PrizePlan, b: Breakdown): string {
  const eligible = Math.max(0, settings.participants - plan.placements.length)
  const lines = [
    'Beyond the Brave - Tournament Summary',
    `Participants: ${settings.participants}`,
    `Swiss rounds: ${b.swissRounds}`,
    `Entry fee: ${formatMoney(settings.entryFee)}`,
    `Box: ${formatMoney(settings.boxPrice)} x ${settings.boxes} (${settings.packsPerBox} packs/box, ${formatMoney(b.costPerPack)} per pack)`,
    '',
    'Prizes:',
    ...plan.placements.map((p, i) => `  ${ordinal(i + 1)}: ${plural(p)}`),
    plan.raffleEnabled
      ? `  Raffle: ${plural(plan.rafflePacks)} (non-Top players, ${eligible} eligible)`
      : '  Raffle: none',
    `  Total awarded: ${plural(b.awardedPacks)}`,
    '',
    `Revenue: ${formatMoney(b.revenue)}`,
    `Awarded pack cost: ${formatMoney(b.awardedCost)}`,
    `Surplus on awarded packs: ${formatMoney(b.surplus)}`,
    `Cash balance after buying full box(es): ${formatMoney(b.cashBalance)}`,
    `Packs remaining: ${b.remainingPacks} of ${b.totalPacks}`,
  ]
  if (b.warnings.length) {
    lines.push('', 'Warnings:', ...b.warnings.map((w) => `  - ${w.message}`))
  }
  return lines.join('\n')
}
