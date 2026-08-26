import type { Preview } from '@storybook/react';

import './preview.css';

const preview: Preview = {
  parameters: {
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
