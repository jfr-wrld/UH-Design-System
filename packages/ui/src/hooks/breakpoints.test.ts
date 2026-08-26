import { describe, expect, it } from 'vitest';

import tokens from '@umrahhaji/tokens/json';
import { DESKTOP_BREAKPOINT, MOBILE_QUERY, TABLET_BREAKPOINT } from './breakpoints.js';

/* The constants are retyped from the token layer, so something has to notice
   when a token moves and the constant does not. */
describe('breakpoints', () => {
  const { breakpoint } = (tokens as { primitive: { breakpoint: Record<string, string> } })
    .primitive;

  it('matches primitive.breakpoint.tablet', () => {
    expect(breakpoint.tablet).toBe(`${TABLET_BREAKPOINT}px`);
  });

  it('matches primitive.breakpoint.desktop', () => {
    expect(breakpoint.desktop).toBe(`${DESKTOP_BREAKPOINT}px`);
  });

  it('stops the mobile query one pixel below the tablet breakpoint', () => {
    expect(MOBILE_QUERY).toBe('(max-width: 767px)');
  });
});
