import { Check, ClipboardCopy, RotateCcw, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AttendanceComparison } from './components/AttendanceComparison'
import { FinancialSummary } from './components/FinancialSummary'
import { PrizeDistribution } from './components/PrizeDistribution'
import { TournamentSettings } from './components/TournamentSettings'
import { Button } from './components/ui/primitives'
import { useTournament } from './hooks/useTournament'
import { buildSummaryText } from './lib/calculator'

export default function App() {
  const t = useTournament()
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null)
  const valid = Object.keys(t.errors).length === 0

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(null), 2000)
    return () => clearTimeout(id)
  }, [copied])

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(buildSummaryText(t.settings, t.plan, t.breakdown))
      setCopied('ok')
    } catch {
      setCopied('fail')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <Trophy className="size-7 text-primary" />
          Beyond the Brave — Tournament Prize Calculator
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={copySummary} disabled={!valid}>
            {copied === 'ok' ? <Check className="size-4" /> : <ClipboardCopy className="size-4" />}
            {copied === 'ok' ? 'Copied!' : copied === 'fail' ? 'Copy failed' : 'Copy summary'}
          </Button>
          <Button variant="outline" onClick={() => t.dispatch({ type: 'resetAll' })}>
            <RotateCcw className="size-4" /> Reset defaults
          </Button>
        </div>
      </header>

      <main className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <TournamentSettings settings={t.settings} errors={t.errors} swissRounds={t.breakdown.swissRounds} dispatch={t.dispatch} />
          <PrizeDistribution
            plan={t.plan}
            participants={t.settings.participants}
            breakdown={t.breakdown}
            isCustom={t.isCustom}
            dispatch={t.dispatch}
          />
        </div>
        <div className="space-y-4">
          <FinancialSummary b={t.breakdown} valid={valid} />
        </div>
        <div className="lg:col-span-2">
          <AttendanceComparison rows={t.comparison} current={t.settings.participants} dispatch={t.dispatch} />
        </div>
      </main>
      <p className="mt-6 text-center text-xs text-muted">Settings save automatically in this browser.</p>
    </div>
  )
}
