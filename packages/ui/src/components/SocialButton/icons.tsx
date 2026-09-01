import type { CSSProperties, ReactElement } from 'react';
import { Facebook, AppleBrandIcon, Linkedin, Discord, Whatsapp, Twitter } from '@tailgrids/icons';

import type { SocialProvider } from './SocialButton.js';

/*
 * The one file in this package allowed to hold a literal hex colour (see
 * the matching exemption in the repo's own lint-ds.mjs) - every colour
 * below is a real brand's own fixed, external identity, not a design
 * choice this system's palette could ever stand in for. Everywhere else,
 * a hex literal is a bug; here, using a token instead would be the bug -
 * Facebook's blue does not become "brand-500" just because a future
 * palette pass changes what teal-600 means.
 */

/**
 * `github` and `x` stay hand-drawn: neither mark exists in @tailgrids/icons
 * (a small, ~245-icon generic set), and a brand mark is exactly the kind of
 * glyph a near-match would misrepresent rather than honestly stand in for -
 * same reasoning as the prayer-room glyph elsewhere in this package. Both
 * paths below are each brand's own standard simple mark (GitHub's Octicon
 * "mark-github", X's 2023 wordmark), the same shape essentially every
 * "Continue with X" / "Sign in with GitHub" button on the web reproduces.
 */
export interface ProviderIconProps {
  /** Button's own `disabled` colour works by inheriting `currentColor` -
      every icon here must give up its fixed brand colour while disabled so
      it dims along with the label and border, instead of looking still
      "active" (see `brandStyle` and `GoogleIcon` below for how each kind of
      fixed fill falls back to it). */
  disabled?: boolean;
}

function GitHubIcon(): ReactElement {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function XIcon(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/**
 * Google's own mark is officially four colours, not one - no single
 * `currentColor` fill could ever stand in for it, so unlike the other six
 * providers below it is fully hand-drawn too rather than sourced from
 * @tailgrids/icons (whose own `Google` export is a single-colour "G"
 * outline, not the real mark). This is the same four-path "G" logo Google's
 * own Sign-In branding guidelines ship and virtually every OAuth button on
 * the web reproduces.
 */
function GoogleIcon({ disabled }: ProviderIconProps): ReactElement {
  /*
   * Disabled falls back to a flat `currentColor` for all four paths rather
   * than keeping the brand colours - the four segments still trace the
   * recognisable G shape (they are adjacent regions, not stacked ones), just
   * in one flat colour, the same "still legible, no longer looks live" cue
   * every other disabled icon in this file gets from inheriting Button's
   * disabled colour directly.
   */
  const fill = disabled ? 'currentColor' : undefined;
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path
        fill={fill ?? '#4285F4'}
        d="M17.64 9.2045c0-.6386-.0573-1.2518-.1636-1.8409H9v3.4841h4.8436c-.2086 1.125-.8427 2.0782-1.7973 2.7164v2.2582h2.9086c1.7018-1.5668 2.6827-3.8741 2.6827-6.6178z"
      />
      <path
        fill={fill ?? '#34A853'}
        d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1818l-2.9086-2.2582c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5832-5.0364-3.7105H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
      />
      <path
        fill={fill ?? '#FBBC05'}
        d="M3.9636 10.71c-.18-.54-.2818-1.1168-.2818-1.71s.1023-1.17.2818-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.9636 10.71z"
      />
      <path
        fill={fill ?? '#EA4335'}
        d="M9 3.5795c1.3214 0 2.5068.4541 3.4405 1.3459l2.5818-2.5818C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.9636 7.29C4.6718 5.1632 6.6559 3.5795 9 3.5795z"
      />
    </svg>
  );
}

/**
 * Google's mark is redrawn in its own four brand colours (above, not this
 * fixed-fill technique). For the six single-colour marks below, the same
 * `<path fill="currentColor">` @tailgrids/icons ships gets a fixed `color`
 * on the outer `<svg>` instead - it cascades to the path exactly the way a
 * page's own text colour would - since these are real, external brand
 * identifiers rather than anything this design system owns a token for.
 * `apple`, `github`, and `x` are deliberately absent here: all three
 * brands' own guidelines specify a black-or-white mark that follows
 * whatever it sits on, not a fixed colour, so they stay on `currentColor`
 * (the button's own text colour, already correct in both themes) instead
 * of being forced into one.
 */
const BRAND_COLOR: Partial<Record<SocialProvider, string>> = {
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  discord: '#5865F2',
  whatsapp: '#25D366',
};

/*
 * `disabled` drops the inline `style` override entirely rather than just
 * picking a dimmer colour - an inline `style` sets an explicit specified
 * value on the SVG itself, which blocks CSS inheritance no matter how
 * specific an ancestor rule is. Only omitting it lets these six icons pick
 * up Button's own disabled `color` through `currentColor`, the same way
 * `apple`/`github`/`x` already do unconditionally.
 */
function brandStyle(provider: SocialProvider, disabled?: boolean): CSSProperties | undefined {
  if (disabled) return undefined;
  const color = BRAND_COLOR[provider];
  return color ? { color } : undefined;
}

export const PROVIDER_ICON: Record<SocialProvider, (props: ProviderIconProps) => ReactElement> = {
  google: GoogleIcon,
  facebook: ({ disabled }) => (
    <Facebook style={brandStyle('facebook', disabled)} aria-hidden="true" focusable="false" />
  ),
  apple: () => <AppleBrandIcon aria-hidden="true" focusable="false" />,
  linkedin: ({ disabled }) => (
    <Linkedin style={brandStyle('linkedin', disabled)} aria-hidden="true" focusable="false" />
  ),
  discord: ({ disabled }) => (
    <Discord style={brandStyle('discord', disabled)} aria-hidden="true" focusable="false" />
  ),
  whatsapp: ({ disabled }) => (
    <Whatsapp style={brandStyle('whatsapp', disabled)} aria-hidden="true" focusable="false" />
  ),
  twitter: ({ disabled }) => (
    <Twitter style={brandStyle('twitter', disabled)} aria-hidden="true" focusable="false" />
  ),
  github: GitHubIcon,
  x: XIcon,
};

export const PROVIDER_LABEL: Record<SocialProvider, string> = {
  google: 'Google',
  facebook: 'Facebook',
  apple: 'Apple',
  linkedin: 'LinkedIn',
  discord: 'Discord',
  whatsapp: 'WhatsApp',
  twitter: 'Twitter',
  github: 'GitHub',
  x: 'X',
};
