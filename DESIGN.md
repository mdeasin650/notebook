# Design Brief

## Tone & Differentiation
Editorial minimalism. Inspired by Notion's refined typography and Roman & Williams' restraint. Interface disappears; content is hero. Warm, intimate, uncluttered.

## Color Palette

| Token | Light OKLCH | Dark OKLCH | Usage |
|-------|-------------|-----------|-------|
| `background` | 0.98 0.01 60 | 0.15 0.01 60 | Page background, breathing room |
| `foreground` | 0.2 0.02 60 | 0.92 0.01 60 | Body text, primary content |
| `accent` | 0.62 0.1 180 | 0.68 0.1 180 | Tag pills, active states, highlights |
| `primary` | 0.5 0.12 180 | 0.68 0.1 180 | Save button, primary CTA |
| `destructive` | 0.55 0.22 25 | 0.65 0.19 22 | Delete action |
| `border` | 0.92 0.01 60 | 0.28 0.01 60 | Subtle dividers, card edges |
| `muted` | 0.88 0.01 60 | 0.28 0.01 60 | Secondary surfaces, disabled states |

## Typography
- **Display**: Lora (serif, warm elegance) — titles, note headers
- **Body**: Nunito (humanist sans, readable prose) — note content, UI labels
- **Mono**: JetBrains Mono — code blocks, timestamps

Type scale: lg (3xl), md (2xl), sm (xl) + body-lg/sm. Generous line-height (1.625+).

## Structural Zones
| Zone | Treatment | Intent |
|------|-----------|--------|
| Header | `bg-card` + `border-b border-border` | Subtle elevation, grounded identity |
| Sidebar | `bg-sidebar` + `border-r border-sidebar-border` | Note list, clear visual separation |
| Content | `bg-background` | Main note editor, maximum breathing room |
| Tag Pills | `bg-accent/10` + `border accent/20` | Muted but clear categorization |

## Shape Language
- `--radius: 0.5rem` — soft but not rounded, respects editorial precision
- Borders: 1px solid token colors
- No shadows beyond subtle elevation on `.note-card` (inner border approach)

## Component Patterns
- `.note-card` — card with hover border transition
- `.tag-base` — pill with accent color, low opacity bg
- Typography utilities — type scale hierarchy via display/body fonts

## Motion
- `.transition-smooth` — 0.3s cubic-bezier for all interactive changes
- Border-color transitions on hover (accent/40 on `.note-card`)
- No entrance animations; focus on interaction clarity

## Constraints
- Never use raw hex or named colors; always use CSS tokens
- Max 2 font families + 1 mono for hierarchy and readability
- Minimal shadows; rely on borders and composition for depth
- Light/dark mode maintains warmth via hue and chroma, not just lightness

