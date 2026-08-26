import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { checkA11y, injectAxe, configureAxe } from 'axe-playwright';

/**
 * Runs axe against every story in a real browser.
 *
 * This is the half the unit tests cannot do. jsdom has no layout engine, so
 * `color-contrast` is disabled there and the token layer has to vouch for it.
 * Here the stylesheet is loaded and the pixels are real, so contrast is
 * actually measured.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },

  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);

    // Honour a per-story opt-out, the same parameter the a11y addon reads.
    if (storyContext.parameters['a11y']?.disable) return;

    await configureAxe(page, {
      rules: storyContext.parameters['a11y']?.config?.rules ?? [],
    });

    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  },
};

export default config;
