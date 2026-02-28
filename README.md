# Idea Board

A real-time collaborative idea board where users post ideas as draggable post-it notes on an infinite canvas. Built as a three-phase demo project.

**Live**: [simple-idea-board.vercel.app](https://simple-idea-board.vercel.app)

## Features

- **Infinite canvas** — pan, zoom, and arrange ideas freely with tldraw
- **Draggable post-it notes** — drag any note anywhere; positions sync instantly to all users
- **Real-time collaboration** — ideas, reactions, and positions update live across all sessions
- **Emoji reactions** — react to ideas with 8 emojis; click without triggering drag
- **Magic-link auth** — sign in with email, no password needed
- **Dark mode** — full dark mode including the canvas
- **Persistent layout** — note positions are stored in InstantDB and survive page refresh

## Stack

| | |
|---|---|
| Framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Canvas | tldraw v3.9.0 |
| Database / Auth / Sync | InstantDB |
| Deployment | Vercel |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll need an InstantDB app ID. Create a free app at [instantdb.com](https://instantdb.com), then update the ID in `app/db.ts`.

After updating `instant.schema.ts`, push schema changes with:

```bash
npx instant-cli@latest push schema --app YOUR_APP_ID
```

## Project Structure

```
app/
  db.ts                        — InstantDB singleton
  types.ts                     — shared types
  page.tsx                     — root page (auth gate + canvas)
  hooks/useIdeaBoard.ts        — data fetching and mutations
  components/
    AuthModal.tsx              — magic-link auth flow
    ThemeToggle.tsx            — dark/light toggle
    canvas/
      CanvasBoard.tsx          — tldraw canvas with InstantDB sync
      IdeaCardShapeUtil.tsx    — custom post-it note shape
      IdeasContext.ts          — React context for live reactions
instant.schema.ts              — InstantDB schema
spec-1.md / spec-2.md / spec-3.md  — per-phase build specs
```

## Build Phases

The app was built in three incremental phases, each documented in its own spec file:

- **Phase 1** (`spec-1.md`) — localStorage, no backend
- **Phase 2** (`spec-2.md`) — real-time sync via InstantDB, magic-link auth
- **Phase 3** (`spec-3.md`) — infinite canvas with tldraw, draggable notes
