# Session — Multi-Mode Design System

> Extends the existing dark-first, emerald-neon, glassmorphism identity defined in `index.css`.
> Companion tokens live in [`src/styles/tokens.css`](./src/styles/tokens.css).
> Palette + component boards live in [`docs/design/`](./docs/design/).

---

## 1. Overall Design Philosophy

Session is a **cockpit for writing, running, and reviewing code together**. The product persona is *Electric, Utilitarian, Ephemeral* (see `PRODUCT.md`). The design system is the enforcement mechanism for that persona.

**Principles**

1. **Frictionless surface.** A single-link session drops the user straight into an editor. The chrome must never out-shout the code.
2. **Liquid refraction, not heavy shadows.** Depth comes from inner light (1px inset borders, mode-tinted glows, glass blur) — never from grey drop shadows that flatten the canvas.
3. **Restrained emission.** Emerald is loud by nature. Glow is a reward for interaction (execution finished, remote user joined, timer at zero), not a decoration.
4. **Terminal integrity.** Code, console, and execution surfaces stay monospace, high-contrast, and typographically honest. No emoji in structural labels.
5. **One product, three moods.** Structure, spacing, radii, typography, and components are identical across Solo / Pair / Interview. Only the **accent, gradient, glow, and presence colors** change.

**Visual hierarchy (top → bottom priority)**

1. Code (editor, console) — highest contrast, monospace, no chrome
2. Actionable controls (Run, Invite, End) — mode-primary + glow
3. Presence signals (cursors, avatars, voice) — mode-accent
4. Structural surfaces (sidebar, panels, cards) — neutral glass
5. Meta (labels, timestamps, badges) — muted foreground

**Emotional goals per mode**

| Mode | Feeling | Anchor product references |
|---|---|---|
| Solo | Focus, flow, calm | Linear, Notion, VSCode |
| Pair | Energy, presence, creativity | Figma, Discord, Liveblocks |
| Interview | Precision, professionalism, weight | Stripe Dashboard, Vercel, GitHub Enterprise |

**Accessibility floor.** WCAG 2.2 AA for all text/surface pairs, `prefers-reduced-motion` respected, focus rings always visible, presence conveyed by icon + shape as well as color.

---

## 2. Theme Architecture

```
Primitives           emerald ramp · neutrals · radii · spacing · motion · blur · elevation
     ↓
Theme layer          .light  |  :root (dark)          — surfaces, foregrounds, borders
     ↓
Mode layer           [data-mode="solo|pair|interview"] — accent, gradient, glow, cursor, presence
     ↓
Semantic tokens      background, card, panel, glass, border, ring, editor, console, execution…
     ↓
Component tokens     button, input, tab, dialog, timer, chat, video…
     ↓
UI
```

**Application root**

```html
<html class="dark" data-mode="pair">
  <!-- .light for light theme; data-mode swaps accents only -->
</html>
```

**Why this shape scales.** Adding a fourth mode (e.g. `review`) is a single `[data-mode="review"] { … }` block overriding ~12 tokens. Themes and modes are orthogonal: 2 themes × N modes with no combinatorial redesign.

Import order in `index.css`:

```css
@import "tailwindcss";
@import "./styles/tokens.css";
```

---

## 3. Color Strategy

**Emerald is the brand.** `#17B85C` (== `hsl(135 80% 45%)`, unchanged from your `index.css` `--color-primary`) appears as the primary in every one of the 6 variants. A user glancing at the tab bar or a share preview must recognize Session before they parse the layout.

**Accents encode mode, not decoration.**

- **Solo → Soft Teal `#5EEAD4`.** Analogous to emerald on the color wheel → low tension, extends the brand rather than contrasting it. Reinforces the calm-focus state.
- **Pair → Cyan `#00F0FF`.** Historically the "presence" color across collaborative tooling (Figma cursors, Google Docs). High-chroma + cool → reads as *someone else is here*.
- **Interview → Violet `#8B5CF6`.** Cool, saturated, but *not* alarm-adjacent (red/orange). Communicates gravity ("this session is being observed") without triggering error semantics. Chosen softer than your existing `--color-voltage-violet #BC00FF` specifically to avoid a "danger" read.

**Subconscious recognition.** The primary emerald is fixed, so users always know it's Session. The accent is what their eye picks up first when the mode changes — cursor colors, focus rings, the CTA gradient, and the presence dots all shift in the same beat. Three seconds after opening a room, muscle memory ties *teal = alone*, *cyan = with someone*, *violet = being assessed*.

**What never changes.** Status colors (success `#24C96A`, warning `#FFB800`, danger `#F04438`, info `#3B9EFF`) are mode-invariant. Danger is danger in every context.

---

## 4. Complete Color Tokens

Actual hex values. All six variants below. Values marked `α` include alpha for glass/glow/selection.

### 4.1 Shared primitives (all modes, all themes)

| Token | Value |
|---|---|
| `--emerald-500` (brand) | `#17B85C` |
| `--emerald-400` | `#24C96A` |
| `--emerald-600` | `#109049` |
| `--accent-teal` (Solo) | `#5EEAD4` |
| `--accent-cyan` (Pair) | `#00F0FF` |
| `--accent-violet` (Interview) | `#8B5CF6` |
| `--status-success` | `#24C96A` |
| `--status-warning` | `#FFB800` |
| `--status-danger` | `#F04438` |
| `--status-info` | `#3B9EFF` |

### 4.2 Dark · Solo

| Token | Hex |
|---|---|
| background | `#050506` |
| foreground | `#F7F8F9` |
| surface | `#0A0B0D` |
| panel | `#121418` |
| card | `#101216` |
| popover | `#0E1013` |
| sidebar | `#08090B` |
| muted | `#121418` |
| muted-foreground | `#7C858E` |
| border | `rgba(255,255,255,0.10)` |
| input | `rgba(255,255,255,0.06)` |
| primary | `#17B85C` |
| primary-foreground | `#04120A` |
| secondary | `#121418` |
| accent | `#5EEAD4` |
| accent-soft | `rgba(94,234,212,0.14)` |
| ring / focus | `rgba(23,184,92,0.60)` |
| glow | `0 0 24px rgba(23,184,92,0.28)` |
| overlay | `rgba(0,0,0,0.65)` |
| selection | `rgba(23,184,92,0.28)` on `#FFFFFF` |
| hover overlay | `rgba(255,255,255,0.04)` |
| active overlay | `rgba(255,255,255,0.08)` |
| disabled bg / fg | `rgba(255,255,255,0.04)` / `rgba(255,255,255,0.32)` |
| editor bg | `#08090B` |
| editor gutter | `#0E1013` |
| console bg | `#06070A` |
| code-block bg | `#0C0E12` |
| scrollbar thumb | `rgba(255,255,255,0.10)` |
| cursor (remote) | `#5EEAD4` |
| presence active / idle | `#24C96A` / `#7C858E` |
| voice active | `#17B85C` |
| execution running / success / failed | `#3B9EFF` / `#24C96A` / `#F04438` |
| question easy / medium / hard | `#17B85C` / `#FFB800` / `#F04438` |
| room open / locked / live | `#17B85C` / `#7C858E` / `#5EEAD4` |
| chart-1..5 | `#17B85C` `#3B9EFF` `#FFB800` `#A78BFA` `#F472B6` |
| gradient (CTA) | `linear-gradient(135deg,#17B85C,#1DD97C)` |
| gradient (accent) | `linear-gradient(135deg,#17B85C,#5EEAD4)` |
| glass bg / border | `rgba(10,11,13,0.72)` / `rgba(255,255,255,0.08)` |

### 4.3 Dark · Pair

Inherits every Solo token; overrides:

| Token | Hex |
|---|---|
| accent | `#00F0FF` |
| accent-foreground | `#001318` |
| accent-soft | `rgba(0,240,255,0.14)` |
| ring | `rgba(0,240,255,0.55)` |
| glow | `0 0 28px rgba(0,240,255,0.30)` |
| gradient (CTA) | `linear-gradient(135deg,#17B85C,#00F0FF)` |
| gradient (accent) | `linear-gradient(135deg,#24C96A,#00F0FF)` |
| cursor (remote) | `#00F0FF` |
| presence active | `#00F0FF` |
| voice active | `#00F0FF` |
| room live | `#00F0FF` |

### 4.4 Dark · Interview

Inherits Solo; overrides:

| Token | Hex |
|---|---|
| accent | `#8B5CF6` |
| accent-foreground | `#FFFFFF` |
| accent-soft | `rgba(139,92,246,0.14)` |
| ring | `rgba(139,92,246,0.55)` |
| glow | `0 0 24px rgba(139,92,246,0.24)` |
| gradient (CTA) | `linear-gradient(135deg,#109049,#8B5CF6)` |
| gradient (accent) | `linear-gradient(135deg,#17B85C,#8B5CF6)` |
| cursor (remote) | `#8B5CF6` |
| voice active | `#8B5CF6` |
| room live | `#8B5CF6` |

### 4.5 Light · Solo

| Token | Hex |
|---|---|
| background | `#FBFCFD` |
| foreground | `#0A0B0D` |
| surface | `#FFFFFF` |
| panel | `#F4F6F8` |
| card | `#FFFFFF` |
| popover | `#FFFFFF` |
| sidebar | `#F7F8FA` |
| muted | `#F1F3F5` |
| muted-foreground | `#4E555C` |
| border | `rgba(10,11,13,0.10)` |
| input | `rgba(10,11,13,0.05)` |
| primary | `#17B85C` |
| primary-foreground | `#FFFFFF` |
| accent | `#5EEAD4` |
| accent-soft | `rgba(94,234,212,0.22)` |
| ring | `rgba(23,184,92,0.60)` |
| glow | `0 0 24px rgba(23,184,92,0.18)` |
| overlay | `rgba(10,11,13,0.45)` |
| selection | `rgba(16,144,73,0.20)` on `#0A0B0D` |
| editor bg | `#FBFCFD` |
| editor gutter | `#F4F6F8` |
| console bg | `#F7F8FA` |
| console fg | `#1C1F23` |
| glass bg / border | `rgba(255,255,255,0.72)` / `rgba(10,11,13,0.08)` |

### 4.6 Light · Pair

Inherits Light · Solo; overrides:

| Token | Hex |
|---|---|
| accent | `#00F0FF` |
| accent-soft | `rgba(0,180,200,0.20)` |
| ring | `rgba(0,180,200,0.55)` |
| glow | `0 0 24px rgba(0,180,200,0.22)` |
| gradient (CTA) | `linear-gradient(135deg,#17B85C,#00F0FF)` |
| cursor / presence / voice / room live | `#00F0FF` |

### 4.7 Light · Interview

Inherits Light · Solo; overrides:

| Token | Hex |
|---|---|
| accent | `#8B5CF6` |
| accent-soft | `rgba(139,92,246,0.18)` |
| ring | `rgba(139,92,246,0.55)` |
| glow | `0 0 24px rgba(139,92,246,0.16)` |
| gradient (CTA) | `linear-gradient(135deg,#109049,#8B5CF6)` |
| cursor / voice / room live | `#8B5CF6` |

---

## 5. CSS Variables

See [`src/styles/tokens.css`](./src/styles/tokens.css) — full source, organized:

1. Primitives
2. Dark theme (`:root`)
3. Light theme (`.light`)
4. Mode layer — Solo (default)
5. Mode layer — Pair (`[data-mode="pair"]`)
6. Mode layer — Interview (`[data-mode="interview"]`)
7. Hover / active / disabled overlays
8. `prefers-reduced-motion` reset

To adopt, add one import to `src/styles.css` after the Tailwind import:

```css
@import "tailwindcss";
@import "./styles/tokens.css";
```

Then flip mode + theme on the root element:

```html
<html class="dark" data-mode="interview">
```

---

## 6. Component Styling

Every component uses the **same structure, spacing, and radii** across modes. Only tokens marked *mode* change per mode.

### Buttons
- Radius `--radius-md`, height 36px (sm 32, lg 44), horizontal padding `--space-4`.
- **Primary** — `background: var(--gradient-cta)` *(mode)*, `color: var(--primary-foreground)`, `box-shadow: var(--glow)` on hover *(mode)*.
- **Secondary** — glass surface (`var(--glass-bg)`, 1px `var(--glass-border)` inset).
- **Ghost** — transparent, `hover: var(--hover-overlay)`.
- **Destructive** — `var(--status-danger)` (mode-invariant).
- Focus: `box-shadow: var(--focus-ring)` (2px offset + 2px `--ring` *mode*).

### Cards
- `--radius-lg`, `background: var(--card)`, 1px `var(--border)`, `box-shadow: var(--elev-1)`.
- Interactive cards lift to `--elev-2` and gain a 1px `var(--ring)` outline on hover.

### Inputs
- `--radius-md`, 40px height, `background: var(--input)`, 1px `var(--border)`.
- Focus: border → `var(--ring)` *(mode)*, `box-shadow: var(--focus-ring)`.
- Monospace variant for filenames/IDs uses `--font-mono`.

### Dropdowns / Popovers
- `background: var(--popover)`, `--radius-lg`, `--elev-3`, `backdrop-filter: blur(var(--glass-blur-md))`.
- Selected item: `background: var(--accent-soft)` *(mode)*, left 2px `var(--accent)` bar.

### Dialogs
- Center-modal, `--radius-xl`, `--elev-4`, overlay `var(--overlay)`.
- Enter: 240ms fade + 6px lift, `--ease-emphasize`.

### Tabs
- Underline style. Active tab: 2px `var(--accent)` *(mode)* underline + `color: var(--foreground)`.
- Inactive: `color: var(--muted-foreground)`.

### Sidebar
- `background: var(--sidebar)`, 1px right `var(--border)`, width 260px collapsible to 56px.
- Active item: `background: var(--accent-soft)` *(mode)* + left 2px `var(--accent)` bar.
- Mode chip pinned to sidebar header — the single most explicit "which mode am I in" cue.

### Navbar
- 56px, `background: var(--glass-bg)`, `backdrop-filter: blur(var(--glass-blur-lg))`, 1px bottom border.
- Room name uses `--font-mono` for the ID suffix.

### Activity Feed
- Vertical timeline, 8px dots colored by event (`--presence-active` for joins, `--execution-success` for green runs).
- Timestamps `--font-mono`, `--muted-foreground`.

### Code Editor
- `background: var(--editor-bg)`, gutter `var(--editor-gutter)`, active line `var(--editor-line)`.
- Selection: `var(--selection-bg)`. Font: `--font-mono`.
- Remote cursors: 2px caret in `var(--cursor-remote)` *(mode)*, name flag same color, 90% opacity.

### Terminal / Console
- `background: var(--console-bg)`, `color: var(--console-fg)`, `--font-mono`, 13px.
- ANSI red/green/yellow/blue map to status tokens.

### Execution Results
- Result banner: `background: var(--accent-soft)` on success (mode primary green), `rgba(240,68,56,0.14)` on failure.
- Status icon uses shape (✓ / ✕ / ●) *and* color for color-blind users.

### Graphs / Analytics
- `--chart-1..5` palette. Grid lines: `var(--border)`. Axis labels: `var(--muted-foreground)`.
- Emerald `--chart-1` always represents the current user's data.

### Question Cards
- Card + top-left difficulty pill (`--question-easy/medium/hard`).
- Solved state: 1px `var(--emerald-500)` outline + tiny check.

### Room Cards
- Preview thumbnail top, room name + participant strip below.
- Live-dot uses `var(--room-live)` *(mode)*, 2px pulsing ring (respects reduced motion).

### Interview Timeline
- Horizontal segments per phase (intro / question / wrap-up).
- Current phase: `background: var(--accent)` *(violet in Interview)*, past: `var(--emerald-600)`, future: `var(--muted)`.

### Timer
- Monospace 32px. Neutral until <60s → `--status-warning`; <10s → `--status-danger` + subtle pulse.

### Chat Panel
- Right rail, 320px, `var(--panel)`.
- Own bubbles: `var(--accent-soft)` *(mode)* right-aligned. Others: `var(--muted)` left-aligned.

### Video Controls
- Rounded pill, `--radius-pill`, glass surface.
- Active mic: `var(--voice-active)` *(mode)*; muted: `var(--muted-foreground)`.

### Participant List
- Avatar + name + role. Voice ring pulses `var(--voice-active)` while speaking.
- "Driver" badge in Pair mode uses cyan; "Interviewer" in Interview uses violet.

### Notifications / Toasts
- Bottom-right, `var(--popover)`, 4px left bar colored by kind (info/success/warn/danger).
- 4s auto-dismiss, hover to persist.

### Profile Menu
- Popover, avatar header, mode switcher inline (radio group of 3 mode chips).

### Loading Screens
- Single centered 24px spinner in `var(--primary)`. Optional 1-line status in `--muted-foreground`.

### Empty States
- Icon (1.5px stroke, `--muted-foreground`), title (`--foreground`), one-line hint, one primary action.

### Skeletons
- `background: var(--muted)`, shimmer overlay `linear-gradient(90deg, transparent, var(--hover-overlay), transparent)`.

### Tooltips
- Delay 300ms, `background: var(--foreground)`, `color: var(--background)`, 12px, `--radius-sm`.

---

## 7. Motion System

Realistic durations, tied to intent.

| Interaction | Duration | Easing | Notes |
|---|---|---|---|
| Hover / press micro | 120ms | `--ease-standard` | Opacity, background, border only |
| Button / input hover | 180ms | `--ease-standard` | Includes glow fade-in |
| Sidebar collapse | 220ms | `--ease-emphasize` | Width + label opacity |
| Drawer / popover open | 200ms | `--ease-emphasize` | 4px slide + fade |
| Dialog open | 240ms | `--ease-emphasize` | Overlay 160ms, content 240ms + 6px lift |
| Page transition | 200ms | `--ease-standard` | Fade only, no slide |
| **Mode switch** | 320ms | `--ease-emphasize` | Cross-fade accent tokens; primary unchanged so no flash |
| Timer tick under 10s | 800ms | `ease-in-out` | 4% scale pulse, reduced-motion → color only |
| Focus ring | 120ms | `--ease-standard` | Never delayed — appears immediately on keyboard focus |
| Cursor movement (Pair) | 60ms | linear | Smoothing between remote positions |
| Presence dot pulse | 1.6s loop | ease-in-out | Opacity 0.6 → 1.0, disabled under reduced-motion |
| Toast enter/exit | 200ms / 160ms | `--ease-standard` | Slide 8px + fade |

All durations map to CSS variables `--motion-micro | --motion-hover | --motion-dialog | --motion-mode` and collapse to `0ms` under `prefers-reduced-motion`.

---

## 8. Accessibility

**Contrast (AA verified)**

| Pair | Ratio | Level |
|---|---|---|
| `#F7F8F9` on `#050506` (dark body) | 19.7:1 | AAA |
| `#7C858E` on `#050506` (dark muted) | 5.6:1 | AA |
| `#04120A` on `#17B85C` (primary button) | 6.1:1 | AA |
| `#001318` on `#00F0FF` (Pair CTA) | 14.8:1 | AAA |
| `#FFFFFF` on `#8B5CF6` (Interview CTA) | 4.7:1 | AA |
| `#0A0B0D` on `#FBFCFD` (light body) | 19.6:1 | AAA |
| `#4E555C` on `#FBFCFD` (light muted) | 7.6:1 | AAA |

**AAA suggestion.** For body copy under 16px, prefer `--foreground` on `--surface` (both themes clear AAA). Reserve `--muted-foreground` for meta text ≥ 14px semibold or ≥ 16px regular.

**Keyboard focus.** Every focusable element uses `--focus-ring` (2px background offset + 2px `--ring`). Never remove the outline; only restyle it. Skip-link is always the first tabstop in the shell.

**Reduced motion.** All non-essential animation is disabled via the `@media (prefers-reduced-motion: reduce)` reset in `tokens.css`. Presence, timer, and execution status also fall back to icon changes when animation is off.

**Color-blind considerations.**
- Execution status: ✓ / ✕ / ● icons in addition to green/red/blue.
- Question difficulty: Easy/Medium/Hard text label always shown next to the color pill.
- Presence: avatar ring uses both color and dashed/solid style for active/idle.
- Interview violet vs Solo teal is distinguishable under deuteranopia and protanopia; both are cool-shifted rather than red-shifted.

---

## 9. Usage Rules

**Gradients.** Allowed only on: primary CTA buttons, hero backgrounds, the mode-switch chip, and the room-card header. Never on cards, inputs, or the editor.

**Glow.** Max **one** glowing element per viewport. Glow is reserved for: primary CTA hover/focus, execution-complete banner, room-live indicator, incoming voice.

**Border opacity.** Between `0.06` and `0.18` in dark; between `0.05` and `0.14` in light. Never a solid neutral border — it flattens the depth.

**Shadow elevation.**
- `--elev-1` — resting cards, inputs
- `--elev-2` — hover cards, dropdowns
- `--elev-3` — popovers, floating panels
- `--elev-4` — dialogs only

Never combine elevation with heavy grey blur — depth is inner light + a soft cast.

**Glass blur.** `8–20px`. `sm` for chips, `md` for popovers/toasts, `lg` for the navbar and modal overlay backdrop.

**Color budget.** Max **3 accent hits** per viewport (mode accent). Everything else is neutral or emerald primary. Dense data surfaces (editor, console, tables) stay purely neutral — accent only in the chrome around them.

**Neutral surfaces.** Always use `--panel` / `--muted` for data-heavy regions. Reserve `--surface` for chrome, `--card` for grouped content.

---

## 10. Do's and Don'ts

**Do**
- Use `var(--gradient-cta)` for the single most important action on screen.
- Let the editor breathe: no borders inside it, no accent color in code.
- Switch modes with a 320ms cross-fade — no page reload.
- Show the mode name in the sidebar header at all times.
- Use monospace for filenames, IDs, times, and any code fragment inline.

**Don't**
- ❌ Don't paint a card with `--accent` — that's what `--accent-soft` is for.
- ❌ Don't stack two glows in the same viewport.
- ❌ Don't use violet as an error color in Interview — status tokens are mode-invariant.
- ❌ Don't remove the emerald primary in any mode. Users lose brand recognition.
- ❌ Don't animate the mode switch by rotating hue on primary. Primary stays. Accents move.
- ❌ Don't use emoji in structural labels (per `PRODUCT.md` anti-references).
- ❌ Don't use a solid grey drop shadow. Use `--elev-*`.

**Common mistakes**
- Using `--foreground` on `--accent` — always use `--accent-foreground`.
- Using the Solo teal in Pair mode by hardcoding `#5EEAD4`. Use `var(--accent)`.
- Removing focus rings "because they look ugly on primary". Restyle, never remove.
- Applying `backdrop-filter` on an element with no translucent background — it does nothing.

---

## 11. Palette Boards

Rendered at 1600px, PNG.

- Solo · Dark → [`docs/design/palette-solo.png`](./docs/design/palette-solo.png)
- Pair · Dark → [`docs/design/palette-pair.png`](./docs/design/palette-pair.png)
- Interview · Dark → [`docs/design/palette-interview.png`](./docs/design/palette-interview.png)

Each board shows: Primary, Secondary, Accent, Background, Surface, Panel, Success, Warning, Danger, Border, Text, Muted, Gradients, Glass — all with actual hex values.

---

## 12. Comparison Board

- All three modes side-by-side → [`docs/design/palette-comparison.png`](./docs/design/palette-comparison.png)

The comparison board is the fastest read of the whole system: same emerald primary at the top of every column, only the accent + gradient row changes.

---

## 13. Component Preview Boards

Identical mock IDE (sidebar / editor / console / participant strip / timer / CTA) rendered in each mode so only the color language shifts.

- Solo → [`docs/design/preview-solo.png`](./docs/design/preview-solo.png)
- Pair → [`docs/design/preview-pair.png`](./docs/design/preview-pair.png)
- Interview → [`docs/design/preview-interview.png`](./docs/design/preview-interview.png)

---

## 14. Figma Style Guide

Full documentation page → [`docs/design/figma-style-guide.png`](./docs/design/figma-style-guide.png).

### Typography

| Role | Family | Size / Line | Weight |
|---|---|---|---|
| Display | IBM Plex Sans | 40 / 48 | 600 |
| H1 | IBM Plex Sans | 32 / 40 | 600 |
| H2 | IBM Plex Sans | 24 / 32 | 600 |
| H3 | IBM Plex Sans | 20 / 28 | 600 |
| Body-lg | Inter | 16 / 24 | 400 |
| Body | Inter | 14 / 20 | 400 |
| Body-sm | Inter | 13 / 18 | 400 |
| Label | IBM Plex Sans Condensed | 12 / 16 | 500, tracking +0.04em, uppercase |
| Code | JetBrains Mono | 13 / 20 | 400 |
| Code-lg (editor) | JetBrains Mono | 14 / 22 | 400 |

Rules: never mix serifs; body copy always `--foreground`; monospace for anything the user could copy-paste.

### Spacing

4px base. Steps: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Component padding uses 12/16, section padding 24/32, page gutters 32/48.

### Grid

12-column, 24px gutter, 1200px max content width. Editor + panel layout is a 3-region grid: `sidebar (auto) | main (1fr) | right rail (auto)`.

### Radius

`xs 4 · sm 8 · md 10 · lg 12 · xl 16 · 2xl 24 · pill 999`. Buttons + inputs `md`. Cards + popovers `lg`. Dialogs `xl`. Avatars + chips `pill`.

### Elevation

`elev-1..4` as defined in §9. Only ever four levels — no ad-hoc shadows.

### Icons

Lucide, 1.5px stroke, 16 / 20 / 24px sizes. `color: currentColor` — never hard-coded.

### Buttons

Variants: primary, secondary (glass), ghost, destructive. Sizes: sm 32, md 36, lg 44. Only one primary button per view.

### Inputs

Height 40, radius `md`, 1px border, focus ring 2px `--ring`. Error state uses `--status-danger` for border + helper text only.

### Cards

Padding 20 (24 for feature cards), radius `lg`, `--elev-1` resting.

### Color Tokens

Full list in §4. Grouped in the Figma file as: Brand, Neutral, Accent (per mode), Status, Surface, Editor, Presence, Charts, Gradients, Glass.

### Component Tokens

Buttons, Inputs, Cards, Tabs, Sidebar, Dialogs each expose their own token set that reads through semantic tokens — e.g. `--button-primary-bg: var(--gradient-cta)`.

### Interaction States

Every interactive component defines: `default → hover → active → focus → disabled → loading`. Focus is always visible; disabled is never removed from the DOM.

---

*Base every future decision on this system. When something feels missing, extend a mode block — do not fork the base.*
