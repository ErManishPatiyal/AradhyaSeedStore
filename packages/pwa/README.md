# @aradhya/pwa

> Next.js 15 web app + installable PWA for shop counter and desktop billing.

## Purpose

Web client for Aradhya Seed Store. Optimized for:

- Desktop/tablet billing at the shop counter
- Keyboard-heavy data entry (stock, invoices)
- Print-friendly invoice layout (Phase 2)
- Install as PWA on Android/desktop without Play Store

## Stack

| Tech | Role |
|------|------|
| Next.js 15 App Router | File-based routing (`src/app/**/page.tsx`) |
| Tailwind CSS v4 | Utility styling |
| `@serwist/next` | Service worker + offline caching |
| `@aradhya/shared` | Domain types, Supabase API, calculations |

## Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout + NavBar
│   ├── page.tsx         # Dashboard
│   ├── stock/page.tsx   # Stock register
│   ├── sales/page.tsx   # New sale / billing
│   └── customers/page.tsx
├── components/
│   └── NavBar.tsx
├── lib/
│   └── supabase.ts      # PWA Supabase client singleton
└── sw.ts                # Serwist service worker source

public/
├── manifest.json        # PWA install manifest
└── icons/               # 192px + 512px icons (add PNGs before production)
```

## Do / Don't

| Do | Don't |
|----|-------|
| Import domain logic from `@aradhya/shared` | Duplicate calc or API code here |
| Keep pages as thin UI over shared API | Import from `@aradhya/mobile` |
| Use `NEXT_PUBLIC_` env prefix for Supabase | Commit `.env.local` |

## Environment

Create `packages/pwa/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Commands

```bash
pnpm --filter @aradhya/pwa dev        # http://localhost:3000
pnpm --filter @aradhya/pwa build
pnpm --filter @aradhya/pwa typecheck
```

## PWA Install

1. Build and deploy to HTTPS (Vercel provides this automatically).
2. Open in Chrome → menu → **Install app** / **Add to Home Screen**.
3. Service worker is disabled in `development`; test PWA in production build.

## Deploy to Vercel (free)

1. Push repo to GitHub.
2. Import project in [Vercel](https://vercel.com).
3. Set **Root Directory** to `packages/pwa`.
4. Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Deploy → get `*.vercel.app` URL.

## Monorepo Note

`next.config.ts` includes `transpilePackages: ['@aradhya/shared']` so Next.js compiles the local workspace package — equivalent to Gradle `implementation(project(":shared"))`.

Build shared before production:

```bash
pnpm --filter @aradhya/shared build
pnpm --filter @aradhya/pwa build
```

Or from root: `pnpm build` (Turborepo runs `^build` dependency first).
