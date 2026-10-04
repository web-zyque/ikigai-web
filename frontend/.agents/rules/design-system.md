# Ikigai Design System — Style Guide & Rules

This document defines the canonical design language for all pages in the Ikigai web app.
**Every new page and component MUST follow these rules without exception.**

---

## 1. Color Palette

| Token | Value | Usage |
|---|---|---|
| `--ik-bg` | `#000000` | Primary background |
| `--ik-surface` | `#121212` | Card / panel background |
| `--ik-surface-2` | `#0a0a0a` | Deeper surface (image areas) |
| `--ik-border` | `rgba(255,255,255,0.08)` | Subtle borders |
| `--ik-accent` | `#640C0C` | Primary accent (CTA buttons, price, active states) |
| `--ik-accent-hover` | `#7a1010` | Hover state of accent |
| `--ik-text-primary` | `#ffffff` | Headings, prominent text |
| `--ik-text-secondary` | `rgba(255,255,255,0.70)` | Body copy, descriptions |
| `--ik-text-muted` | `rgba(255,255,255,0.40)` | Placeholder, disabled text |
| `--ik-overlay-light` | `rgba(255,255,255,0.10)` | Ghost buttons, hover overlays |

**Rule:** Never use plain colors like pure `red`, `blue`, `green`. Always pull from this palette.

---

## 2. Typography

| Role | Class | Size | Weight |
|---|---|---|---|
| H1 Page title | `text-5xl sm:text-6xl` | 48–60px | `font-bold` (700) |
| H2 Section title | `text-3xl sm:text-4xl` | 30–36px | `font-bold` (700) |
| H3 Card title | `text-base` / `text-[13px]` | 13–16px | `font-medium` (500) |
| Body | `text-sm` | 14px | `font-normal` (400) |
| Caption / label | `text-xs` | 12px | `font-normal` |
| Price | `text-lg` | 18px | `font-bold` |

**Font stack:** `Inter` (from `next/font/google`) for product areas; `Geist Sans` (global via `--font-geist-sans`) for UI chrome.
**Tracking:** Use `tracking-tight` on all headings.
**Line height:** Use `leading-relaxed` for body copy.

---

## 3. Spacing & Layout

- **Max content width:** `max-w-7xl` (1280px) for most sections; `max-w-[1400px]` for product carousels.
- **Horizontal padding:** `px-6 lg:px-12` on all sections.
- **Section vertical padding:** `py-12` minimum; `py-20` for major sections.
- **Grid gap:** `gap-4` (tight), `gap-6` (default), `gap-8 lg:gap-12` (loose).
- **Border radius:**
  - Cards: `rounded-[20px]`
  - Buttons (pill): `rounded-full`
  - Small elements: `rounded-xl`

---

## 4. Card Design

```
bg-[#121212]  border border-white/5  rounded-[20px]  overflow-hidden
```

- **Image area:** `bg-[#0a0a0a]`, use `object-contain` with `mix-blend-screen` for product images on dark bg.
- **Info area:** `p-4`, flex column with `grow`.
- **Title:** `text-[13px] font-medium text-white line-clamp-2`.
- **Price:** `text-lg font-bold text-[#640C0C]`.
- **CTA row:** Two buttons — primary pill `bg-[#640C0C] rounded-full` (80%) + icon ghost `bg-white/10 rounded-full` (20%).

---

## 5. Buttons

| Variant | Classes |
|---|---|
| Primary | `rounded-full bg-[#640C0C] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity` |
| Ghost | `rounded-full border border-white/25 px-5 py-2 text-sm text-white hover:bg-white/10 transition-colors` |
| Icon ghost | `grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#640C0C] transition-colors` |
| Text link | `text-sm font-semibold text-[#640C0C] hover:opacity-80 transition-opacity` |

---

## 6. Navigation / Header

- Background: `bg-black`.
- Logo: image + bold text, `text-xl font-bold`.
- Nav links: `text-xs text-white/80 hover:text-white transition-colors`.
- Always sticky/fixed at top with `z-50`.
- Shared via `<Navbar />` component — **never duplicate the header across pages**.

---

## 7. Filter Sidebar (Products Page)

- Background: same as page `bg-black`.
- Width: `w-56 shrink-0` on desktop; hidden/drawer on mobile.
- Category label style: `text-[13px] text-white/60 hover:text-white transition-colors cursor-pointer`.
- Active category: `text-white font-semibold` with left accent bar `border-l-2 border-[#640C0C] pl-2`.
- Section headers (e.g. "Filter", group names): `text-xs uppercase tracking-widest text-white/40 mb-2`.

---

## 8. Interaction & Animation

- **Hover translate:** `hover:-translate-y-1 transition-transform duration-300` on cards.
- **Image scale:** `group-hover:scale-110 transition-transform duration-500`.
- **Opacity fades:** `transition-opacity duration-300`.
- **Backdrop blur overlays:** `backdrop-blur-md`.
- Keep animations subtle — avoid anything flashy or distracting.

---

## 9. Theming Rules

- **Always dark theme.** There is no light mode for the store.
- **Never use white backgrounds** on store pages.
- **Gradient text:** `bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent` — use sparingly on H1 only.

---

## 10. File & Component Conventions

- All store components live in `components/store/`.
- All store pages live in `app/(store)/`.
- Shared layout (Navbar, Footer) should be in the `(store)` layout file, not duplicated.
- Use `Inter` from `next/font/google` inside product-heavy components.
- Never hardcode pixel colors outside of this palette.
- Use Tailwind arbitrary values `[]` only for values in this design system.
