# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server on http://localhost:3000 (host: 0.0.0.0)
npm run build    # production build
npm run lint     # TypeScript type-check only (tsc --noEmit), no test suite
```

Deploy: `git push` to `main` → Vercel auto-deploys at https://screen-rotator-react.vercel.app/

## Architecture

A fullscreen React dashboard rotator displayed on pharmacy network TVs. It cycles through data screens separated by video spots, refreshing data from Google Sheets every 5 minutes.

### Rotation loop (`App.tsx`)

`PLAYLIST` interleaves every screen with a video slot:  
`[screen0, video, screen1, video, ..., screenN, video]` → repeats.

Timing is driven by `ROTATOR_CONFIG` in `constants.ts`:
- `dashboardDuration` — seconds per screen (currently 180s)
- `videoDuration` × `videoLoopsBeforeDashboard` — total video time between screens

### Data flow (`services/csvService.ts`)

Data is fetched directly from a Google Sheets spreadsheet (`SHEET_ID`) via CSV export URLs. Six sheets are fetched in parallel:

| Sheet key | Content |
|---|---|
| `base_conocimiento` | One row per branch: daily totals, semana anterior, meta diaria, context fields |
| `horas_hoy` | Intraday rows: `Nombre_Sucu`, `Franja_Horaria` (0–23), `Neto`, `Tickets`, `Unidades` |
| `horas_semana_anterior` | Same structure, same week last week |
| `clientes` | Alta clientes total |
| `nominados` | % nominados KPI |
| `meta_diaria` | `FECHA`, `FARMACIA`, `Meta 1 $$` — filtered to today's date |

`ultimaFranjaHora` comes from `Ctx_Ultima_Franja_Hora` in `base_conocimiento` row 0. It represents the current active hour (inclusive). Hourly charts use `startIndex = 7` and display up to the last hour with data ≤ `ultimaFranjaHora`.

`n()` is the universal number parser — handles AR/EU formats (`1.234,56`), plain dots-as-thousands, etc. Use it for all CSV numeric fields.

Data is cached in `localStorage` (key `farmaplus_v5_cache`) and restored on load to avoid blank screens on refresh.

### Screens

Each screen is a React component in `components/screens/` that receives `{ data: DashboardData }` and renders `w-screen h-screen`. Current rotation order in `App.tsx`:

1. `ScreenRanking` — branch ranking by today's sales
2. `ScreenBeneficios` — alta clientes + % nominados KPIs
3. `ScreenAcumMes` — monthly accumulated vs meta (metaDiaria × diasMes)
4. `ScreenFacturacionHora` — hourly sales line chart (hoy vs semana anterior), starts at 7hs
5. `ScreenMetaDiaria` — daily goal progress per branch
6. `ScreenTicketPromedio` — average ticket per branch
7. `ScreenAlertas` — inactivity alerts per branch

Screens that rank branches use `AutoScrollList` (auto-scrolling infinite loop via framer-motion, activates when items ≥ `minToScroll`). Progress bars use `AnimatedBar` (CSS transition, staggered by `delay` ms).

### Shared utilities

- `formatMillions(value)` — `$ 1.234.567` format (es-AR, no decimals)
- `formatPct(value, decimals?)` — `57,8` format (es-AR locale)
- Row color convention: `>= 100%` → `#01B693` (green), `>= 80%` → `#f59e0b` (amber), `< 80%` → `#C8102E` (red)

### Data update pipeline

`run_update.bat` (runs on a schedule on the local machine) calls `generate_data.py` to pull from Google Drive, then commits and pushes the CSV files in `public/data/`. The React app fetches directly from Google Sheets URLs — the bat script is a separate pipeline for a different data path.

### Styling

Tailwind CSS v4 (via `@tailwindcss/vite` plugin). Dark background is `#0b0e14`. Brand blue is `#325795`. No `tailwind.config.js` — config is inline via the Vite plugin.
