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

There is no test runner configured. After `npm install`, create `.env` (gitignored) with the server-side variables below; the chatbot and `/admin/conversations` fail without them. Restart `next dev` after changing `.env`.

- `GEMINI_API_KEY` — Gemini API key (chat + lead extraction)
- `SUPABASE_URL`, `SUPABASE_SECRET_KEY` — server-only Supabase access (never `NEXT_PUBLIC_*`)
- optional: `GEMINI_MODEL` (chat model, default `gemini-3.5-flash`), `GEMINI_LEAD_MODEL` (default `gemini-3.5-flash-lite`)

`.env.example` is tracked by git: keep real values out of it.

## Project context

"DuHoc24" — a Vietnamese-language study-abroad application intake portal, used as a template for a 6-week course (see `README.md` for the weekly roadmap). The README roadmap is only partly followed: the landing page, `/portal`, and most `/admin/*` pages are still static mock UI, but the **chatbot is real** (Gemini, W2) and conversations/leads are stored in a **real Supabase database** and shown in `/admin/conversations` (W3 partially). Not built yet: quote form backend, document extraction (W4), Make.com automation (W5), `/login` and auth (W6). **`/admin/*` currently has no authentication** — anyone who can reach it can read customer conversations/leads and delete or re-extract them, so do not deploy publicly before adding auth. UI copy and identifiers' values are in Vietnamese; keep new user-facing text in Vietnamese.

## Architecture

- **Next.js 16 App Router + React 19 + TypeScript (strict) + Tailwind CSS v4.** Path alias `@/*` maps to the repo root. `AGENTS.md` warns this Next.js version has breaking changes versus older versions — consult `node_modules/next/dist/docs/` (after `npm install`) before using unfamiliar APIs. Note `app/layout.tsx` uses the global `LayoutProps<"/">` helper type rather than a hand-written props type.
- **Mock data (everything except chat conversations, leads, reference schools and student documents) lives in one file: `lib/mock-data.ts`.** It exports both the types (`School`, `AdmissionRequest`, `StudentProfile`, `DocStatus`, `RequestStatus`, `ServicePackage`, …) and the hard-coded arrays/objects (`schools`, `admissionRequests`, `studentProfiles`, `servicePackages`, `countries`). Pages import directly from it, so when real data replaces it, those imports (in `app/portal` and `app/admin/*`) and the shared types are the seam to change. Status enums use snake_case Vietnamese strings (e.g. `cho_duyet`, `can_nop_lai`) and are rendered through `components/status-badge.tsx`.
- **Routes** (`app/`): `/` landing (composes `components/landing/*`), `/portal` student portal (composes `components/portal/*`), `/admin/*` (`requests`, `schools`, `profiles`, `conversations`; `/admin` redirects to `/admin/requests`). `app/admin/layout.tsx` wraps all admin pages in the sidebar (`components/admin/sidebar.tsx`, with a mobile nav variant). `/login` intentionally does not exist yet.
- **Server vs client components:** pages are server components. Only interactive pieces carry `"use client"`: `site-header`, `admin/sidebar`, `landing/quote-form`, `landing/chat-widget`, and the Base UI-backed `ui/*` primitives (`label`, `radio-group`, `select`, `table`). `landing/chat-widget` posts the conversation to `app/api/chat/route.ts`, which calls Gemini (`@google/genai`, model from `lib/chat.ts`, overridable with `GEMINI_MODEL`, key in `GEMINI_API_KEY`). Conversations persist in Supabase (`conversations`, `messages`; RLS on, no policies, anon/authenticated revoked): only server code in `lib/chat-store.ts` / `lib/supabase-server.ts` touches them with `SUPABASE_URL` + `SUPABASE_SECRET_KEY`; the browser only holds an httpOnly `chat_cid` cookie (conversation UUID) and loads history via `GET /api/chat`. Leads (table `leads`, one row per conversation, same lockdown) are extracted on demand from the admin conversation page by `gemini-3.5-flash-lite` (`lib/lead-extraction.ts`, structured JSON output; email/phone are dropped unless they literally appear in the customer's own messages) and stored via `lib/lead-store.ts`. Scholarships (table `scholarships`: name, school_id → `schools`, min_gpa and/or min_ielts, benefit_type `percent` + benefit_percent or `full`; GPA on the same 10-scale as `schools`) are public-read/server-write like `schools`. Scholarship suggestions use real Gemini function calling (`lib/scholarship-advisor.ts`, model `gemini-3.5-flash`, overridable with `GEMINI_ADVISOR_MODEL`): the model gets only the student's GPA/IELTS numbers and the names of schools already passed (computed by plain code, no personal identifiers), and itself decides which schools to look up through the single tool `lookup_scholarships_by_school` (`lib/scholarship-store.ts`); eligibility is judged by the model from the returned conditions, with no hardcoded scholarship rules. Triggered on demand by `POST /api/portal/scholarships` from the `/portal` button, only for complete and valid profiles with at least one passed school; results are not stored. Reference schools (table `schools`: name, country, min_gpa, min_ielts) are **public data**: RLS allows `select` for anon/authenticated and no write policy, so only the server (`lib/school-store.ts`, used by `/admin/schools`) writes them; the `School` type still lives in `lib/mock-data.ts`. Student documents: `/portal` uploads go to `POST /api/portal/documents` (multipart), which checks the real file type by magic bytes (transcript = PDF only, IELTS/ID = JPG/PNG only, max 8 MB), reads the file with `gemini-3.1-flash-lite` (`lib/document-extraction.ts`, structured JSON, overridable with `GEMINI_DOC_MODEL`; every field is re-validated and a wrong document type is rejected), and stores only the extracted fields (never the original file) in `student_documents` (jsonb, one row per profile and type) via `lib/student-store.ts`. The visitor is identified by an httpOnly `profile_id` cookie (no login yet) and the tables are locked down like the chat tables (RLS on, no policies, anon/authenticated revoked) because they include ID numbers. `/admin/profiles` is still mock and does not read them yet. School matching (`lib/school-matching.ts`, pure functions, no AI at comparison time) first runs `checkProfile` (all 3 documents submitted, every extracted field readable, GPA scale 10 or 100) and only shows verdicts when it passes; otherwise `/portal` and `/schools` list what is still missing. It compares the student's overall GPA and IELTS overall with `schools`, shown on `/portal` and as a "Kết quả của bạn" column on `/schools`: GPA is only compared when the transcript scale is 10 or 100 (other scales such as 4.0 are reported as not convertible instead of guessed), a failed criterion makes the school "Chưa đạt" even if the other is missing, otherwise missing data gives "Chưa đủ thông tin". Never expose the secret key via `NEXT_PUBLIC_*` or query these tables from client code. The system prompt in `lib/chat.ts` is a lead-generation consultant persona (guided flow: country → level/major → services → name/email/phone → booking); it is no longer restricted to Australia and no longer injects `lib/knowledge/au-admissions.ts` (kept in the repo but currently unused).
- **UI kit:** shadcn/ui with style `base-nova` built on **Base UI** (`@base-ui/react`), not Radix — component APIs differ from typical shadcn examples. Config in `components.json` (icons: `lucide-react`; extra registry `@tailark-oss`). Primitives are in `components/ui/`; use `cn()` from `lib/utils.ts` for class merging. The landing blocks derive from `@tailark-oss/dusk-landing-2`, converted to a light theme. Animations use `motion` and `tw-animate-css`.
- **Styling:** Tailwind v4 via `@tailwindcss/postcss`, theme tokens/CSS variables in `app/globals.css` (no `tailwind.config`). Font is Be Vietnam Pro (`--font-sans`) with the `vietnamese` subset.

## Quy tắc Git

- Luôn hỏi xác nhận trước khi push lên Github

- Không bao giờ commit file .env hoặc bất kỳ file chứa API key
