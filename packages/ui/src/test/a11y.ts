import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Runs axe against a rendered container and fails with a readable list of
 * violations.
 *
 * Scope note: jsdom has no layout engine and the component stylesheet is
 * compiled separately, so `color-contrast` cannot be evaluated here and axe
 * disables it automatically. Contrast is covered two other ways: the token
 * layer verifies 108 pairings against the built CSS, and Storybook's
 * addon-a11y runs axe in a real browser with the stylesheet loaded.
 */
export async function expectNoA11yViolations(container: HTMLElement): Promise<void> {
  const results = await axe.run(container, {
    resultTypes: ['violations'],
    rules: {
      // Needs a full page; a detached component container has no landmarks.
      region: { enabled: false },
      // jsdom has no layout engine and no canvas, so axe cannot sample pixels.
      // Turned off explicitly rather than left to fail noisily - contrast is
      // covered by the token layer and by addon-a11y in a real browser.
      'color-contrast': { enabled: false },
    },
  });

  const summary = results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact ?? 'unknown'}): ${violation.help}\n` +
      violation.nodes.map((node) => `    ${node.html}`).join('\n'),
  );

  expect(summary, `axe found ${summary.length} violation(s)`).toEqual([]);
}
