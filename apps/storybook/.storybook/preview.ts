import type { Preview } from '@storybook/react';

import './preview.css';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          'Introduction',
          'Getting Started',
          'Foundations',
          [
            'Principles',
            'Token Architecture',
            'Colors',
            'Typography',
            'Spacing',
            'Sizing & Touch Targets',
            'Layout & Breakpoints',
            'Shape & Borders',
            'Elevation',
            'Layering',
            'Iconography',
            'Imagery',
            'Motion',
            'Interaction States',
            'Accessibility',
            'Content & Localization',
            'RTL & Bidirectional',
            'Font Comparison',
          ],
          'Components',
          'Patterns',
          'Contributing',
          'Troubleshooting',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // axe-core runs on every story; tighten these options per component
      // as the library grows.
      config: {},
      options: {},
      manual: false,
    },
  },
};

export default preview;
