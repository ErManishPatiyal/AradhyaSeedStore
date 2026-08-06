# @aradhya/mobile

> Expo React Native app for field use and Android-native UX.

## Purpose

Mobile client for Aradhya Seed Store. Mirrors PWA routes:

- Dashboard, Stock, Sales, Customers

Uses `@aradhya/shared` for all domain logic — screens are thin UI layers (same pattern as Android MVVM with a shared `:domain` module).

## Stack

| Tech | Role |
|------|------|
| Expo SDK 53 | Dev toolchain, OTA, EAS Build |
| Expo Router v5 | File-based navigation (`app/**/*.tsx`) |
| React Native 0.79 | Native Android UI |
| `@aradhya/shared` | Types, Supabase API, calculations |

## Structure

```
app/
├── _layout.tsx          # Root layout + AppHeader
├── index.tsx            # Dashboard
├── stock/index.tsx
├── sales/index.tsx
└── customers/index.tsx

src/
├── components/
│   └── AppHeader.tsx
└── lib/
    └── supabase.ts      # EXPO_PUBLIC_ client factory

metro.config.js          # Monorepo watchFolders + symlink resolution
```

## Do / Don't

| Do | Don't |
|----|-------|
| Import from `@aradhya/shared` | Import from `@aradhya/pwa` |
| Use `EXPO_PUBLIC_` env prefix | Commit `.env` with keys |
| Configure Metro for monorepo (already done) | Put business logic in screen files |

## Environment

Create `packages/mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Restart Expo after changing env vars.

## Commands

```bash
pnpm --filter @aradhya/mobile start          # Expo dev server
pnpm --filter @aradhya/mobile android        # Open on Android emulator/device
pnpm --filter @aradhya/mobile typecheck
```

## Metro Monorepo Config

`metro.config.js` sets:

- `watchFolders` → monorepo root (detects `@aradhya/shared` changes)
- `nodeModulesPaths` → local + root `node_modules`
- `unstable_enableSymlinks` → required for pnpm workspace links

This is the RN equivalent of Gradle including `:shared` as a composite build dependency.

## Shared Package Resolution

Expo Metro bundles `@aradhya/shared` from source via the workspace symlink. Ensure `@aradhya/shared` is listed in `package.json` dependencies.

If Metro fails to resolve the package, run from repo root:

```bash
pnpm install
pnpm --filter @aradhya/shared build
```

## EAS Build (free tier APK)

1. Install EAS CLI: `npm i -g eas-cli`
2. Run `eas login` and `eas build:configure` inside `packages/mobile`
3. `eas build -p android --profile preview` → download `.apk` for sideload

Play Store publish requires ₹1,750 one-time Google Play developer fee.

## Android Package

`com.aradhya.seedstore` (set in `app.json`)
