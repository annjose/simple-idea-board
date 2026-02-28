# Phase 3 — Idea Board (Canvas)
Upgrade Phase 2 to a full-screen infinite canvas where ideas are draggable post-it notes. Positions are stored in InstantDB and sync in real time across all users. Auth, reactions, and dark mode are unchanged.

INSTALL
- Install tldraw v3.9.0: `npm install tldraw@3.9.0`
- tldraw v3.x requires no license (not even Hobby). It shows a "Made with tldraw" watermark — that's fine.
- Push updated schema after adding x/y fields: `npx instant-cli@latest push schema`

SCHEMA
- Add `x: i.number()` and `y: i.number()` to the ideas entity in instant.schema.ts
- These store the canvas position of each note and sync across all users

CANVAS
- Replace the grid layout with a full-screen `<Tldraw>` canvas (load client-side only via Next.js `dynamic()` with `ssr: false` — tldraw uses browser APIs)
- Each idea is a custom tldraw shape (`ideaCard`) that renders as a post-it note: pastel background, content text, author name, relative timestamp, emoji reactions
- Create three new files: `app/components/canvas/IdeaCardShapeUtil.tsx`, `app/components/canvas/CanvasBoard.tsx`, `app/components/canvas/IdeasContext.ts`
- Hide all tldraw drawing tools — this is a post-it board not a drawing app: set `Toolbar`, `MainMenu`, `PageMenu`, `ActionsMenu`, and `StylePanel` to `null` in the tldraw `components` prop
- Dark mode: do NOT use `inferDarkMode` on `<Tldraw>` — it follows the OS system preference and ignores the app's toggle. Instead, pass `isDark` as a prop to the canvas and call `editor.user.updateUserPreferences({ colorScheme: isDark ? 'dark' : 'light' })` in a `useEffect` watching `isDark`.
- The header stays as a fixed overlay (z-50) above the canvas; the canvas sits below it

SYNC
- InstantDB → tldraw: inside a `useEffect` watching the ideas array, call `editor.store.mergeRemoteChanges()` to create, update, or delete shapes. Use `createShapeId(idea.id)` for deterministic, stable shape IDs across all clients.
- tldraw → InstantDB: in the `onMount` callback, set up `editor.store.listen({ source: 'user', scope: 'document' })` to detect when a user drags a shape and call `updateIdeaPosition(ideaId, x, y)`
- Anti-loop: `mergeRemoteChanges()` writes are invisible to `source: 'user'` listeners — this prevents infinite update cycles
- Reactions flow through a React context (`IdeasContext`) into the shape components — do NOT store them in tldraw shape props, which would pollute the undo history

DRAG
- For a card to be draggable, tldraw must receive the `pointerdown` event from the card's surface
- Do NOT add `onPointerDown={e => e.stopPropagation()}` to the card's content area — this blocks tldraw's drag system and makes cards immovable
- DO add `onPointerDown={e => e.stopPropagation()}` (and `onTouchStart`) to the emoji reaction row only, so clicking reactions doesn't accidentally trigger a drag

IMPLEMENTATION NOTES
- `editorReady` state: set a boolean in the `onMount` callback and add it as a dependency of the sync `useEffect`. Without this, the effect fires before the editor is mounted and no shapes appear on initial load or page refresh.
- FAB button: place the "+" button at `bottom: 80` (not 24) to avoid it being covered by the tldraw/InstantDB devtools bar at the bottom of the screen
- Tailwind classes are stripped inside tldraw shape components — use inline hex color values instead of Tailwind class names for the card background colors
- Default positions: for ideas without stored x/y, auto-place in a grid (`(i % 5) * 280 + 40`, `Math.floor(i / 5) * 320 + 40`)
- New idea position: use `editor.getViewportPageBounds().center` plus a small random offset so new notes appear near the center of whatever the user is looking at

TLDRAW DOCS
Before writing any canvas code, fetch and read:
- https://tldraw.dev/llms.txt
