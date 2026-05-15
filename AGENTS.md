<!-- BEGIN:brand-refresh -->

# Brand refresh — START HERE for any visual work

WS Energy went through a brand refresh in May 2026. The design system is **forest evergreen canvas + electric gold accent + warm-bone cards**, not the original Projoy-blue light theme. If you are about to touch any UI, marketing page, or component:

1. **Read `BRIEF.md` §7 (Design System) and §8.1 (Buttons)** for tokens, motion, and component rules
2. **Reuse the primitives** in `components/ui/`:
   - `<Button variant="primary|secondary|tertiary|outline-primary|on-card">` — pill-shaped, gold on forest
   - `<MonoLabel tone="mist|forest|gold">` — editorial `_OUR SOLUTIONS` eyebrow
   - `<ScrollReveal delay={n}>` — 24px fade-up on viewport entry
   - `<StatBlock>` — big-number authority tile
   - `<Card surface="bone|forest|forest-deep">` — hover-lift card
3. **Match the visual language** of these reference pages:
   - `app/[locale]/(marketing)/page.tsx` — homepage section rhythm
   - `components/marketing/ProductDetail.tsx` — long-scroll detail page
   - `components/marketing/Hero.tsx` — cinematic centered hero
   - `components/marketing/SolutionsTabs.tsx` — interactive tabs
4. **Section rhythm**: alternate `bg-forest-900` and `bg-forest-950` between sections; place warm-bone cards on top of either; mono eyebrow + huge sans headline + body + content
5. **Do not** reach back to `bg-graphite-*`, `text-brand-*`, or other legacy tokens for new marketing surfaces. Those linger only on pages not yet migrated.

**Do not change Sanity schemas or queries when redesigning** — only the visual layout. Sanity is the data source of truth; the redesign is purely presentational.

<!-- END:brand-refresh -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:roadmap -->

# Planned features beyond the brand refresh

See `ROADMAP.md` for in-progress and upcoming features (Training Calendar, Certified Installer Directory). Each feature has a step plan with a verification gate per step — check the roadmap before starting work on either.

<!-- END:roadmap -->
