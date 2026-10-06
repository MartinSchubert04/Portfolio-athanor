# DESIGN.md

Design system for Martin Schubert's portfolio. Format: [awesome-design-md](https://github.com/VoltAgent/awesome-design-md)
(Stitch, nine sections). Agents read this before generating or changing any UI.

## 1. Visual Theme & Atmosphere

A terminal that has been running in a scriptorium for a few centuries. The site adapts the owner's
athanor terminal theme to the web: a near-black page, cream and amber phosphor text in a bitmap VGA
font, and old master engravings reduced to two colors by Floyd-Steinberg dithering.

- **Mood:** quiet, nocturnal, a little occult, never spooky. A workshop, not a haunted house.
- **Density:** low. One idea per section, generous vertical space, text columns capped at 65 characters.
- **Voice:** the page talks like a text adventure (rooms, exits, a prompt that answers) but every
  fact on it is real: real jobs, real commits, real sunrise times.
- **Two materials only:**
  1. **Ink on dark.** Text, rules and dithered plates. Flat, no depth.
  2. **Pixel clay.** Anything you can press or that frames a preview. Claymorphism (a puffy surface
     lit from the top left over a soft shadow) drawn with pixel-art means: 4px staircase corners
     instead of curves, hard 4px bevels, and a checkerboard dither where a blurred shadow would be.
- **Dithering is the signature.** It renders the artwork, the shadows, the section breaks and the
  contribution data. Wherever another site would use a gradient, a blur or an opacity ramp, this one
  uses a dither pattern.

## 2. Color Palette & Roles

[Srcery](https://srcery.sh/), as configured in the terminal theme. One accent. Dark only.

| Token | Hex | Role |
|---|---|---|
| `ink` | `#1C1B19` | Page background. Also text on amber surfaces |
| `ink-deep` | `#121110` | Lowlight bevel of dark clay |
| `clay` | `#2A2824` | Dark clay surface; empty cells of the contribution calendar |
| `rule` | `#3C3A36` | 2px rules, bar borders, highlight bevel of dark clay |
| `umber` | `#5C4C39` | Dither of shadows and section breaks. Never text |
| `dim` | `#918175` | Secondary text: captions, dates, labels (4.6:1 on ink) |
| `tan` | `#BAA67F` | The plate ink. Tertiary text, unselected items |
| `cream` | `#FCE8C3` | Primary text and display type |
| `amber` | `#FBB829` | The single accent: links, selection, primary action, data ink, the `@` |
| `amber-hi` | `#FED06E` | Highlight bevel of amber clay |
| `amber-lo` | `#A8760F` | Lowlight bevel and dithered shadow of amber clay |
| `blood` | `#F75341` | Error text only |

Rules:

- Amber is the only accent on the page. Do not introduce the other Srcery hues (green, blue,
  magenta, cyan) for decoration.
- No pure black, no pure white, no gradients between colors, no transparency ramps. A mid-tone is
  made by dithering two palette colors.
- Plates are always `tan` on transparent. They are never tinted amber.

## 3. Typography Rules

| Family | Source | Use |
|---|---|---|
| **PxPlus IBM VGA 8x16** | self-hosted TTF, CC BY-SA 4.0, VileR's Oldschool PC Font Pack | Everything except display |
| **Jacquard 24** | `@fontsource/jacquard-24`, OFL | Display: `h1`, `h2`, large figures |

The VGA font is a bitmap drawn on an 8x16 grid. It is only sharp at 16px and 32px. Do not use any
other size for it. Jacquard 24 is drawn on a 24px grid; use multiples of 24.

| Role | Font | Size / line height | Color |
|---|---|---|---|
| Display XL (`h1`, `h2` on desktop) | Jacquard 24 | 96px / 1 | cream |
| Display L (`h1`, `h2` on mobile, figures) | Jacquard 24 | 72px / 1 | cream |
| Title (`h3` of an entry, project names) | VGA | 32px / 40px | amber, or tan when unselected |
| Body | VGA | 16px / 24px | cream |
| Secondary, captions, labels | VGA | 16px / 24px | dim or tan |

- Font smoothing is off (`-webkit-font-smoothing: none`). Images use `image-rendering: pixelated`.
- No bold, no italic: the bitmap font has neither. Emphasis is a color change (cream, amber, dim).
- No uppercase tracking labels above headings. A section is named by its `h2` and nothing else.
- Headings and buttons in Title Case. Ellipsis is `…`. Quotes are curly. No em or en dashes.
- Numbers that update or line up use `tabular-nums`.

## 4. Component Stylings

### Pixel clay (`.clay`)
Surface and shadow live in pseudo-elements so content is never clipped.
- Shape: `clip-path` polygon with two 4px steps on each corner.
- Surface: `clay` fill, `inset 4px 4px 0` highlight (`rule`), `inset -4px -4px 0` lowlight
  (`ink-deep`), plus two soft inset shadows that give the puffiness.
- Shadow: the same shape, offset 8px right and down, filled with a 4px checkerboard of `umber`.
- Amber variant (`.clay-amber`): `amber` fill, `amber-hi` and `amber-lo` bevels, `ink` text.

### Buttons (`.clay-button`)
- 48px tall, padding 12px 20px, VGA 16px, label never wraps.
- One amber button per view (the primary action); the others are dark clay with cream text.
- Hover: rises 2px up-left and its shadow lengthens. Active: sinks 6px into the shadow.
  Focus: 2px amber outline at 4px offset (cream outline on amber clay).
- Transitions are `steps(2)`, 100ms.

### Chips (`.clay-chip`)
Skills. Dark clay, 40px tall, padding 8px 16px. Hover turns the text amber. Each is a link.

### Plates (`.plate-frame`)
- Artwork is a pre-dithered PNG shown at natural size (`object-fit: none`) and cropped by the frame.
  Never scale a dithered image; resize the frame instead.
- On load and on change the plate prints in from the top: a cover slides down in `steps(20)`, 900ms.
- Caption below, outside the image: `Artist, Title (year)` in dim. No labels over the artwork.

### Prompt (`.prompt-input`)
Two concentric 2px amber frames on ink, 44px tall, amber caret. Label above (`@ visitor, speak the
word:`), reply below in dim inside an `aria-live` region. Focus turns both frames cream.

### Bars
- Top: fixed, 40px, ink with a 2px `rule` border below. Brand `@ martin` in amber, the raven line
  (latest commit, truncated, with an inverse `--More--` link), nav links in tan. Current section in amber.
- Bottom: fixed, 32px, NetHack status line in tan: `Dlvl:n Section`, commit counts, Buenos Aires
  time, planetary hour, moon phase. Every field is live data.

### Sigil
5x5 mirrored identicon, 12px cells, amber, inside a 2px amber frame. Seeded by the latest commit SHA.

### Contribution calendar
16px cells on a 20px pitch. Intensity is dither density, not shade: level 0 is plain `clay`, levels
1 to 3 ink 25, 50 and 75% of the cell's 4px pixels in amber, level 4 is solid amber.

### Section break (`.dither-band`)
A 12px band of `umber` dither thinning downwards, full width, above each section after the hero.

### Links (`.link`)
Amber, 2px underline at 4px offset. Hover: cream.

## 5. Layout Principles

- **Pixel unit: 4px.** Every border, step, shadow offset and gap is a multiple of 4.
- **Container:** `.shell`, 1280px max, 16px gutters on mobile, 32px from 768px.
- **Section rhythm:** dither band, then 56 to 80px above the `h2`, 32 to 48px between `h2` and
  content, 80 to 112px below.
- **No cards for text.** Group with space and 2px rules. Clay is reserved for things you press and
  for the one preview pane.
- **Each section has its own layout family; do not repeat one:**
  1. Hero: plate left, 2px rule, text panel right (the lock screen).
  2. Career: three text-adventure rooms side by side, divided by rules.
  3. Skills: full-width plate, then character sheet beside grouped clay chips.
  4. Projects: master-detail. A vertical tab list selects; a clay pane previews.
  5. Ledger: full-width calendar, then large figures beside a commit log.
  6. Contact: text and actions left, plate right.
- Layouts use CSS Grid with explicit tracks. No percentage flex math.

## 6. Depth & Elevation

Three levels, no blur anywhere in the outer shadow system.

| Level | What | How |
|---|---|---|
| 0 | Page, text, plates, rules | Flat ink |
| 1 | Clay at rest | Bevels plus an 8px dithered offset shadow |
| 1 + hover | Interactive clay | Lifts 2px; shadow offset grows to 10px |
| 1 pressed | Interactive clay | Sinks 6px; shadow offset shrinks to 2px |

Z-index scale: content `auto`, fixed bars `40`, skip link `50`. Nothing else gets a z-index.

## 7. Do's and Don'ts

Do:
- Dither instead of blurring, fading or grading.
- Keep every size on the 4px grid and every font size on its bitmap grid.
- Let real data carry the personality: commits, streaks, sunrise, the moon.
- Give every interactive element hover, active and focus-visible states.
- Regenerate artwork with `npm run plates`; keep originals in `art/`.

Don't:
- Don't use `border-radius`. Roundness is a staircase.
- Don't add a second accent color, a gradient, a glow or a glass panel.
- Don't scale, tint or overlay text on a dithered plate.
- Don't use vector icons; if a glyph is needed, it comes from the VGA font.
- Don't put an uppercase eyebrow above a heading, number the sections, or add scroll cues.
- Don't animate anything other than `transform` and `opacity`, and don't use eased curves: motion
  is stepped.
- Don't invent numbers. A figure on the page is computed from fetched data or it is not there.

## 8. Responsive Behavior

| Breakpoint | Change |
|---|---|
| < 640px | Brand hidden in the top bar. Status bar shows only level and time. Hero plate 256px tall |
| >= 640px | Hero and closing plates 480px tall. Planetary hour and moon appear in the status bar |
| >= 768px | 32px gutters, 96px display type, GitHub counters in the status bar |
| >= 1024px | Two-column layouts switch on. The raven line appears. Hero fills the viewport (`100dvh`) |

- Below 1024px every section is a single column in source order.
- The hero plate frame is `min(640px, 100dvh - 168px)` tall on desktop so the hero always fits a
  768px-tall laptop; the frame crops the plate, it never scales it.
- The contribution calendar keeps its pixel size and scrolls horizontally in a focusable region,
  starting at the newest week.
- On one-column layouts, picking a project scrolls the preview pane into view.
- Touch targets are at least 40px tall. Fixed bars respect `env(safe-area-inset-*)`, and
  `scroll-padding` keeps anchors and focused elements clear of them.
- `prefers-reduced-motion`: all transitions and the print-in animation are disabled; nothing is hidden.

## 9. Agent Prompt Guide

Quick reference:

```
bg ink #1C1B19 · text cream #FCE8C3 · accent amber #FBB829 · secondary dim #918175 · plate ink tan #BAA67F
body: PxPlus IBM VGA 8x16, 16px/24px (or 32px/40px). display: Jacquard 24, 72px or 96px.
unit 4px · no radius · no blur · no gradients · one accent · stepped motion
```

Prompts that work:

- "Add a section in the style of DESIGN.md: a Jacquard 24 `h2` through the `Section` component, body
  in VGA 16px, grouped by space and 2px `rule` lines, no cards. Use a layout family not listed in
  section 5."
- "Add a button: `clay clay-button`, dark clay with cream text. Use `clay-amber` only if it is the
  single primary action in view."
- "Add a plate: put the original in `art/plates/`, run `npm run plates`, register it in
  `src/data/plates.ts` with artist, title and year, and render it with `PlateFigure`."
- "Show a new metric: compute it in `src/lib/` from the fetched GitHub data, add a test, then render
  it as a Jacquard 24 figure with a dim label. Do not hardcode the value."

Before finishing any UI change: run the pre-flight in `.claude/skills/design-taste-frontend` (section
14) and the `web-design-guidelines` audit, and check the agreed deviations in `CLAUDE.md`.
