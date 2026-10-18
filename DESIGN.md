# 연세 포커스 — Design System (DESIGN.md)

Single source of truth for every visual value in `index.html`. Dark, premium, minimal — a late-night study app for a Korean high-school student. Brand: Yonsei Royal Blue `#003289`.

## 1. Color tokens (CSS custom properties)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#070D1B` | Page background (matches `manifest.json` `background_color`) |
| `--surface` | `#0D1730` | Nested surfaces (summary chips) |
| `--card` | `#0F1B36` | Cards, task rows, list rows |
| `--card-2` | `#152347` | Inputs, stepper shells, secondary buttons |
| `--line` | `rgba(148,166,210,.14)` | Card / control borders |
| `--line-soft` | `rgba(148,166,210,.08)` | Hairlines, dividers |
| `--text` | `#EDF2FC` | Primary text |
| `--dim` | `#93A1C4` | Secondary text, labels |
| `--faint` | `#5E6C92` | Tertiary text, inactive icons |
| `--royal` | `#4D8DFF` | Accent (brightened royal for dark bg), active tab, links |
| `--royal-strong` | `#2F6BFF` | Primary button gradient start, bars |
| `--royal-soft` | `rgba(77,141,255,.16)` | Active chip fill, soft accent wash |
| `--brand` | `#003289` | Yonsei Royal Blue — manifest `theme_color`, icon, brand mark |
| `--gold` | `#F0B450` | Streak / 오답 정리 / today's bar highlight |
| `--green` | `#3DD68C` | Task done check |
| `--red` | `#FF6B6B` | Destructive actions |
| D-day card bg | `linear-gradient(150deg,#0C2B66,#081B45)` + royal radial glow | Hero card only |

Subject colors (charts, chips, timeline): 국어 `#4D8DFF` · 수학 `#3DD68C` · 영어 `#F0B450` · 사문 `#B78BFF` · 세계사 `#FF7A9E` · 기타 `#8FA0C9`.

## 2. Typography

- Stack: `-apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif` (no external fonts).
- Scale: D-day number `clamp(76px,21vw,104px)/800` · timer `clamp(88px,26vw,128px)/200` · h1 `22/800` · h2 `17/800` · body `15/500` · small `13` · caption `12` · micro `10.5–11`.
- All numeric readouts (countdowns, counts, charts) use `font-variant-numeric: tabular-nums`.
- Inputs use 16px to prevent iOS focus zoom.

## 3. Spacing, radius, elevation

- 4px grid; card padding 14–16px; page gutter 16px; section gap 10–12px.
- Radius: cards/hero `20px`, standard card `16px`, controls `12px`, pills `999px`.
- Elevation: primary button `0 6px 18px rgba(47,107,255,.35)`; toast `0 10px 30px rgba(0,0,0,.45)`; flat surfaces elsewhere (dark theme — borders over shadows).

## 4. Layout & motion

- Mobile-first column, `max-width: 520px` centered. Fixed bottom tab bar (4 tabs) with `env(safe-area-inset-bottom)`, blur backdrop; top padding honors notch (`env(safe-area-inset-top)`).
- Motion: view enter `fadeUp .28s`, bottom sheet `sheetUp .3s cubic-bezier(.2,.9,.3,1)`, button press `scale(.97)`. GPU-only properties. `prefers-reduced-motion` disables all.
- Tap targets ≥ 36–46px; icon buttons 36px+.

## 5. Primitives & states

| Primitive | States |
|---|---|
| `.btn` primary / ghost / danger, `.btn-s`, `.btn-xl` | default, `:active` scale, focus ring (royal) |
| `.task-check` round switch | todo (outline) → done (green + check) |
| `.stepper` − n + | disabled − at 0 |
| `.review-toggle` pill | off (dim) → on (gold wash + glow dot) |
| `.chip` / `.pick` | off (dim) → on (subject-colored border + wash) |
| `.bar-chart` | value labels, gold fill for today |
| Modal = bottom sheet (`#modalRoot`) | backdrop dismissable unless required (score input) |
| Toast = top pill (`#toastRoot`) | auto-dismiss 2.4s |

## 6. Icon mark

Rounded square (radius 22.5%) royal-blue vertical gradient `#0A3FA8→#002A72` (midpoint ≈ brand `#003289`), white bold Y-monogram with round caps — three capsule strokes in 512-space: arms `(150,140)→(256,268)`, `(362,140)→(256,268)`, stem `(256,268)→(256,388)`, stroke 66. Mark sits fully inside the maskable safe zone (center circle r=40%). All UI icons are inline stroke SVGs (no emoji, no icon fonts).

## 7. Constraints

- Korean UI copy throughout; natural, concise (해요체).
- XSS-safe: DOM built with `createElement`/`textContent` only.
- No external requests at runtime; no `alert/confirm/prompt`; relative paths only (GitHub Pages subpath).
