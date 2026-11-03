import { Settings as SettingsIcon } from 'lucide-react'
import type { Dispatch } from 'react'
import type { Action } from '@/hooks/useTournament'
import { cn } from '@/lib/utils'
import { MAX_PARTICIPANTS, MIN_PARTICIPANTS, type Settings, type SettingsErrors } from '@/types/tournament'
import { Card, CardTitle, Label, NumberInput } from './ui/primitives'

function Field({ label, error, children, htmlFor }: { label: string; error?: string; children: React.ReactNode; htmlFor: string }) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <p className={cn('mt-1 min-h-4 text-xs text-danger')}>{error}</p>
    </div>
  )
}

export function TournamentSettings({
  settings,
  errors,
  swissRounds,
  dispatch,
}: {
  settings: Settings
  errors: SettingsErrors
  swissRounds: number
  dispatch: Dispatch<Action>
}) {
  const set = (key: keyof Settings) => (value: number) => dispatch({ type: 'setSetting', key, value })
  return (
    <Card>
      <CardTitle>
        <SettingsIcon className="size-5 text-primary" /> Tournament settings
      </CardTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="participants">Participants ({MIN_PARTICIPANTS}–{MAX_PARTICIPANTS})</Label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              aria-label="Participants slider"
              min={MIN_PARTICIPANTS}
              max={MAX_PARTICIPANTS}
              value={settings.participants}
              onChange={(e) => dispatch({ type: 'setParticipants', value: Number(e.target.value) })}
              className="h-2 flex-1"
            />
            <NumberInput
              id="participants"
              className="w-20"
              min={MIN_PARTICIPANTS}
              max={MAX_PARTICIPANTS}
              step={1}
              value={settings.participants}
              invalid={!!errors.participants}
              onValueChange={(n) => {
                if (Number.isFinite(n) && n >= MIN_PARTICIPANTS && n <= MAX_PARTICIPANTS) dispatch({ type: 'setParticipants', value: n })
              }}
            />
          </div>
          <p className="mt-1 min-h-4 text-xs text-danger">{errors.participants}</p>
          <p className="text-sm text-muted">
            Swiss rounds: <strong data-testid="swiss-rounds" className="text-foreground">{swissRounds}</strong>
          </p>
        </div>

        <Field label="Entry fee ($)" error={errors.entryFee} htmlFor="entryFee">
          <NumberInput id="entryFee" min={0} step={0.5} value={settings.entryFee} invalid={!!errors.entryFee} onValueChange={set('entryFee')} />
        </Field>

        <Field label="Box price ($)" error={errors.boxPrice} htmlFor="boxPrice">
          <NumberInput id="boxPrice" min={0} step={0.5} value={settings.boxPrice} invalid={!!errors.boxPrice} onValueChange={set('boxPrice')} />
        </Field>

        <Field label="Number of boxes" error={errors.boxes} htmlFor="boxes">
          <NumberInput id="boxes" min={1} step={1} value={settings.boxes} invalid={!!errors.boxes} onValueChange={set('boxes')} />
        </Field>

        <Field label="Packs per box" error={errors.packsPerBox} htmlFor="packsPerBox">
          <NumberInput id="packsPerBox" min={1} step={1} value={settings.packsPerBox} invalid={!!errors.packsPerBox} onValueChange={set('packsPerBox')} />
        </Field>
      </div>
    </Card>
  )
}
