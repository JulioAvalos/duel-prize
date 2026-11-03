import { beforeEach, describe, expect, it } from 'vitest'
import { defaultState, resolvePlan } from '@/lib/calculator'
import { getPresetPlan } from '@/lib/prizePresets'
import { STORAGE_KEY, loadState, parseState, saveState } from '@/lib/storage'
import { reducer } from './useTournament'

describe('reducer', () => {
  it('switching attendance loads that attendance preset', () => {
    const s = reducer(defaultState(), { type: 'setParticipants', value: 12 })
    expect(resolvePlan(s, 12).placements).toEqual(getPresetPlan(12).placements)
  })

  it('customizations are kept separately per scenario', () => {
    let s = defaultState()
    s = reducer(s, { type: 'setPlacementPacks', index: 0, value: 6 })
    s = reducer(s, { type: 'setParticipants', value: 12 })
    expect(resolvePlan(s, 12).placements[0]).toBe(5)
    s = reducer(s, { type: 'setParticipants', value: 8 })
    expect(resolvePlan(s, 8).placements[0]).toBe(6)
  })

  it('price changes do not alter prize quantities', () => {
    let s = reducer(defaultState(), { type: 'setPlacementPacks', index: 0, value: 6 })
    const before = JSON.stringify(s.customPlans)
    s = reducer(s, { type: 'setSetting', key: 'boxPrice', value: 75 })
    s = reducer(s, { type: 'setSetting', key: 'entryFee', value: 5 })
    expect(JSON.stringify(s.customPlans)).toBe(before)
  })

  it('adds and removes placements on top of the automatic count', () => {
    let s = defaultState()
    expect(resolvePlan(s, 8).placements).toHaveLength(4)
    s = reducer(s, { type: 'addPlacement' })
    expect(resolvePlan(s, 8).placements).toEqual([4, 3, 2, 1, 1])
    s = reducer(s, { type: 'removePlacement' })
    s = reducer(s, { type: 'removePlacement' })
    expect(resolvePlan(s, 8).placements).toEqual([4, 3, 2])
    s = reducer(s, { type: 'resetScenario' })
    expect(resolvePlan(s, 8).placements).toHaveLength(4)
  })

  it('keeps at least 1 place and at most one per participant', () => {
    let s = defaultState()
    for (let i = 0; i < 30; i++) s = reducer(s, { type: 'removePlacement' })
    expect(resolvePlan(s, 8).placements).toHaveLength(1)
    for (let i = 0; i < 30; i++) s = reducer(s, { type: 'addPlacement' })
    expect(resolvePlan(s, 8).placements).toHaveLength(8)
  })

  it('raffle can be disabled and adjusted', () => {
    let s = reducer(defaultState(), { type: 'setRaffle', enabled: false })
    expect(resolvePlan(s, 8).raffleEnabled).toBe(false)
    s = reducer(s, { type: 'setRaffle', enabled: true, packs: 1 })
    expect(resolvePlan(s, 8).rafflePacks).toBe(1)
  })

  it('resetScenario resets one, resetAll resets everything', () => {
    let s = reducer(defaultState(), { type: 'setPlacementPacks', index: 0, value: 6 })
    s = reducer(s, { type: 'setParticipants', value: 10 })
    s = reducer(s, { type: 'setPlacementPacks', index: 0, value: 9 })
    s = reducer(s, { type: 'resetScenario' })
    expect(resolvePlan(s, 10).placements[0]).toBe(5)
    expect(resolvePlan(s, 8).placements[0]).toBe(6)
    s = reducer(s, { type: 'resetAll' })
    expect(s).toEqual(defaultState())
  })

  it('clamps participants to 4..18', () => {
    expect(reducer(defaultState(), { type: 'setParticipants', value: 40 }).settings.participants).toBe(18)
    expect(reducer(defaultState(), { type: 'setParticipants', value: 2 }).settings.participants).toBe(4)
  })
})

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips state', () => {
    let s = reducer(defaultState(), { type: 'setSetting', key: 'boxPrice', value: 75 })
    s = reducer(s, { type: 'setSetting', key: 'entryFee', value: 5 })
    s = reducer(s, { type: 'setPlacementPacks', index: 1, value: 5 })
    saveState(s)
    expect(loadState()).toEqual(s)
  })

  it('falls back to defaults on corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadState().settings.participants).toBe(8)
    expect(loadState().customPlans).toEqual({})
  })

  it('sanitizes bad shapes', () => {
    const s = parseState({ settings: { participants: 99, entryFee: 'x' }, customPlans: { 9: { placements: 'no' }, 99: {} } })
    expect(s.settings.participants).toBe(18)
    expect(s.settings.entryFee).toBe(5)
    expect(s.customPlans).toEqual({})
  })
})
