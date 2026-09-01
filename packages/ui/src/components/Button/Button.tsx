import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { Spinner } from '../Spinner/Spinner.js';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  /**
   * Swaps the label for a spinner without changing the button's width, so a
   * form does not reflow the moment it is submitted.
   */
  loading?: boolean;
  /** Announced while `loading`; the spinner itself carries no text. */
  loadingLabel?: string;
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * An icon-only button has no text to name it, so `aria-label` is required by
 * the type rather than merely encouraged.
 */
type IconOnlyProps = { iconOnly: true; 'aria-label': string } | { iconOnly?: false | undefined };

type AsButtonProps = { as?: 'button' | undefined } & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled' | 'aria-disabled' | keyof ButtonBaseProps
>;

type AsAnchorProps = { as: 'a' } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'aria-disabled' | keyof ButtonBaseProps
>;

export type ButtonProps = ButtonBaseProps & IconOnlyProps & (AsButtonProps | AsAnchorProps);

function ButtonImpl(props: ButtonProps, ref: ForwardedRef<HTMLButtonElement & HTMLAnchorElement>) {
  const {
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    fullWidth = false,
    loading = false,
    loadingLabel = 'Loading',
    disabled = false,
    iconOnly = false,
    className,
    children,
    onClick,
    as = 'button',
    ...rest
  } = props as ButtonBaseProps & {
    iconOnly?: boolean;
    as?: 'button' | 'a';
    className?: string;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
  };

  const inactive = disabled || loading;

  /*
   * `aria-disabled` rather than the `disabled` attribute, so the control keeps
   * its place in the tab order and can still be found and read. That means the
   * browser will happily fire click and keyboard activation, so blocking it is
   * this component's job.
   */
  function handleClick(event: MouseEvent<HTMLElement>) {
    if (inactive) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
  }

  const shared = {
    className: ['uh-btn', className].filter(Boolean).join(' '),
    'data-variant': variant,
    'data-size': size,
    'data-icon-only': iconOnly ? 'true' : undefined,
    'data-full-width': fullWidth ? 'true' : undefined,
    'data-loading': loading ? 'true' : undefined,
    'aria-disabled': inactive ? true : undefined,
    'aria-busy': loading ? true : undefined,
    onClick: handleClick,
  } as const;

  const content = (
    <>
      <span className="uh-btn__content">
        {leftIcon ? (
          <span className="uh-btn__icon" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}
        {iconOnly ? (
          <span className="uh-btn__icon" aria-hidden="true">
            {children}
          </span>
        ) : (
          children
        )}
        {rightIcon ? (
          <span className="uh-btn__icon" aria-hidden="true">
            {rightIcon}
          </span>
        ) : null}
      </span>
      {loading ? (
        <span className="uh-btn__spinner">
          {/* Decorative: the button already carries aria-busy, and the label
              below is what gets announced. */}
          <Spinner decorative size="sm" />
          <span className="uh-sr-only">{loadingLabel}</span>
        </span>
      ) : null}
    </>
  );

  if (as === 'a') {
    /*
     * The href is kept even when inactive: dropping it would take the anchor
     * out of the tab order, which is the behaviour aria-disabled exists to
     * avoid. Navigation is blocked in handleClick instead.
     */
    return (
      <a ref={ref} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} {...shared}>
        {content}
      </a>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button ref={ref} type={buttonRest.type ?? 'button'} {...buttonRest} {...shared}>
      {content}
    </button>
  );
}

export const Button = /* @__PURE__ */ forwardRef(ButtonImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  Button.displayName = 'Button';
}
