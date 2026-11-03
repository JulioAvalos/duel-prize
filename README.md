# Beyond the Brave — Tournament Prize Calculator

Small client-side app for organizing friendly Yu-Gi-Oh! tournaments: it sizes booster prizes for 4–18 players and tracks pack costs against entry fees. No backend, no profit goal.

## Features

- **Settings:** participants (4–18), entry fee (default $5), box price (default $70), number of boxes, packs per box (24).
- **Swiss rounds:** calculated from attendance (`ceil(log2(players))`, minimum 3).
- **Prizes:** rewarded places are proposed automatically from attendance. You can type the packs for each place, set the total for placements (spread evenly), add or remove places, and set the raffle packs (raffle is for players outside the placements).
- **Financials:** revenue, awarded-pack cost, remaining boosters, surplus on awarded packs, and the cash balance after buying the full box(es), shown separately.
- **Attendance comparison:** every player count from 4 to 18, with negative balances highlighted.
- **Persistence:** everything is saved in LocalStorage. "Copy summary" puts a text breakdown on the clipboard.

## Stack

React, TypeScript, Vite, Tailwind CSS v4, Lucide icons, Vitest.

## Getting started

```bash
npm install
npm run dev      # development server
npm test         # run tests
npm run build    # production build
```

## Project layout

```
src/
  components/   UI sections (settings, prizes, financials, comparison)
  hooks/        useTournament (state + persistence)
  lib/          calculator, prizePresets, storage (pure logic)
  types/        shared types
```

See [`app-plan.md`](app-plan.md) for the original plan.
