/**
 * Mirrors `primitive.breakpoint` from @umrahhaji/tokens.
 *
 * Retyped here rather than imported because importing the token JSON would
 * pull the whole token file into the bundle for the sake of two numbers.
 * `breakpoints.test.ts` reads the JSON and fails if these drift.
 */
export const TABLET_BREAKPOINT = 768;
export const DESKTOP_BREAKPOINT = 1024;

/**
 * Phones. The pickers use this to choose markup, not styling: a bottom sheet
 * is a modal dialog with a backdrop and a popover is not, and no amount of
 * restyling turns one into the other.
 */
export const MOBILE_QUERY = `(max-width: ${TABLET_BREAKPOINT - 1}px)`;
