# UmrahHaji — Design Direction

This is the **direction**: who we are designing for, what the product should
feel like, and where the line is. It is not the system — the tokens, scales and
contrast rules live in [README.md](README.md) and in `packages/tokens`.

Direction answers _why this looks the way it does_. The system answers _what the
values are_. Both are needed; neither substitutes for the other.

> **Provenance.** Sections marked _(PRD)_ are transcribed from
> `UmrahHaji_FullStack_Master_PRD.md`, authored by the product/UI-UX team.
> Sections marked _(direction call)_ were decided by the product owner on
> 2026-08-26. Nothing here was invented by an agent.

---

## Design Read

> Reading this as: **a transactional marketplace for first-time and returning
> pilgrims, in a Stripe-like modern-efficient language, dial ENERGY 2 /
> RHYTHM 2 / MOTION 2.**

`Dial: ENERGY 2 / RHYTHM 2 / MOTION 2`

| Dial       | Value | What it means here                                                                                   |
| ---------- | ----- | ---------------------------------------------------------------------------------------------------- |
| **ENERGY** | 2     | Alive but controlled. Stripe/Vercel territory — not GOV.UK austerity, not agency-portfolio noise.    |
| **RHYTHM** | 2     | A consistent grid with a few deliberate breaks. Sections vary enough to stay awake, never at random. |
| **MOTION** | 2     | Transitions and state changes, scoped — see the constraint below.                                    |

**Motion is scoped, not blanket.** MOTION 2 here means transitions on
interaction: focus, open/close, state change, page transition. Scroll-reveal is
allowed on marketing surfaces only (homepage, articles, package browse). It is
**not** allowed in the booking flow, the admin panel, or the agency portal — no
one spending RM 12,500 should wait on an animation, and the audience skews 30–60
on mobile. `prefers-reduced-motion` is honoured everywhere _(PRD §15.2.9)_.

---

## Audience

Pilgrims (Jamaah) booking Umrah and Hajj packages, mostly Malaysian. Many are
booking the largest single transaction of their lives, and many are doing it for
the first time. Mobile-first is not a preference here, it is where they are
_(PRD §2.1, §8.1)_.

The audience skews **30–60, and often reads without reading glasses** — stated
by the product owner when the type scale was set, and already encoded there:
mobile body copy has a hard floor of 15px.

Two other audiences share the same system through separate portals: travel
agency staff (B2B, desktop-leaning, all day in the tool) and platform admins
_(PRD §2)_.

---

## Character _(direction call)_

**Modern and efficient.** Trust is expressed through competence, not warmth or
ornament. The product moves quickly, shows its work, and gets out of the way.

The obvious risk of this choice is sounding like a flight-booking site and losing
the weight of what the journey actually is. The answer is **not** to add
religious decoration — no gold gradients, no stacked Kaabah photography, no
ornamental borders. The weight is carried by _restraint and precision_: correct
Arabic typography, prices that never wobble, states that are always honest,
nothing that overpromises. Respect looks like care, not like decoration.

### Tone _(direction call)_

**Terse and confident.** Assume the pilgrim is capable. Say a thing once, clearly,
and do not repeat it. Help is available but never pushed.

> **The one tension to watch.** A terse tone plus a first-time buyer plus
> RM 12,500 is where people abandon. The fix is _progressive disclosure_, not
> more copy: keep the default surface calm and short, and put reassurance one tap
> away — an expandable breakdown, a "what happens next" link, a visible support
> route. If a booking step ever needs a wall of explanatory text to feel safe,
> the step itself is wrong.

### What we are not

- Not warm and hand-holding. We do not narrate every step.
- Not premium or institutional. Nothing that reads as exclusive or expensive.
- Not austere. Calm is not the goal; controlled energy is.

---

## What must be different _(direction call)_

**Craft quality.** Put UmrahHaji beside any other Umrah agency site and the
difference a visitor should feel — before reading a word — is that this one was
_designed_, not assembled from a template.

That is a demanding differentiator, because it cannot be faked with a hero image.
It shows up in the boring places:

- Rhythm holds from the first section to the last.
- Spacing is on the scale, every time.
- Price columns line up. Digits do not shift width between rows.
- Empty, loading and error states exist and are designed, not afterthoughts.
- Arabic sits correctly next to Malay — right size, right line height, right direction.
- Focus rings are visible and deliberate.

If a screen would embarrass us at 2× zoom on a mid-range Android, it is not done.

---

## Levers

- **One focal point per screen.** Exactly one element is clearly the most
  important; everything else defers to it. On a package card that is the price.
  On the booking flow it is the next action.
- **One accent, used sparingly.** **Teal is structural** — brand, links,
  primary actions. **Orange is the accent** — reserved for the single most
  important moment on a surface. Orange everywhere is slop; orange nowhere is
  sterile. Note the hard constraint: never a white label on orange-500 (2.82:1).
- **Whitespace as structure.** Empty space separates and sets rhythm. It is
  never leftover.
- **Hierarchical contrast on purpose.** Size, weight and colour differ because
  something is more important, never for variety.
- **Identity motif.** _Not yet decided._ One repeated gesture or typographic
  voice that makes a screen unmistakably UmrahHaji. This is the biggest open gap
  in this document — see below.

---

## Inherited constraints _(PRD)_

These are not negotiable and are already documented in the PRD:

- **Five principles** _(§8.1)_: mobile-first, consistent, accessible,
  performant, trustworthy.
- **One system across three portals** _(§2.2)_: same components, same
  typography, same tokens. Navigation differs by portal; nothing else does.
- **Breakpoints** _(§8.2)_: mobile 320–767, tablet 768–1023, desktop 1024+.
- **Every list page** _(§8.3)_: search, filter, pagination, empty state, error
  state. All five.
- **Destructive actions** _(§8.3)_: confirmation modal; prefer archive over
  delete.
- **Accessibility** _(§15.2)_: keyboard reachable, labelled icons and fields,
  accordion state announced, colour never the only signal, comfortable touch
  targets, reduced motion respected.
- **Error messages** _(§8.3.9)_: explain the issue _and_ the next action.

## Already settled by the system

Do not re-decide these; they are built and verified in `packages/tokens`:

- Colour, including 154 verified WCAG contrast contracts across light and dark.
- Typography: Plus Jakarta Sans _(PRD §2.2)_ and Noto Naskh Arabic, self-hosted.
- Spacing, radius, elevation (shadow ladder in light, surface ladder in dark), z-index, opacity, blur, and motion - durations, easings, and the enter/exit/state/overlay pairings, all collapsing to zero under reduced motion.
- Tabular figures for every price.

---

## Open

1. **Identity motif** — the one repeatable gesture that makes this ours. Without
   it, "craft quality" has no signature. Needs a decision before component work
   gets far.
2. **Photography and illustration** — whether we use imagery at all, and if so
   what disqualifies a photo. Untouched so far, and the fastest way to undo
   everything above.
3. **Dark mode scope** — the tokens support it fully; the PRD never mentions it.
   Decide whether it ships in Phase 1 or waits.
