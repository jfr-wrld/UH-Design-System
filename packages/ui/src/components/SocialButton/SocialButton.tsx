import { forwardRef, type ButtonHTMLAttributes, type ForwardedRef, type ReactNode } from 'react';

import { Button, type ButtonSize } from '../Button/Button.js';
import { PROVIDER_ICON, PROVIDER_LABEL } from './icons.js';

export type SocialProvider =
  | 'google'
  | 'facebook'
  | 'apple'
  | 'github'
  | 'x'
  | 'twitter'
  | 'linkedin'
  | 'discord'
  | 'whatsapp';

export interface SocialButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'disabled'
> {
  provider: SocialProvider;
  size?: ButtonSize | undefined;
  /** Matches the reference layout: a sign-in stack of full-width buttons.
      @default true */
  fullWidth?: boolean | undefined;
  loading?: boolean | undefined;
  loadingLabel?: string | undefined;
  disabled?: boolean | undefined;
  /** Overrides the default "Continue with {Provider}" - pass a different
      verb ("Sign in with Google") or fully custom copy. */
  children?: ReactNode | undefined;
}

/**
 * A branded auth/share trigger - "Continue with Google", "Sign in with
 * GitHub" - and nothing else: this component only renders the button,
 * exactly like the reference it follows ("does not handle authentication
 * logic"). It is `Button` itself underneath (`variant="outline"`, a
 * provider's icon as `leftIcon`), not a parallel implementation, so
 * anything true of Button - the disabled treatment, the focus ring, the
 * loading swap - is true here without a second copy of that logic. See
 * `icons.tsx` for which two providers (`github`, `x`) are hand-drawn rather
 * than pulled from the icon pack, and why.
 */
function SocialButtonImpl(props: SocialButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  const {
    provider,
    size = 'md',
    fullWidth = true,
    loading = false,
    loadingLabel,
    disabled = false,
    children,
    ...rest
  } = props;

  const Icon = PROVIDER_ICON[provider];

  return (
    <Button
      {...rest}
      // Button's own ref type covers its `as="a"` branch too; SocialButton
      // never renders that branch, so this narrows back down safely.
      ref={ref as ForwardedRef<HTMLButtonElement & HTMLAnchorElement>}
      variant="outline"
      size={size}
      fullWidth={fullWidth}
      leftIcon={<Icon disabled={disabled} />}
      loading={loading}
      {...(loadingLabel !== undefined ? { loadingLabel } : {})}
      disabled={disabled}
    >
      {children ?? `Continue with ${PROVIDER_LABEL[provider]}`}
    </Button>
  );
}

export const SocialButton = /* @__PURE__ */ forwardRef(SocialButtonImpl);

if (process.env.NODE_ENV !== 'production') {
  SocialButton.displayName = 'SocialButton';
}
