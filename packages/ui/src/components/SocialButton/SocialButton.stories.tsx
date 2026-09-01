import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { SocialButton, type SocialProvider } from './SocialButton.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={surface}>
      {children}
    </div>
  );
}

const stack: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--uh-spacing-12)',
  maxWidth: '320px',
};

const meta = {
  title: 'Components/SocialButton',
  component: SocialButton,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A branded auth/share trigger - "Continue with Google", "Sign in with GitHub" - ' +
          'and nothing else: this component only renders the button, it does not handle ' +
          'authentication logic. It is `Button` itself underneath (`variant="outline"`, a ' +
          "provider's icon as `leftIcon`), so the disabled treatment, the focus ring, and " +
          "the loading swap are all Button's own, not a second copy of that logic.",
      },
    },
  },
  args: { provider: 'google' },
} satisfies Meta<typeof SocialButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const PROVIDERS: SocialProvider[] = [
  'google',
  'apple',
  'facebook',
  'github',
  'x',
  'twitter',
  'linkedin',
  'discord',
  'whatsapp',
];

export const Providers: Story = {
  render: () => (
    <Page>
      <div style={stack}>
        {PROVIDERS.map((provider) => (
          <SocialButton key={provider} provider={provider} />
        ))}
      </div>
    </Page>
  ),
};

export const Matrix: Story = {
  render: () => (
    <Page>
      <div style={stack}>
        <SocialButton provider="google" />
        <SocialButton provider="github">Sign in with GitHub</SocialButton>
        <SocialButton provider="apple" loading loadingLabel="Signing in" />
        <SocialButton provider="x" disabled />
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <div style={stack}>
        <SocialButton provider="google" />
        <SocialButton provider="github" />
        <SocialButton provider="apple" disabled />
      </div>
    </Page>
  ),
};

const COPY = [
  { lang: 'en', label: 'Continue with Google' },
  { lang: 'ms', label: 'Teruskan dengan Google' },
  { lang: 'id', label: 'Lanjutkan dengan Google' },
] as const;

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '"Lanjutkan dengan Google" runs about the same length as the English label here, ' +
          "but the button's own full width already absorbs the difference either way - only " +
          'a much longer custom label would ever wrap.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={stack}>
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang}>
            <SocialButton provider="google">{entry.label}</SocialButton>
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Small, individually copy-pasteable examples for SocialButton.mdx's
 * "Contoh Penggunaan" section - args-only stories so the Docs Source panel
 * reconstructs clean `<SocialButton ... />` JSX.
 */

export const ContinueWithGoogle: Story = {
  parameters: { layout: 'centered' },
  args: { provider: 'google' },
};

export const SignInWithGitHub: Story = {
  parameters: { layout: 'centered' },
  args: { provider: 'github', children: 'Sign in with GitHub' },
};
