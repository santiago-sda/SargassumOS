# SargassumOS — CLAUDE.md

## Stack
- **Framework**: Next.js 15+ (App Router) + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (Postgres, Auth, Storage, Realtime)
- **Map**: Mapbox GL JS when `NEXT_PUBLIC_MAPBOX_TOKEN` is set; MapLibre GL JS otherwise
- **Deploy**: Vercel

## Project structure
```
src/
  app/           # App Router pages and API routes
  components/    # UI components — small and single-purpose
  hooks/         # Custom React hooks
  lib/
    supabase/    # client.ts (browser), server.ts (RSC/Route), types.ts
    satellite-stub.ts  # wire Copernicus AFAI here
  types/         # Shared TypeScript types (index.ts)
supabase/
  migrations/    # SQL migration files
scripts/
  seed-beaches.ts  # Overpass API → beaches table
```

## Data model
| Table    | Key columns |
|----------|-------------|
| beaches  | id, name, lat, lng, country, satellite_condition, current_condition (cached), last_updated |
| reports  | id, beach_id, condition, photo_url, note, created_at, user_id (nullable) |
| waitlist | id, email, created_at |

**Condition enum**: `clean \| light \| moderate \| heavy \| unknown`

`current_condition` is updated by a Postgres trigger (`trg_refresh_condition`) that calls
`derive_condition()` after every report INSERT. The function does a time-weighted vote over
the last 24h, falling back to `satellite_condition` (then `unknown`) when no reports exist.

## Required env vars
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server/scripts only (never expose to browser) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Optional; omit to fall back to MapLibre |

Secrets live only in `.env.local`. Never commit them.

## Rules
- Components must be small and single-purpose.
- No secrets in code or this file.
- Use plan mode before any multi-file change.
- Anonymous report submissions are allowed (user_id nullable).
- Photo uploads go directly to Supabase Storage bucket `report-photos`.

## Build order (phases)
1. Schema + client + seed ✅
2. Read-only map + markers
3. Beach detail panel
4. Report submission + photo upload
5. Condition aggregation (already in SQL)
6. Realtime updates + waitlist form
7. README + deploy steps
