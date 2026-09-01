# UmrahHaji Design System

Monorepo for the UmrahHaji design system: design tokens, React components, and
their documentation.

> **Start with [`HANDOFF.md`](./HANDOFF.md), not this file.** It's the
> current, actively-maintained entry point — what exists, what doesn't, the
> non-negotiable rules, and release status. This README stays as the deeper
> reference for the token pipeline and package internals below; it isn't
> kept as current on component count and release state as `HANDOFF.md` is.

## Structure

```
umrahhaji-ds/
├─ packages/
│  ├─ tokens/          # single source of truth for design tokens + Style Dictionary pipeline
│  └─ ui/              # React components (Vite library build + Tailwind)
├─ apps/
│  └─ storybook/       # component documentation & preview (Storybook 8 + addon-a11y)
├─ package.json
└─ README.md
```

## Requirements

- Node.js >= 22 (jsdom's own test dependencies need a Node webidl API that
  doesn't exist before 22)
- pnpm 10 (`corepack enable` or `npm i -g pnpm@10`)

## Getting started

```bash
pnpm install
pnpm build
pnpm dev        # Storybook on http://localhost:6006
```

## Scripts

Run from the repository root:

| Script                | What it does                                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `pnpm build`          | Builds every workspace in dependency order (tokens → ui → docs).                                                  |
| `pnpm build:packages` | Builds `packages/*` only, skipping the Storybook static site.                                                     |
| `pnpm dev`            | Starts Storybook in watch mode.                                                                                   |
| `pnpm typecheck`      | Runs `tsc --noEmit` in every workspace.                                                                           |
| `pnpm test`           | Unit tests (vitest) across every workspace.                                                                       |
| `pnpm test:a11y`      | Builds Storybook, then runs axe against every story in a real browser.                                            |
| `pnpm lint`           | ESLint across the repo.                                                                                           |
| `pnpm lint:ds`        | Design-system-specific guard (see `HANDOFF.md`'s non-negotiable rules) — portable, runs against any repo's `src`. |
| `pnpm bundle-size`    | Per-component gzipped bundle size, diffed against `bundle-size-baseline.json`.                                    |
| `pnpm format`         | Prettier write. `pnpm format:check` verifies instead.                                                             |
| `pnpm changeset`      | Records a changeset for the next release. See `.changeset/README.md` for this project's v0.x semver rules.        |
| `pnpm clean`          | Removes build output and `node_modules`.                                                                          |

## Packages

### `@umrahhaji/tokens`

`src/tokens.json` is the single source of truth. Everything else in the package
is generated from it by [Style Dictionary](https://styledictionary.com); nothing
under `build/` should ever be edited by hand.

#### Two layers

| Layer       | Path                                 | Purpose                                                |
| ----------- | ------------------------------------ | ------------------------------------------------------ |
| `primitive` | `primitive.color.teal.500`           | Raw ramps and scales. Never referenced by a component. |
| `semantic`  | `semantic.<mode>.color.text.primary` | Intent. This is what components consume.               |

The semantic layer carries two modes, `light` and `dark`. Both compile to the
**same** custom property — `--uh-color-text-primary` — so switching themes is a
plain CSS cascade with no JS involved:

```
:root                                 primitives + light semantics
[data-theme='dark']                   dark semantics (explicit opt-in)
@media (prefers-color-scheme: dark)   dark semantics (system default, unless
  :root:not([data-theme='light'])     the page explicitly asked for light)
```

#### What is in there

- **Colour** — teal (primary) and orange (secondary) ramps 50–900, a cool slate
  `neutral` ramp 0–950 whose `950` is the dark canvas `#0B1220`, plus green,
  amber, red and blue ramps backing the feedback roles.
- **Feedback** — `success`, `warning`, `error`, `info`, each with `bg`,
  `border`, `text`, `solid` and `on-solid`.
- **Booking status** — `pending`, `paid`, `confirmed`, `in-progress`,
  `completed`, `cancelled`, `refunded`, with the same five sub-tokens so one
  badge component covers every state.
- **Scales** — `spacing` on a 4pt grid (2–96), `radius`, `elevation` 0–5,
  `border-width`, `z-index`, and `motion` durations and easings.
- **Control sizes** — `size.control` (36/44/52), `size.tap-target-min` (44),
  `size.icon`, `size.focus-ring`. Deliberately separate from `spacing`: these
  are the size of a thing, not the gap between things, and 44px is a tap floor
  rather than a grid step.

#### Accessibility is encoded, not documented

Every contrast ratio quoted in a token description is a measured WCAG 2.1 value,
computed by the generator rather than typed by hand, and it flows through into
the CSS comments. The rules the palette enforces:

| Rule                                                    | Ratio       |
| ------------------------------------------------------- | ----------- |
| Body text / links on light → `teal-700` or `orange-700` | 7.20 / 5.82 |
| Teal button → `teal-600` fill, white label              | 5.19        |
| Orange button → `orange-500` fill, `#0B1220` label      | 6.64        |
| **Never** white on `#F17824`                            | 2.82 ✗      |
| Dark-mode text on `#0B1220` → teal/orange `300`–`400`   | 7.52–11.79  |

Shade `500` is reserved for headings 24px and up, icons 24px and up, badges and
large fills — it is never a body-text colour.

Two consequences worth knowing:

- **`action.secondary` lightens on hover** (`orange-500` → `400` → `300`).
  Darkening would drop the constant dark label to 3.87:1 at `orange-600`, so the
  ramp runs the other way. `action.primary` darkens normally.
- **`on-solid` exists on every feedback and status role.** Without it nothing in
  the system stops a white label landing on an orange fill; with it, a badge is
  always `solid` + `on-solid` and the pairing is guaranteed.
- **`border.strong` is `neutral-500` in both modes** — the only neutral that
  clears the 3:1 minimum for UI-component boundaries (4.76:1 light, 3.07:1 on
  the dark field surface). `border.default` is decorative at 1.23:1 and must
  never be a control's only affordance.
- **Feedback roles carry `border-strong` as well as `border`.** The plain
  `border` is a decorative ramp-200 hairline, fine behind a badge and useless as
  an error outline on an input. `border-strong` is the accessible one —
  ramp-700 in light, ramp-400 in dark, measured against the field surface.
  Status roles deliberately do not have it: they label badges, not controls.

#### Typography

Two self-hosted families, both SIL Open Font License 1.1, so embedding them in
iOS and Android binaries is permitted:

| Role   | Family            | Stack                                                       |
| ------ | ----------------- | ----------------------------------------------------------- |
| Latin  | Plus Jakarta Sans | `"Plus Jakarta Sans", system-ui, -apple-system, sans-serif` |
| Arabic | Noto Naskh Arabic | `"Noto Naskh Arabic", "Plus Jakarta Sans", serif`           |

Four scales live under `typography`: `web`, `mobile`, `arabic` and `numeric`,
plus `measure` for line length. Each style is stored as flat leaf tokens
(`typography.web.h1.fontSize`) rather than a composite blob, so every field
becomes its own custom property and the JSON that iOS and Android read is plain
resolved values.

Mobile body copy floors at 15px on purpose: the audience is 30–60 and often
reads without reading glasses.

##### Tabular numerals

Prices sit in card grids and breakdown tables, so digits must be equal width.
**Plus Jakarta Sans is strongly proportional by default** — its `1` is 371 units
against `0` at 732, nearly a 2× difference. Only `tnum` fixes this, pinning
every digit to 600 units. Measured in a real browser at 20px:

|         | `1111`   | `0000`   | `RM 12,500` | `RM 9,800` | `RM 24,300` |
| ------- | -------- | -------- | ----------- | ---------- | ----------- |
| default | 31.37px  | 57.28px  | 101.37      | 93.28      | 106.16      |
| `tnum`  | **48px** | **48px** | **101.77**  | **89.77**  | **101.77**  |

The two five-digit prices become identical; `RM 9,800` is narrower by exactly
one 12px digit, which is what right-alignment is for.

`pnpm --filter @umrahhaji/tokens test` re-checks every accessibility contract
(122 of them, both themes) against the built stylesheet with `var()` chains
resolved, and re-checks the numerals against the shipped subset fonts at every
weight. It exists because `tnum` is **not** in fontTools' default
keep-list — a careless change to the subsetting step would silently break every
price column, with no error anywhere.

Two caveats:

- **`lnum` is inert.** Neither font has an `lnum` feature, because neither has
  oldstyle figures — the defaults are already lining. It is declared for
  portability if the face is ever swapped.
- **Tailwind's `text-numeric-*` does not carry the feature settings.** The
  `--text-*` namespace only holds size, line-height, letter-spacing and weight.
  For prices use `.uh-type-numeric-*`, or add Tailwind's `tabular-nums`.

##### Arabic optical calibration

Noto Naskh Arabic and Plus Jakarta Sans do not sit at the same optical size, so
the Arabic scale runs larger. Measured: Latin cap-height is 0.745em, Arabic alef
is 0.671em — matching those needs roughly **1.11×**, which is what the
`16 → 18` and `18 → 20` pairings encode.

That factor depends on which feature you anchor to (anchoring x-height to the
Arabic tooth height would suggest 1.31× instead), so the
`Foundations/Typography → Malay + Arabic pairing` story exists to settle it by
eye with real copy.

One measured caveat: **Noto Naskh Arabic's own line box is 1.703em**
(ascent 1069 + descent 634 per 1000 upm). `arabic-title` at line-height 1.7 is
therefore a hair under the font's natural height — fine for the single line a
surah name occupies, but raise it to 1.8 if a title ever wraps with vowel marks.

##### Font pipeline

Source variable fonts live in `assets/fonts/source/`; `pnpm --filter
@umrahhaji/tokens fonts:build` subsets them and writes the outputs, which are
**committed**. `pnpm build` and CI never run this step.

| Family            | Subset            | Upstream | Web (variable woff2) | Mobile (static ttf) |
| ----------------- | ----------------- | -------- | -------------------- | ------------------- |
| Plus Jakarta Sans | latin + latin-ext | 172.2 kB | **39.1 kB** (−77%)   | 243.0 kB across 5   |
| Noto Naskh Arabic | arabic            | 300.4 kB | **87.9 kB** (−71%)   | 272.3 kB across 2   |

The web build ships **one variable woff2 per family** rather than five static
cuts: it covers every weight in the range and is far smaller than the sum of the
statics, so preloading the single file covers both above-the-fold weights (400
and 600) at once. Mobile still gets static instances, which is what iOS and
Android bundles expect.

The pipeline shells out to fontTools rather than a JS subsetter, because it is
the only option that lets us pin exactly which OpenType features survive. It
needs `pip install "fonttools[woff]" brotli`; set `PYTHON=` to point it at a
different interpreter.

#### Outputs

| Platform    | Output                            | Import specifier                 |
| ----------- | --------------------------------- | -------------------------------- |
| CSS         | `build/css/variables.css`         | `@umrahhaji/tokens/css`          |
| Tailwind v4 | `build/tailwind/theme.css`        | `@umrahhaji/tokens/tailwind.css` |
| Tailwind v3 | `build/tailwind/tokens.js`        | `@umrahhaji/tokens/tailwind`     |
| JSON        | `build/json/tokens.json` (nested) | `@umrahhaji/tokens/json`         |
| JSON        | `build/json/tokens.flat.json`     | `@umrahhaji/tokens/json/flat`    |

The Tailwind v4 file uses `@theme inline` because its values are `var()`
references that change between themes — Tailwind must not snapshot them at build
time. It also emits `--spacing-*: initial` to clear Tailwind's default step
scale first; without that, `p-4` would mean 4px (this system) while `p-6` still
meant 24px (Tailwind's multiplier).

Typography maps onto Tailwind's `--text-*` namespace, where a size carries its
own line-height, letter-spacing and weight — so `text-web-h1` applies the whole
composite style in one utility. Families become `font-latin` and `font-arabic`.

Alongside those, `typography.css` ships plain utility classes: `.uh-type-web-h1`,
`.uh-type-arabic-lg`, `.uh-type-numeric-price-md`, `.uh-measure` (caps a text
column at 68ch), and `.uh-clamp-1` / `.uh-clamp-2` / `.uh-clamp-3`. **Package
names on a card must use `.uh-clamp-2`** — one line loses too much of the name,
three makes card heights ragged in a grid.

Font URLs are sibling-relative (`./fonts/…`) so they survive being inlined into
a consumer's bundle, as long as the `fonts/` directory travels with the CSS.
`packages/ui` copies it into `dist/` for exactly that reason.

Semantic colours are renamed for readable utilities: `color.text.*` becomes
`text-fg-*` and `color.bg.*` becomes `bg-*`, so you write `text-fg-primary` and
`bg-surface`. Everything else keeps its full path (`bg-status-paid-solid`,
`border-border-strong`).

The transform list in `style-dictionary.config.js` is written out by hand
instead of using `transformGroup: 'css'` — that group would rewrite px into rem
and reformat every hex value, and the palette is specified exactly. Only names
are transformed; values are emitted verbatim.

`scripts/build.mjs` exits successfully with a notice if `src/` is ever empty, so
the pipeline stays safe to run in CI.

### `@umrahhaji/ui`

67 components as of this writing — the list drifts, so it's kept in exactly
one place rather than duplicated here: browse `Components/*` in Storybook,
or see `HANDOFF.md`'s own tiered list (which also names what's deliberately
_not_ built, and why).

**`Input` has no `type="tel"`.** Every phone number this platform collects
crosses a border, so the country code is structured data, not a prefix someone
types into a free-text field: `"+60 12..."`, `"0060 12..."` and `"012..."` are
all the same number and none of them parse. `PhoneInput` owns phone numbers and
keeps the country as a value. The union is narrowed so the wrong path fails to
compile rather than failing in the database. A field that genuinely needs a
telephone keypad with no country passes `type="text"` with `inputMode="tel"` -
deliberate, not the default.

**Every value in a component stylesheet must resolve to a token.**
`pnpm --filter @umrahhaji/ui verify:tokens` fails the build on a literal hex,
px, rem, em, duration or `rgb()` in any component CSS — comments are stripped
first, so prose may still cite concrete numbers. Component tests then run axe
in jsdom for structure and ARIA; contrast is left to the token layer and to
Storybook's addon-a11y, which runs axe in a real browser with the stylesheet
loaded.

Two deliberate inconsistencies, both with reasons:

- **`Button` uses `aria-disabled`; `Input` uses the native `disabled`.** A
  disabled button should stay focusable so it can still be found and read, and
  the component blocks activation itself. A disabled input must not submit its
  value, which `aria-disabled` alone would not prevent.
- **`Input` is always controlled internally.** Left uncontrolled, the clear
  button would update the component's mirror of the value but never the DOM
  node, and the field would appear to ignore it.

React 19 components bundled by Vite in library mode:

- ESM output at `dist/index.js`, types at `dist/index.d.ts`
- `react`, `react-dom`, and `react/jsx-runtime` stay external (peer deps)
- Tailwind v4 stylesheet compiled to `dist/styles.css`, exported as
  `@umrahhaji/ui/styles.css`

`src/styles.css` imports `@umrahhaji/tokens/tailwind.css`, so every token is
available as a utility. Note that the spacing scale is named in pixels: `p-4`
is 4px, not 16px.

Add a component under `src/`, re-export it from `src/index.ts`, and put its
stories next to it as `*.stories.tsx` — Storybook picks those up automatically.

### `@umrahhaji/storybook`

Storybook 8 on the `@storybook/react-vite` framework. `@storybook/addon-a11y`
is enabled, so axe-core runs against every story and reports in the
Accessibility panel. Story globs cover both `apps/storybook/stories` and
`packages/ui/src`.

## Conventions

- **TypeScript strict mode** is on repo-wide via `tsconfig.base.json`, including
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and
  `verbatimModuleSyntax`. Each workspace extends it.
- **ESLint 9** flat config in `eslint.config.js` (typescript-eslint, react-hooks,
  storybook), with `eslint-config-prettier` last so formatting is Prettier's job.
- **Prettier** settings in `.prettierrc.json`: single quotes, trailing commas,
  100-column width.
