import { AlertTriangle, Medal, Minus, Plus, RotateCcw } from 'lucide-react'
import type { Dispatch } from 'react'
import type { Action } from '@/hooks/useTournament'
import { ordinal } from '@/lib/calculator'
import { getPresetPlan } from '@/lib/prizePresets'
import { MAX_PLACES, type Breakdown, type PrizePlan } from '@/types/tournament'
import { RaffleSettings } from './RaffleSettings'
import { Alert, Badge, Button, Card, CardTitle, Stepper } from './ui/primitives'

export function PrizeDistribution({
  plan,
  participants,
  breakdown,
  isCustom,
  dispatch,
}: {
  plan: PrizePlan
  participants: number
  breakdown: Breakdown
  isCustom: boolean
  dispatch: Dispatch<Action>
}) {
  const presetPlaces = getPresetPlan(participants).placements.length
  return (
    <Card>
      <CardTitle className="justify-between">
        <span className="flex items-center gap-2">
          <Medal className="size-5 text-primary" /> Prize distribution
        </span>
        <Badge className={isCustom ? 'bg-primary/20 text-primary' : ''}>{isCustom ? 'Custom' : 'Preset'}</Badge>
      </CardTitle>

      <div className="mb-3 flex items-center justify-between gap-2 text-sm" data-testid="places-info">
        <span className="text-muted">
          Rewarded places {plan.placements.length === presetPlaces ? '(automatic)' : '(custom)'}: <strong className="text-foreground">Top {plan.placements.length}</strong>
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Remove placement"
            title="Remove placement"
            disabled={plan.placements.length <= 1}
            onClick={() => dispatch({ type: 'removePlacement' })}
          >
            <Minus className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Add placement"
            title="Add placement"
            disabled={plan.placements.length >= Math.min(MAX_PLACES, participants)}
            onClick={() => dispatch({ type: 'addPlacement' })}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="text-muted">Packs for placements (total)</span>
        <Stepper
          label="placement packs total"
          value={breakdown.placementPacks}
          min={plan.placements.length}
          max={99}
          onChange={(value) => dispatch({ type: 'setPlacementTotal', value })}
        />
      </div>

      <ul className="divide-y divide-border rounded-lg border border-border">
        {plan.placements.map((packs, i) => (
          <li key={i} className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="font-medium">{ordinal(i + 1)} place</span>
            <Stepper
              label={`${ordinal(i + 1)} place packs`}
              value={packs}
              min={1}
              onChange={(value) => dispatch({ type: 'setPlacementPacks', index: i, value })}
            />
          </li>
        ))}
      </ul>

      <RaffleSettings plan={plan} participants={participants} dispatch={dispatch} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm">
          Total awarded: <strong data-testid="awarded-total">{breakdown.awardedPacks}</strong> packs{' '}
          <span className="text-muted">
            ({breakdown.placementPacks} placement + {breakdown.rafflePacks} raffle)
          </span>
        </p>
        <Button variant="outline" size="sm" disabled={!isCustom} onClick={() => dispatch({ type: 'resetScenario' })}>
          <RotateCcw className="size-4" /> Reset {participants}-player prizes
        </Button>
      </div>

      {breakdown.warnings.length > 0 && (
        <div className="mt-3 space-y-2">
          {breakdown.warnings.map((w) => (
            <Alert key={w.code}>
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {w.message}
            </Alert>
          ))}
        </div>
      )}
    </Card>
  )
}
