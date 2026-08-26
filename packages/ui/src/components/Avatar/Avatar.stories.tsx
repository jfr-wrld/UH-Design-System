import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Avatar, AvatarGroup, type AvatarSize } from './Avatar.js';
/*
 * An asset, not an inline data URI: the swatch's colours belong in the image
 * file, not in a story, and this keeps the source free of literal hex.
 */
import SWATCH from './fixtures/swatch.svg';

const SIZES: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

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

function Caption({ children }: { children: ReactNode }) {
  return (
    <div className="uh-type-web-overline" style={{ color: 'var(--uh-color-text-tertiary)' }}>
      {children}
    </div>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--uh-spacing-12)',
        marginTop: 'var(--uh-spacing-8)',
      }}
    >
      {children}
    </div>
  );
}

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Three fallbacks in order: image, initials, generic icon. The ground is neutral ' +
          'rather than a colour hashed from the name — a hashed palette generates pairs ' +
          'nobody has checked, and initials need 4.5:1 like any other text.',
      },
    },
  },
  args: { name: 'Ahmad bin Abdullah' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  render: () => (
    <Page>
      <Caption>With image</Caption>
      <Row>
        {SIZES.map((size) => (
          <Avatar key={size} size={size} src={SWATCH} alt="Ahmad bin Abdullah" />
        ))}
      </Row>
      <Caption>Initials</Caption>
      <Row>
        {SIZES.map((size) => (
          <Avatar key={size} size={size} name="Ahmad bin Abdullah" />
        ))}
      </Row>
      <Caption>Square</Caption>
      <Row>
        {SIZES.map((size) => (
          <Avatar key={size} size={size} name="Siti Nurhaliza" shape="square" />
        ))}
      </Row>
    </Page>
  ),
};

/** The chain, left to right, as each source drops away. */
export const FallbackChain: Story = {
  render: () => (
    <Page>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(13rem, 1fr))',
          gap: 'var(--uh-spacing-24)',
        }}
      >
        <div>
          <Caption>1. Image loads</Caption>
          <Row>
            <Avatar size="lg" src={SWATCH} alt="Ahmad bin Abdullah" />
          </Row>
        </div>
        <div>
          <Caption>2. Image fails, name remains</Caption>
          <Row>
            <Avatar size="lg" src="/does-not-exist.jpg" name="Ahmad bin Abdullah" />
          </Row>
        </div>
        <div>
          <Caption>3. No image, no name</Caption>
          <Row>
            <Avatar size="lg" />
          </Row>
        </div>
      </div>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginTop: 'var(--uh-spacing-16)' }}
      >
        Initials take the first and last word, so &ldquo;Ahmad bin Abdullah&rdquo; gives AA, not AB.
        The patronymic in the middle is the least identifying part of the name.
      </p>
    </Page>
  ),
};

export const Group: Story = {
  render: () => (
    <Page>
      <Caption>Under the limit</Caption>
      <Row>
        <AvatarGroup max={4}>
          <Avatar name="Ahmad bin Abdullah" />
          <Avatar name="Siti Nurhaliza" />
          <Avatar src={SWATCH} alt="Farid Rahman" />
        </AvatarGroup>
      </Row>

      <Caption>Over the limit, with counter</Caption>
      <Row>
        <AvatarGroup max={4}>
          <Avatar name="Ahmad bin Abdullah" />
          <Avatar name="Siti Nurhaliza" />
          <Avatar src={SWATCH} alt="Farid Rahman" />
          <Avatar name="Nurul Aina" />
          <Avatar name="Zulkifli Hassan" />
          <Avatar name="Aminah Yusof" />
          <Avatar name="Rashid Omar" />
        </AvatarGroup>
      </Row>

      <Caption>Small, for a trip roster row</Caption>
      <Row>
        <AvatarGroup max={5} size="sm">
          {Array.from({ length: 12 }, (_, i) => (
            <Avatar key={i} size="sm" name={`Jemaah ${i + 1}`} />
          ))}
        </AvatarGroup>
        <span className="uh-type-web-body-s" style={{ color: 'var(--uh-color-text-secondary)' }}>
          12 pilgrims on this departure
        </span>
      </Row>
    </Page>
  ),
};

export const DarkMode: Story = {
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <Caption>Sizes</Caption>
      <Row>
        {SIZES.map((size) => (
          <Avatar key={size} size={size} name="Ahmad bin Abdullah" />
        ))}
      </Row>
      <Caption>Group</Caption>
      <Row>
        <AvatarGroup max={3}>
          <Avatar name="Ahmad bin Abdullah" />
          <Avatar src={SWATCH} alt="Siti Nurhaliza" />
          <Avatar name="Farid Rahman" />
          <Avatar name="Nurul Aina" />
          <Avatar name="Zulkifli Hassan" />
        </AvatarGroup>
      </Row>
    </Page>
  ),
};

/* -------------------------------------------------------- text expansion */

const LOCALES = [
  {
    code: 'en',
    label: 'English',
    name: 'Ahmad Abdullah',
    role: 'Group leader',
    overflow: (n: number) => `${n} more`,
  },
  {
    code: 'ms',
    label: 'Bahasa Melayu',
    name: 'Siti Nurhaliza binti Tarudin',
    role: 'Ketua rombongan',
    overflow: (n: number) => `${n} lagi`,
  },
  {
    code: 'id',
    label: 'Bahasa Indonesia',
    name: 'Bambang Wijaya Kusuma',
    role: 'Pemimpin rombongan',
    overflow: (n: number) => `${n} lainnya`,
  },
] as const;

/**
 * The avatar itself never changes size, so expansion lands entirely on the name
 * beside it and on the group's overflow label. Malay names in particular run
 * long: "Siti Nurhaliza binti Tarudin" is four parts, and the initials still
 * have to come out as ST rather than SN.
 */
export const TextExpansion: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-24)', flexWrap: 'wrap' }}>
        {LOCALES.map((locale) => (
          <div key={locale.code} lang={locale.code} style={{ width: '280px' }}>
            <Caption>
              {locale.label} · {locale.code}
            </Caption>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--uh-spacing-12)',
                marginTop: 'var(--uh-spacing-8)',
                padding: 'var(--uh-spacing-12)',
                border: 'var(--uh-border-width-1) dashed var(--uh-color-border-default)',
                borderRadius: 'var(--uh-radius-md)',
              }}
            >
              <Avatar name={locale.name} />
              <span style={{ minWidth: 0 }}>
                <span className="uh-type-web-label uh-clamp-1" style={{ display: 'block' }}>
                  {locale.name}
                </span>
                <span
                  className="uh-type-web-body-s"
                  style={{ color: 'var(--uh-color-text-secondary)' }}
                >
                  {locale.role}
                </span>
              </span>
            </div>

            <div style={{ marginTop: 'var(--uh-spacing-12)' }}>
              <AvatarGroup max={3} overflowLabel={locale.overflow}>
                <Avatar name={locale.name} />
                <Avatar src={SWATCH} alt={locale.name} />
                <Avatar name="Farid Rahman" />
                <Avatar name="Nurul Aina" />
                <Avatar name="Zulkifli Hassan" />
              </AvatarGroup>
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};
