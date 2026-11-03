export const MIN_PARTICIPANTS = 4
export const MAX_PARTICIPANTS = 18
export const MIN_PLACES = 1
export const MAX_PLACES = 18

export interface Settings {
  participants: number
  entryFee: number
  boxPrice: number
  boxes: number
  packsPerBox: number
}

export interface PrizePlan {
  /** Packs awarded per placement; index 0 = 1st place. */
  placements: number[]
  raffleEnabled: boolean
  rafflePacks: number
}

export interface AppState {
  settings: Settings
  /** Customized plans keyed by participant count. */
  customPlans: Record<number, PrizePlan>
}

export type WarningCode =
  | 'OVER_INVENTORY'
  | 'PLACEMENT_BELOW_MIN'
  | 'NO_RAFFLE_ENTRANTS'
  | 'RAFFLE_EXCEEDS_ENTRANTS'
  | 'MORE_PLACES_THAN_PLAYERS'

export interface Warning {
  code: WarningCode
  message: string
}

export interface Breakdown {
  participants: number
  revenue: number
  costPerPack: number
  swissRounds: number
  places: number
  placementPacks: number
  rafflePacks: number
  awardedPacks: number
  totalPacks: number
  remainingPacks: number
  awardedCost: number
  surplus: number
  boxCost: number
  cashBalance: number
  warnings: Warning[]
}

export type SettingsErrors = Partial<Record<keyof Settings, string>>
