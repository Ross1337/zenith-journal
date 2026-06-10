# ZENITH — Design decisions

*See your edge clearly.*

## The concept: **Observatory**

A trading journal is an instrument you look **through**, not at. ZENITH's visual
identity is built around the idea of a night-sky observatory: a deep, quiet
dark field where the only luminous things are the data — and one warm gold
horizon line that anchors the brand.

This is deliberately **not** the blue-on-black fintech default, and not a copy
of any competitor. Reference quality bar: Linear, Vercel, Raycast, Resend.

## Tokens (packages/ui-tokens)

| Decision | Why |
| --- | --- |
| **Surfaces** `#0a0b10 → #1d2130` (void → overlay) | Blue-black, not gray-black: reads as depth, not mud. Four elevation steps only. |
| **Solar gold accent** `#f2b544` | Warmth against the cold field; used *sparingly* — primary actions, active nav, brand moments. Never for data. |
| **Ion violet** `#8b7cf6` | Secondary accent for "insight" moments (ideas, AI, callouts). |
| **P&L green/red** `#41e0a3` / `#f2555f` | Tuned for dark backgrounds (high-chroma but not neon). Colorblind-safe blue/orange variant behind `[data-pnl='colorblind']`. |
| **Type stack** Space Grotesk (display) / Inter (UI) / JetBrains Mono (numbers) | Every number in the product goes through `.z-numeric` — mono + tabular figures so columns of P&L always align. |
| **`z-horizon` divider** | The signature element: a 1px gradient line (transparent → gold → transparent). Used in the sidebar, modals, section titles. |
| **Light theme "Daylight"** | Warm paper tones (`#fafaf7`), gold darkened to `#b07c18` for AA contrast. Switchable dark/light/auto in settings. |

## Layout language

- **232px fixed sidebar**, brand on top, *Log trade* as the first action —
  the single most frequent interaction lives one click away, always.
- Content max-width 1240px, generous 16–20px paddings, `10px` radii.
- Cards: `bg-raised` + 1px `edge-subtle` border + faint inner top-light —
  surfaces feel machined, not floating.
- Density: trading data tables run at 13px with mono numerals; chrome stays
  out of the way (11px uppercase tracked labels).

## Interaction principles

1. **Numbers first, psychology second** — the trade modal shows live P&L/R as
   you type (same math as the server, via `@zenith/calc`).
2. **< 30s to log a trade** — essentials on top, everything else optional.
3. **Honesty UI** — mistakes are first-class chips ("be honest — this is the
   edge"), emotion is a 1–5 tilt→flow scale, never emoji.
4. **Nothing destructive in one click** — deletes confirm inline, imports
   preview before committing.

## Landing page

Same Observatory language in public: dawn-gradient hero over the void surface,
the product's own equity curve as the hero artifact, gold CTAs. Pricing is
flat and honest: Free / Pro $14.99/mo / Lifetime $199.
