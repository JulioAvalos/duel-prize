import { Banknote, Boxes, Coins, PiggyBank, Receipt, Scale } from 'lucide-react'
import type { ReactNode } from 'react'
import { formatMoney } from '@/lib/calculator'
import { cn } from '@/lib/utils'
import type { Breakdown } from '@/types/tournament'
import { Card, CardTitle } from './ui/primitives'

function Stat({
  icon,
  label,
  value,
  hint,
  tone,
  testId,
}: {
  icon: ReactNode
  label: string
  value: string
  hint?: string
  tone?: 'good' | 'bad' | 'neutral'
  testId: string
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted">
        {icon}
        {label}
      </div>
      <div
        data-testid={testId}
        className={cn('text-xl font-semibold tabular-nums', tone === 'bad' && 'text-danger', tone === 'good' && 'text-success')}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  )
}

export function FinancialSummary({ b, valid }: { b: Breakdown; valid: boolean }) {
  const money = (n: number) => (valid ? formatMoney(n) : '—')
  const tone = (n: number) => (!valid ? 'neutral' : n < 0 ? 'bad' : 'good')
  const icon = 'size-3.5'
  return (
    <Card>
      <CardTitle>
        <Banknote className="size-5 text-primary" /> Financial summary
      </CardTitle>
      <div className="grid grid-cols-2 gap-3">
        <Stat testId="revenue" icon={<Coins className={icon} />} label="Revenue" value={money(b.revenue)} hint={`${b.participants} entries`} />
        <Stat testId="awarded-cost" icon={<Receipt className={icon} />} label="Awarded-pack cost" value={money(b.awardedCost)} hint={`${b.awardedPacks} packs × ${money(b.costPerPack)}`} />
        <Stat testId="remaining" icon={<Boxes className={icon} />} label="Remaining boosters" value={valid ? `${b.remainingPacks}` : '—'} hint={`of ${valid ? b.totalPacks : '—'} purchased`} tone={valid && b.remainingPacks < 0 ? 'bad' : 'neutral'} />
        <Stat testId="box-cost" icon={<Boxes className={icon} />} label="Box purchase cost" value={money(b.boxCost)} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Stat
          testId="surplus"
          icon={<Scale className={icon} />}
          label="Surplus on awarded packs"
          value={money(b.surplus)}
          hint="Revenue − cost of packs given away. Not cash in hand."
          tone={tone(b.surplus)}
        />
        <Stat
          testId="cash-balance"
          icon={<PiggyBank className={icon} />}
          label="Cash balance after full box(es)"
          value={money(b.cashBalance)}
          hint="Revenue − full price of every box bought."
          tone={tone(b.cashBalance)}
        />
      </div>
    </Card>
  )
}
