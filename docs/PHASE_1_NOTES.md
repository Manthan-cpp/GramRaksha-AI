# Phase 1 Notes — UI/UX Foundation

## What was built
- **Core Setup**: Next.js App Router configured with strict TypeScript, Tailwind CSS, and global CSS variables matching the "Indian field-notebook" design system.
- **Internationalization (i18n)**: Configured `next-intl` with English (`en`), Hindi (`hi`), and Bengali (`bn`). Set up `src/i18n/request.ts` and Next.js localization routing.
- **Typography**: Configured `next/font/google` for Fraunces (Display), Hanken Grotesk (Body), JetBrains Mono, Hind Siliguri (Bengali), and Noto Sans Devanagari (Hindi) in `src/app/[locale]/layout.tsx`.
- **UI Kit**: 
  - `<Button>` with primary, secondary, and quiet variants, plus size options.
  - `<Card>` component suite for layout structures.
  - `<EmptyState>` reusable pattern with running-stitch borders to handle cases with no data safely.
- **Landing Page**: Implemented the complete responsive landing page (`src/app/[locale]/page.tsx`) according to the design specs:
  - Hero section with clear calls to action.
  - Scroll story section outlining the problem.
  - "How it works" overview.
  - Explicit promises and "never do" list.
  - Framer Motion integrated for smooth entry transitions.
- **Data Contracts**: Defined exact Zod schemas for all shared domains (`Evidence`, `CropBrief`, `Bill`, `Case`, `Flag`) in `src/lib/schemas/index.ts`.

## Decisions I made
- Created the project inside a sub-folder and moved it into the working root since the folder name `GramRaksha AI` has uppercase letters and spaces that `create-next-app` rejects.
- Followed `next-intl` v3 structure which requires `getRequestConfig` and Next.js v15+ async `params` in layouts.
- Replaced `middleware.ts` with `proxy.ts` as per the Next.js Canary recommendations for the latest versions.
- Added strict type checking for all UI files and fixed peer dependency conflicts with `npm install --legacy-peer-deps`.

## Known Issues / TODO-VERIFY
- `next-intl` translations are minimal placeholders in `messages/*.json`. All specific screen translations need to be added as each page is built.
- The language toggle in the header currently acts as a placeholder text and needs to be hooked up to a router push.
