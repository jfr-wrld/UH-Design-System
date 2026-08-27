# Foundations Documentation Audit

Baseline taken before the Phase 5.5 documentation expansion, against the
seventeen-area target architecture. "Complete" means the page carries all
nine required elements: purpose, live examples, token names with resolved
values, usage guidance, do/don't, responsive behaviour, light/dark
comparison, accessibility requirements, and an implementation example.

| #   | Area                      | Before                                         | Gap                                                                                                     |
| --- | ------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | Introduction & principles | Root Introduction.mdx only                     | No principles page; DESIGN.md content not surfaced in Storybook                                         |
| 2   | Token architecture        | Missing                                        | Three-layer model (primitive / semantic / component alias) undocumented                                 |
| 3   | Colors                    | Partial (CSF, Light+Dark)                      | No do/don't, no code example                                                                            |
| 4   | Typography                | Partial (6 CSF stories)                        | No mixed Malay-Arabic bidi story; no usage/do-don't page                                                |
| 5   | Spacing                   | Partial (inside "Spacing and Shape" catch-all) | Needs its own focused page + guidance                                                                   |
| 6   | Sizing & touch targets    | Partial (same catch-all)                       | Tap-target overlay mechanism not demonstrated                                                           |
| 7   | Layout, grid, breakpoints | Missing                                        | Breakpoint tokens exist but undocumented; no container/grid tokens exist at all (flagged, not invented) |
| 8   | Shape & borders           | Partial (same catch-all)                       | Focus-ring demo buried; no do/don't                                                                     |
| 9   | Elevation                 | Good (both ladders, native table)              | No do/don't, no code example                                                                            |
| 10  | Layering & z-index        | Partial (one "All" story)                      | Needs focused stories + code                                                                            |
| 11  | Iconography               | Missing                                        | De-facto spec (24 viewBox, stroke 1.75, currentColor) lives only in 44 inline SVGs                      |
| 12  | Imagery                   | Missing                                        | Fixture rules (no fabricated people/documents, no religious decoration) live only in fixture comments   |
| 13  | Motion & reduced motion   | Partial (one "All" story)                      | Presets (uh-anim-*, uh-collapse) undocumented; no reduced-motion demo                                   |
| 14  | Interaction states        | Missing                                        | Hover/focus/active/disabled/error shown per component, never as a universal contract                    |
| 15  | Accessibility             | Missing                                        | The enforced rules (154 contracts, 44px, focus, words-not-colour) have no home page                     |
| 16  | Content & localization    | Missing                                        | Labels-as-props pattern, 15-30% expansion, Intl-everything rules undocumented                           |
| 17  | RTL & bidirectional       | Missing                                        | Components use logical properties throughout, but nothing documents or demonstrates it                  |

Structural findings:

- Three pages were "All" catch-alls (Spacing and Shape, Motion, Layering);
  split into focused pages.
- All values were already generated from tokens.flat.json / var(--uh-*) -
  kept; no token values are duplicated by hand anywhere in the docs.
- Missing token groups discovered while documenting (reported, not added,
  per the no-API-change rule): container widths, grid gutters, an icon
  stroke-width token.
