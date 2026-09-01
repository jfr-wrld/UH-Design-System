# Changesets

Every PR that changes `packages/tokens` or `packages/ui` in a way a consumer
would notice needs a changeset. Run:

```bash
pnpm changeset
```

Pick a bump type, write one sentence a consumer would actually read (this
becomes a CHANGELOG line - "fixed NumberStepper height" not "fixed bug").

## `@umrahhaji/tokens` and `@umrahhaji/ui` version together (fixed)

They release as one version number, always - `packages/tokens` bumping to
0.10.0 means `packages/ui` bumps to 0.10.0 in the same release, even if
nothing in `packages/ui`'s own source changed. This is deliberate: a
consumer installing `@umrahhaji/ui@0.10.0` should never wonder which
`@umrahhaji/tokens` version it was actually built and tested against - there
is exactly one answer, and the version number says it.

## Semver rules while this is 0.x (pre-1.0)

| Bump      | For                                                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **minor** | New component, new variant, **and** a visual token value adjustment (radius, spacing, elevation, color) - see the note below |
| **patch** | Bug fix, accessibility fix, documentation fix                                                                                |

Visual token adjustments are `minor`, not `patch`, even though they read
like a small tweak: this design system has not shipped v1.0.0 yet
specifically because those values are still being calibrated against real
production screens. A `minor` bump on every such change is what makes that
honest in the version number, rather than hiding a visual shift inside a
`patch` release someone auto-updates without looking.

## Semver rules after v1.0.0

| Bump      | For                                                              |
| --------- | ---------------------------------------------------------------- |
| **major** | A token name changes, a prop is removed or its signature changes |
| **minor** | New component, new variant, new optional prop                    |
| **patch** | Bug fix, small token _value_ adjustment (not a rename)           |

v1.0.0 itself is the signal that visual character is locked - after that
point, a value tweak drops to `patch` because it is no longer expected
routine calibration, it is a genuine small fix.
