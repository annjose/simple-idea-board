# Phase 1 — Idea Board (localStorage)
A single-page idea board where participants post ideas and react with emojis.
No backend yet — everything lives in localStorage. Goal is a working, beautiful app that demonstrates what an agent can build in one shot.

Build a collaborative Idea Board app using Next.js (App Router),
TypeScript, and Tailwind CSS v4.

AUTH
- No auth needed yet. On first visit, ask for just a display name in a modal.
- Store the name in localStorage. Use it to attribute ideas and reactions.
- Generate a unique userId (crypto.randomUUID) on first visit, store alongside display name in localStorage
- Use this userId to track which reactions belong to the current user so they survive page refresh

FEATURES
- Users can post ideas as cards (text + submit)
- Each idea shows author name and relative timestamp ("2 min ago")
- Emoji reactions on each card: at least 8 options (👍 💡 🔥 ❤️ 😂 🤔 👀 🚀)
- Multiple emojis can be selected per idea, each showing a count
- Users can toggle their own reactions on/off
- All ideas and reactions stored in localStorage

UI
- Whiteboard/workshop feel, card grid layout
- Idea card: text, author, timestamp, emoji reaction bar
- Add idea form prominent at the top
- Fully mobile responsive
- Dark mode via Tailwind dark class strategy
- Subtle animation on new card and reaction toggle