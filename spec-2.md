# Phase 2 — Idea Board (InstantDB)
Upgrade Phase 1 to a real shared board. Same UI, same interactions — but now ideas and reactions are synced in real time across all participants via InstantDB. Auth via magic link email. Replace all localStorage logic with InstantDB.

AUTH
- Use InstantDB magic link auth (sendMagicCode / verifyMagicCode)
- On first visit show a modal: enter email → receive code → enter code → done
- After auth, ask for a display name if not already set, store in InstantDB user profile
- Display name modal only appears if not already stored in InstantDB profile

DATA
- Migrate ideas and reactions to InstantDB
- Use db.useQuery to subscribe to ideas and reactions in real time
- Schema: ideas (id, userId, displayName, content, createdAt), reactions (id, ideaId, userId, emoji)
- Unique constraint: before adding a reaction, check if one already exists for this userId+ideaId+emoji combination and skip if so

REALTIME
- New ideas and reactions appear instantly for all connected users
- No page refresh needed

Keep all existing UI, layout, dark mode, and animation behavior identical.

INSTANT DB DOCS
Before writing any auth or data code, fetch and read these pages:
- https://www.instantdb.com/docs/auth
- https://www.instantdb.com/docs/modeling-data
- https://www.instantdb.com/docs/instaql
