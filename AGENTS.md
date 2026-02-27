# Idea Board — Agent Instructions

## What We're Building
A shared Idea Board where workshop participants can post ideas in real time and react to each other's ideas with emojis. Participants post ideas and react with emojis. The app is built live during a coding workshop to demonstrate agentic coding — so the code should be easy to read and follow along, not clever or over-engineered.

The app is used live during the workshop itself: the facilitator shares a URL, participants open it on their phones or laptops, and ideas + reactions appear in real time for everyone.

## Tech Stack
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS v4
- InstantDB for auth + real-time sync (Phase 2)

## Code Conventions
- Functional components only, no class components
- Co-locate component files with their logic — no barrel exports
- Use `const` arrow functions for components: `const MyComponent = () =>`
- No `any` types — use `unknown` and narrow properly
- Prefer explicit return types on all functions

## Styling
- Tailwind v4 only — no inline styles, no CSS modules
- Dark mode via `dark:` classes (class strategy, not media query)
- Mobile-first: design for small screens, enhance for large
- No external component libraries (shadcn, MUI, etc.) — build from scratch

## File Structure
- Components go in `src/components/`
- InstantDB client and schema in `src/lib/instant.ts`
- Types in `src/types/`
- Keep pages thin — logic lives in components or hooks

## What NOT to Do (Phase 1 and 2)
- Do not install unnecessary dependencies — keep the bundle small
- Do not add loading spinners everywhere — use optimistic UI instead
- Do not write comments explaining what the code does — write self-documenting code

## What NOT to Do (Phase 2 only)
- Do not use `useEffect` for data fetching — use InstantDB's `db.useQuery`
- Do not store auth state in local component state — use InstantDB session

## Phase Awareness
This project is built in two phases:
- Phase 1: localStorage only, no auth, no backend
- Phase 2: InstantDB magic link auth + real-time sync

When working on Phase 1, do not introduce any backend dependencies.
When upgrading to Phase 2, remove all localStorage logic entirely — do not leave it as a fallback.

## Reference Docs
See the relevant spec file for any reference documentation needed.
