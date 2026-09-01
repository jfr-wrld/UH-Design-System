# Contributing

The full, current version of this guide lives in Storybook itself
(**Contributing**, in the sidebar) — this file is a short pointer to it,
kept at the repo root because GitHub links here automatically from the
issue and pull request creation flows. If the two ever disagree, the
Storybook page is the one that's current.

## Before opening an issue for a new component

Extend an existing component first — it's the cheaper choice long term.
Check, in order:

1. Does an existing component already do this with a prop you haven't
   tried? Read that component's own Storybook page first.
2. Is this a composition of existing components, not a new primitive?
   Most product screens are exactly that.
3. Does the gap show up only once, in one place? A pattern used exactly
   once usually belongs in that screen's own code, not in the design
   system.

If none of those hold, open an issue with: the use case, a mockup or
clear description, and which real screen(s) need it.

## The standard every shipped component meets

All states (including disabled/loading/error where relevant) · a state
matrix, a dark-mode story, and a text-expansion story (English/Malay/
Indonesian side by side) · passes `pnpm test:a11y` in a real browser ·
every value resolves to a design token, no literals · 44px tap targets ·
icons from `@tailgrids/icons`, not hand-copied SVG, unless nothing in
that set reasonably fits.

## Before you push

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm lint:ds
```

CI runs the same checks (plus `pnpm test:a11y` and a bundle-size diff
against the committed baseline) on every PR — a red check there is a
faster, more honest first answer than waiting on a human reviewer for
the same thing a script already knows.

See **Contributing** in Storybook for the full version: the reasoning
behind each rule, how to add a new design token, and what a human
reviewer checks that a script can't.
