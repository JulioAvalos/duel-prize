BEYOND THE BRAVE — TOURNAMENT CALCULATOR
React + TypeScript Development Plan

GOAL
Build a small, responsive app for organizing friendly Yu-Gi-Oh! tournaments, scaling prize distributions for 8–16 participants, and tracking booster costs without aiming for profit.

1. TECHNOLOGY STACK
- React + TypeScript: UI and type safety
- Vite: development server and builds
- Tailwind CSS: responsive styling
- shadcn/ui: reusable interface components
- Lucide React: icons
- LocalStorage: save settings and custom distributions
- Vitest: calculation and state-management tests
- No backend or authentication for the MVP

2. APPLICATION LAYOUT
- Header: Beyond the Brave — Tournament Prize Calculator
- Tournament settings: participants, entry fee, box price, number of boxes, packs per box
- Financial summary: revenue, awarded-booster cost, surplus on awarded packs, full-box cash balance, remaining boosters
- Prize distribution: placement-by-placement allocation and raffle
- Attendance comparison: 8–16 player scenarios
- Actions: reset defaults, copy summary, save settings automatically

Initial example (8 participants, $6 entry, $83 box, 24 packs):
- Top 4 prizes: 4 / 3 / 2 / 1 = 10 packs
- Raffle: 2 packs, one for each non-Top winner
- Total awarded: 12 packs
- Revenue: $48.00
- Cost of awarded packs: $41.50
- Surplus on awarded packs: $6.50
- Remaining inventory: 12 packs
- Cash balance after purchasing the full $83 box: -$35.00

3. IMPLEMENTATION PHASES

PHASE 1 — TOURNAMENT CONFIGURATION
- Participant count: 8–16 (slider and numeric input)
- Entry fee: presets of $5 and $6, plus custom value
- Box price: editable, with $83 default and $75 preset
- Packs per box: 24 by default
- Number of boxes: editable, default 1
- Validate positive prices and sensible integer quantities

PHASE 2 — PRIZE DISTRIBUTION
- Automatically propose Top 4–8 prizes based on attendance
- Starting allocation at 8 players: 4, 3, 2, 1
- Two raffle boosters by default, reserved for players outside rewarded placements
- Allow users to edit the number of packs for each placement
- Allow raffle packs to be enabled, disabled, or adjusted
- Preserve customized prize distributions separately for each attendance scenario
- Warn if total awarded packs exceed inventory
- Ensure each rewarded placement has at least one pack

PHASE 3 — FINANCIAL CALCULATIONS
- Revenue = participants × entry fee
- Cost per pack = box price ÷ packs per box
- Awarded pack cost = awarded packs × cost per pack
- Surplus on awarded packs = revenue − awarded pack cost
- Cash balance after full-box purchases = revenue − (box price × number of boxes)
- Remaining packs = total purchased packs − awarded packs
- Display money to two decimals, without premature rounding
- Distinguish surplus based on awarded packs from actual cash remaining

PHASE 4 — ATTENDANCE COMPARISON
- Show scenarios for every participant count from 8 through 16
- Columns: participants, revenue, rewarded places, placement packs, raffle packs, total packs awarded, packs remaining, awarded-pack cost, surplus, full-box cash balance
- Highlight scenarios with negative balances
- Reflect customized settings and attendance-specific prize presets

PHASE 5 — PERSISTENCE AND SHARING
- Save configuration and custom prize plans in LocalStorage
- Restore saved settings on reload
- Reset all or one scenario to default values
- Copy a human-readable tournament breakdown to the clipboard

4. BUSINESS RULES
1. Never silently allocate more packs than are available.
2. Raffle packs count toward the total awarded inventory.
3. Only players outside the rewarded placements are eligible for the raffle.
4. Each rewarded placement gets at least one pack.
5. Attendance changes load that attendance's preset or saved customization.
6. Price changes recalculate costs but do not alter prize quantities.
7. Use precise arithmetic internally and round currency only for display.
8. If all participants are rewarded, warn that there are no non-Top raffle entrants.

5. SUGGESTED PROJECT STRUCTURE
   src/
   components/
   TournamentSettings.tsx
   FinancialSummary.tsx
   PrizeDistribution.tsx
   RaffleSettings.tsx
   AttendanceComparison.tsx
   hooks/
   useTournament.ts
   lib/
   calculator.ts
   prizePresets.ts
   storage.ts
   types/
   tournament.ts
   App.tsx
   main.tsx

6. TESTING
- Verify revenue and per-pack calculations for 8–16 participants
- Verify the 8-player baseline: 10 Top 4 packs + 2 raffle packs = 12
- Verify prize-cost calculation: 12 × ($83 / 24) = $41.50
- Test invalid prices, inventory over-allocation, and raffle eligibility
- Test scenario switching, persistence, and reset functionality
- Verify mobile and desktop layouts

7. DEFINITION OF DONE
- User can select any attendance from 8–16 players
- App proposes Top 4–8 prizes and supports manual overrides
- Financial figures update immediately and accurately
- Raffle boosters are counted correctly
- App clearly separates full-box cash balance from awarded-pack surplus
- Settings persist after reload
- UI is responsive and usable without a backend

IMPLEMENTATION DECISION
Recommended approach: automatic attendance-based prize presets with manual overrides, so the organizer retains final control of prizes.
