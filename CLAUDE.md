# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Repository layout

The git repository root is the `Cong-nhan-ho-so-/` subfolder (the parent folder `Cong nhan ho so` is not a repo). Run all commands from inside `Cong-nhan-ho-so-/`.

## Commands

```bash
npm install
npm run dev     # next dev, http://localhost:3000
npm run build   # next build
npm run start   # serve production build
npm run lint    # eslint (flat config in eslint.config.mjs)
```

There is no test runner configured. Env vars are not needed to run the app yet (see `.env.example`; Supabase/site URL are planned for later weeks).

## Project context

"DuHoc24" — a Vietnamese-language study-abroad application intake portal, used as a template for a 6-week course (see `README.md` for the weekly roadmap). The current state is **Week 1: static UI only**. There is no API, database, auth, or Gemini integration yet; planned additions are Gemini chatbot (W2), Supabase (W3), document extraction (W4), Make.com automation (W5), magic-link `/login` + RLS (W6). UI copy and identifiers' values are in Vietnamese; keep new user-facing text in Vietnamese.

## Architecture

- **Next.js 16 App Router + React 19 + TypeScript (strict) + Tailwind CSS v4.** Path alias `@/*` maps to the repo root. `AGENTS.md` warns this Next.js version has breaking changes versus older versions — consult `node_modules/next/dist/docs/` (after `npm install`) before using unfamiliar APIs. Note `app/layout.tsx` uses the global `LayoutProps<"/">` helper type rather than a hand-written props type.
- **All data is mock and lives in one file: `lib/mock-data.ts`.** It exports both the types (`School`, `AdmissionRequest`, `StudentProfile`, `Conversation`, `DocStatus`, `RequestStatus`, `ServicePackage`, …) and the hard-coded arrays/objects (`schools`, `admissionRequests`, `studentProfiles`, `conversations`, `servicePackages`, `countries`, `currentStudent`). Pages import directly from it, so when real data replaces it, those imports (in `app/portal` and `app/admin/*`) and the shared types are the seam to change. Status enums use snake_case Vietnamese strings (e.g. `cho_duyet`, `can_nop_lai`) and are rendered through `components/status-badge.tsx`.
- **Routes** (`app/`): `/` landing (composes `components/landing/*`), `/portal` student portal (composes `components/portal/*`), `/admin/*` (`requests`, `schools`, `profiles`, `conversations`; `/admin` redirects to `/admin/requests`). `app/admin/layout.tsx` wraps all admin pages in the sidebar (`components/admin/sidebar.tsx`, with a mobile nav variant). `/login` intentionally does not exist yet.
- **Server vs client components:** pages are server components. Only interactive pieces carry `"use client"`: `site-header`, `admin/sidebar`, `landing/quote-form`, `landing/chat-widget`, and the Base UI-backed `ui/*` primitives (`label`, `radio-group`, `select`, `table`). `landing/chat-widget` posts the conversation to `app/api/chat/route.ts`, which calls Gemini (`@google/genai`, model from `lib/chat.ts`, overridable with `GEMINI_MODEL`, key in `GEMINI_API_KEY`). The bot must answer only from `lib/knowledge/au-admissions.ts` (Australian admissions/visa summary) — add facts there, not in the prompt in `lib/chat.ts`.
- **UI kit:** shadcn/ui with style `base-nova` built on **Base UI** (`@base-ui/react`), not Radix — component APIs differ from typical shadcn examples. Config in `components.json` (icons: `lucide-react`; extra registry `@tailark-oss`). Primitives are in `components/ui/`; use `cn()` from `lib/utils.ts` for class merging. The landing blocks derive from `@tailark-oss/dusk-landing-2`, converted to a light theme. Animations use `motion` and `tw-animate-css`.
- **Styling:** Tailwind v4 via `@tailwindcss/postcss`, theme tokens/CSS variables in `app/globals.css` (no `tailwind.config`). Font is Be Vietnam Pro (`--font-sans`) with the `vietnamese` subset.

## Quy tắc Git

- Luôn hỏi xác nhận trước khi push lên Github

- Không bao giờ commit file .env hoặc bất kỳ file chứa API key
