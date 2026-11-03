import { useEffect, useMemo, useReducer } from 'react'
import {
  buildComparison,
  calculate,
  defaultState,
  resolvePlan,
  validateSettings,
} from '@/lib/calculator'
import { distributePacks, getPresetPlan } from '@/lib/prizePresets'
import { loadState, saveState } from '@/lib/storage'
import {
  MAX_PARTICIPANTS,
  MAX_PLACES,
  MIN_PARTICIPANTS,
  type AppState,
  type PrizePlan,
  type Settings,
} from '@/types/tournament'

export type Action =
  | { type: 'setSetting'; key: keyof Settings; value: number }
  | { type: 'setParticipants'; value: number }
  | { type: 'setPlacementPacks'; index: number; value: number }
  | { type: 'setPlacementTotal'; value: number }
  | { type: 'addPlacement' }
  | { type: 'removePlacement' }
  | { type: 'setRaffle'; enabled?: boolean; packs?: number }
  | { type: 'resetScenario'; participants?: number }
  | { type: 'resetAll' }

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

function editPlan(state: AppState, fn: (p: PrizePlan) => PrizePlan): AppState {
  const n = state.settings.participants
  const current = resolvePlan(state, n)
  const next = fn({ ...current, placements: [...current.placements] })
  return { ...state, customPlans: { ...state.customPlans, [n]: next } }
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'setSetting':
      // Price/quantity changes never touch prize plans (rule 6).
      return { ...state, settings: { ...state.settings, [action.key]: action.value } }
    case 'setParticipants': {
      const v = Number.isFinite(action.value) ? Math.round(action.value) : MIN_PARTICIPANTS
      return {
        ...state,
        settings: { ...state.settings, participants: clamp(v, MIN_PARTICIPANTS, MAX_PARTICIPANTS) },
      }
    }
    case 'setPlacementPacks':
      return editPlan(state, (p) => {
        p.placements[action.index] = Math.max(0, Math.floor(action.value) || 0)
        return p
      })
    case 'addPlacement':
      return editPlan(state, (p) => {
        if (p.placements.length < Math.min(MAX_PLACES, state.settings.participants)) p.placements.push(1)
        return p
      })
    case 'removePlacement':
      return editPlan(state, (p) => {
        if (p.placements.length > 1) p.placements.pop()
        return p
      })
    case 'setPlacementTotal':
      return editPlan(state, (p) => ({
        ...p,
        placements: distributePacks(p.placements, Number.isFinite(action.value) ? action.value : 0),
      }))
    case 'setRaffle':
      return editPlan(state, (p) => ({
        ...p,
        raffleEnabled: action.enabled ?? p.raffleEnabled,
        rafflePacks: action.packs === undefined ? p.rafflePacks : Math.max(0, Math.floor(action.packs) || 0),
      }))
    case 'resetScenario': {
      const n = action.participants ?? state.settings.participants
      const { [n]: _removed, ...rest } = state.customPlans
      void _removed
      return { ...state, customPlans: rest }
    }
    case 'resetAll':
      return defaultState()
  }
}

export function useTournament() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  return useMemo(() => {
    const { settings } = state
    const plan = resolvePlan(state, settings.participants)
    return {
      state,
      settings,
      plan,
      preset: getPresetPlan(settings.participants),
      isCustom: settings.participants in state.customPlans,
      errors: validateSettings(settings),
      breakdown: calculate(settings, plan),
      comparison: buildComparison(state),
      dispatch,
    }
  }, [state])
}
