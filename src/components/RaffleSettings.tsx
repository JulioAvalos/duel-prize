import { Ticket } from 'lucide-react'
import type { Dispatch } from 'react'
import type { Action } from '@/hooks/useTournament'
import type { PrizePlan } from '@/types/tournament'
import { Stepper, Switch } from './ui/primitives'

export function RaffleSettings({
  plan,
  participants,
  dispatch,
}: {
  plan: PrizePlan
  participants: number
  dispatch: Dispatch<Action>
}) {
  const eligible = Math.max(0, participants - plan.placements.length)
  return (
    <div className="mt-4 rounded-lg border border-border bg-surface-2 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-medium">
          <Ticket className="size-4 text-primary" /> Raffle
        </div>
        <Switch
          aria-label="Enable raffle"
          checked={plan.raffleEnabled}
          onCheckedChange={(enabled) => dispatch({ type: 'setRaffle', enabled })}
        />
      </div>
      {plan.raffleEnabled && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-muted">
            Packs · {eligible} eligible player{eligible === 1 ? '' : 's'} outside the placements
          </span>
          <Stepper
            label="raffle packs"
            value={plan.rafflePacks}
            min={0}
            onChange={(packs) => dispatch({ type: 'setRaffle', packs })}
          />
        </div>
      )}
    </div>
  )
}
