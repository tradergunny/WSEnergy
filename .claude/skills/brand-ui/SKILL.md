---
name: brand-ui
description: |
  Enforce the WS Energy May-2026 brand refresh on any UI work in this codebase.
  TRIGGER when about to: edit any `.tsx` under `components/` or `app/`, write Tailwind classes, build a marketing page, propose layout changes, or react to a design reference image. Reads BRIEF.md §7/§8 fresh, enumerates the live `components/ui/` inventory, blocks legacy tokens (`bg-graphite-*`, `text-brand-*`), gates new primitives behind a proposal step before they're built. Two modes: USE (default — reuse existing primitives) and EXTEND (deliberate — propose-then-build a new primitive).
  SKIP for: backend-only changes (routes, GROQ, server logic), config/env edits, Sanity schema edits, scripts under `scripts/` that don't render UI.
---

# Brand UI guardrails — WS Energy

You're about to touch UI in this codebase. The May-2026 brand refresh (forest-evergreen canvas + electric gold accent + warm-bone cards) is the **only** visual system in play. The pre-refresh Projoy-blue tokens linger on a handful of un-migrated pages — never propagate them to new work.

Run the pre-flight below before writing a single line of JSX or Tailwind.

---

## Mandatory pre-flight (every invocation)

Do all four. None are skippable.

1. **Read BRIEF.md §7 (Design System) and §8.1 (Buttons).** These are the source of truth for tokens, motion, rhythm, and CTA shape. They update over time — read them fresh, don't rely on memory.
2. **Enumerate live primitives.** Run `ls components/ui/` to see what exists right now. Read the relevant files (`Button.tsx`, `Card.tsx`, etc.) when you might use them — props evolve.
3. **Check AGENTS.md "Brand refresh" section** for any extra project-level rules.
4. **Decide which mode you're in** (see below).

If you skip steps 1 or 2 you will write off-brand code. Don't.

---

## The brand grammar — the only tokens allowed

These rules apply to every new component, modified component, and styling change. No exceptions per-page or per-feature.

### Allowed token set

| Purpose | Tokens |
|---|---|
| Section backgrounds (dark canvas) | `bg-forest-900`, `bg-forest-950` |
| Card surface on dark | `bg-bone-*` (warm card on either forest) |
| Accent (CTAs, links, eyebrows, highlights) | `text-gold-500`, `bg-gold-500`, `border-gold-500` |
| Text on dark surface | `text-mist-50` (primary), `text-mist-300/400` (body), `text-mist-500` (muted) |
| Text on bone surface | `text-forest-900` (primary), `text-forest-700/600` (muted) |
| Borders on dark | `border-mist-800` (subtle) |

### Forbidden tokens — never write these in new code

- `bg-graphite-*` — legacy Projoy-blue era
- `text-brand-*` — legacy
- Any hex colour (`#hexhex`), `rgb(...)`, `hsl(...)`, or Tailwind arbitrary colour (`bg-[#...]`)
- Any colour sampled from a reference image — references inform *shape and motion*, not *palette*

Before considering a UI change done, run:

```bash
rg -n "bg-graphite-|text-brand-|bg-\[#|text-\[#" <files-you-changed>
```

Any match is a regression. Fix before moving on.

### Section rhythm

Long-scroll pages alternate `bg-forest-900` and `bg-forest-950` between adjacent sections. Warm-bone cards (the `Card` primitive with `surface="bone"`) sit on top of either. Hover-lift is built into `Card` — don't reimplement.

### Motion

Wrap section content in `<ScrollReveal delay={n}>` for the 24px fade-up on viewport entry. Card hover-lift comes from `<Card>` itself — never write a custom hover transition that competes.

### Editorial typography rhythm

The section opener formula is **eyebrow → headline → body**:

```tsx
<MonoLabel tone="mist|forest|gold">_OUR SOLUTIONS</MonoLabel>
<h2 className="text-h2 text-mist-50 font-medium">Big sans headline</h2>
<p className="text-body-lg text-mist-300 mt-3">Body copy.</p>
```

Use this cadence for every new section. The eyebrow tone shifts with surface: `mist` on forest, `forest` on bone, `gold` for the highest-emphasis callouts.

### CTAs

Every button uses the `<Button>` primitive — pill-shaped, gold on forest. Never write a `<button className="rounded-full bg-gold-500 ...">` inline. If a variant you need doesn't exist (`primary`, `secondary`, `tertiary`, `outline-primary`, `on-card`), switch to **EXTEND mode** and propose adding it.

---

## Two modes

Decide at the start of every UI task. Most work is USE.

### USE mode (default)

You're implementing a feature using existing primitives.

**Procedure:**

1. Identify the JSX shapes the feature needs (button, card, eyebrow + heading, stat tile, scroll-reveal section, etc.).
2. Map each shape to a primitive from `ls components/ui/`. Read the primitive's `.tsx` file if you might use it — props evolve.
3. **Every shape maps cleanly?** → Proceed, write the feature using the primitives.
4. **One or more shapes have no clean match?** → Switch to **EXTEND mode** before writing anything new.

**Don't:**

- Don't recreate an existing primitive inline. If `<Button>` exists, never write `<button className="rounded-full bg-gold-500 ...">`.
- Don't treat `components/marketing/*` as primitives. Marketing components *compose* primitives — they're not primitives themselves. Drilling into a marketing component for "inspiration" is fine; copy-pasting its internals into a new component is a violation.
- Don't introduce a new colour, hover state, or motion that isn't already in the system.
- Don't override a primitive's styling with `className` to make it look different — if you need it to look different, you need a different primitive (EXTEND mode).

### EXTEND mode (deliberate, user-gated)

You're proposing a new primitive because nothing existing fits. This step is **always user-gated** — never silently create a new component, even if you're 99% sure it's wanted.

**Procedure:**

1. **Define the gap precisely.** State which behaviour or visual shape no existing primitive handles. Be specific: "No primitive supports horizontal snap-scroll with dot indicators."
2. **Propose to the user before building.** Reply with a structured proposal:

   > **Proposal: `<Carousel surface itemSurface>`**
   >
   > - **What:** horizontal snap-scrolling list of cards with progress dots.
   > - **Brand choices:** `surface="forest"` backdrop, `itemSurface="bone"` warm cards, gold dot indicators, `ScrollReveal` wrap on entry, native CSS scroll-snap for momentum.
   > - **Where it might get used elsewhere:** project case-study lists, awards strip, training session previews.
   >
   > Approve or change direction?

3. **Wait for explicit approval.** Don't write the file until the user confirms. They may redirect — "yes but no dots, use a gold progress bar instead" — incorporate, then re-confirm if the redirection is large.
4. **Create the file** under `components/ui/<NewPrimitive>.tsx` using only the allowed token set. Match the existing primitives' patterns: TypeScript prop types, consistent prop names (`surface`, `tone`, `variant`, `size`), default exports if the others use defaults.
5. **Update BRIEF.md §7** (or §8 for CTA-shape additions) with one paragraph documenting the new primitive — match the length and tone of existing entries. Name, when to reach for it, key props.
6. **Don't refactor old inline patterns to the new primitive in the same change.** Flag it as a follow-up.

**Don't:**

- Don't silently create the file. The proposal gate is what keeps `components/ui/` coherent over the long run.
- Don't sample colours from a reference image. Map the reference's *shape, motion, and rhythm* onto the existing token set.
- Don't skip the BRIEF.md update. Undocumented primitives become orphan components nobody else knows about, and the next agent recreates them.

---

## Reading a reference image

When the user shares a screenshot or design reference:

- **What to take from it:** layout shape, section rhythm, motion ideas, interaction patterns, content hierarchy.
- **What to ignore:** the reference's exact palette, typography, button shape — those come from BRIEF.md, not the reference.
- **Decide:** is the difference from existing primitives a *grammar* shift (palette, motion, rhythm — pushback, propose alternative within brand) or a *vocabulary* shift (new noun: carousel, tabs, modal — switch to EXTEND mode)?

The brand grammar stays fixed. The vocabulary grows as needed.

---

## Page-level patterns to mirror

When building a new marketing page or section, study these first — they're the canonical implementations of the brand grammar:

- `app/[locale]/(marketing)/page.tsx` — homepage section rhythm.
- `components/marketing/ProductDetail.tsx` — long-scroll detail page.
- `components/marketing/Hero.tsx` — cinematic centered hero.
- `components/marketing/SolutionsTabs.tsx` — interactive tabs (good reference for any tabbed UI before you reach for EXTEND mode).

Don't copy-paste their internals — read them to understand the cadence, then compose your own page using the same primitives.

---

## When in doubt

- Reach for an existing primitive with a small composition trick over introducing a new one.
- If a reference image's vibe diverges from the brand (lighter, more retail, more glossy), the *vibe* is wrong — push back. The brand is dark, editorial, engineering-led. References inform shape, not feel.
- If you can't tell which mode you're in, default to USE and ask the user.
- If you find yourself wanting to write `bg-[#...]` or pull a Tailwind colour outside the allowed list, stop. Either an existing token does the job, or you're solving the wrong problem.

---

## Quick checklist before you ship

- [ ] Read BRIEF.md §7 + §8.1 this session
- [ ] Ran `ls components/ui/` and reused existing primitives where possible
- [ ] All buttons are `<Button>`, all cards are `<Card>`, all eyebrows are `<MonoLabel>`
- [ ] No `bg-graphite-*` / `text-brand-*` / hex colours / arbitrary `bg-[#...]`
- [ ] Section content wrapped in `<ScrollReveal>`
- [ ] Section rhythm alternates forest-900 ↔ forest-950
- [ ] Bone cards on forest, not the other way around
- [ ] If a new primitive was added: BRIEF.md §7 has a new paragraph documenting it
