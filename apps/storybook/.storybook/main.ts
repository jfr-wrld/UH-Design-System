import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|tsx)',
    // Relative to this directory (.storybook), not to the app root - which is
    // why reaching packages/ui takes three levels, not two.
    '../../../packages/ui/src/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    // Lets the state matrix render real :hover / :focus-visible / :active,
    // instead of faking them with demo-only classes in the component CSS.
    'storybook-addon-pseudo-states',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(viteConfig) {
    const { default: tailwindcss } = await import('@tailwindcss/vite');
    const { mergeConfig } = await import('vite');

    return mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
    });
  },
};

export default config;
