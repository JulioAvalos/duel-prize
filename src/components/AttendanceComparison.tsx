import { Users } from 'lucide-react'
import type { Dispatch } from 'react'
import type { Action } from '@/hooks/useTournament'
import { formatMoney } from '@/lib/calculator'
import { cn } from '@/lib/utils'
import type { Breakdown } from '@/types/tournament'
import { Card, CardTitle } from './ui/primitives'

const HEADERS = [
  'Players',
  'Swiss rounds',
  'Revenue',
  'Places',
  'Placement packs',
  'Raffle packs',
  'Packs awarded',
  'Packs left',
  'Awarded cost',
  'Surplus',
  'Cash after box(es)',
]

export function AttendanceComparison({
  rows,
  current,
  dispatch,
}: {
  rows: Breakdown[]
  current: number
  dispatch: Dispatch<Action>
}) {
  return (
    <Card>
      <CardTitle>
        <Users className="size-5 text-primary" /> Attendance comparison
      </CardTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm tabular-nums">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              {HEADERS.map((h) => (
                <th key={h} className="px-2 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const negative = r.cashBalance < 0
              const isCurrent = r.participants === current
              return (
                <tr
                  key={r.participants}
                  data-testid={`row-${r.participants}`}
                  data-negative={negative}
                  onClick={() => dispatch({ type: 'setParticipants', value: r.participants })}
                  className={cn(
                    'cursor-pointer border-b border-border/60 hover:bg-surface-2',
                    negative && 'bg-danger/10',
                    isCurrent && 'outline-2 -outline-offset-2 outline-primary',
                  )}
                >
                  <td className="px-2 py-2 font-semibold">{r.participants}</td>
                  <td className="px-2 py-2">{r.swissRounds}</td>
                  <td className="px-2 py-2">{formatMoney(r.revenue)}</td>
                  <td className="px-2 py-2">{r.places}</td>
                  <td className="px-2 py-2">{r.placementPacks}</td>
                  <td className="px-2 py-2">{r.rafflePacks}</td>
                  <td className="px-2 py-2">{r.awardedPacks}</td>
                  <td className={cn('px-2 py-2', r.remainingPacks < 0 && 'text-danger')}>{r.remainingPacks}</td>
                  <td className="px-2 py-2">{formatMoney(r.awardedCost)}</td>
                  <td className={cn('px-2 py-2', r.surplus < 0 && 'text-danger')}>{formatMoney(r.surplus)}</td>
                  <td className={cn('px-2 py-2 font-medium', negative ? 'text-danger' : 'text-success')}>{formatMoney(r.cashBalance)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">Click a row to switch attendance. Red rows end with negative cash after buying the full box(es).</p>
    </Card>
  )
}
