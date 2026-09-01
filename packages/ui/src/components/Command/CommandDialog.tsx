import { useEffect, type ReactNode } from 'react';

import { Overlay } from '../Overlay/Overlay.js';
import { useControllableState } from '../../hooks/useControllableState.js';

/** Whether the global shortcut would be stealing the keystroke from a real
    text field elsewhere on the host page (a rich-text editor's own Ctrl+K,
    say) rather than actually opening the palette. */
function isEditableElement(el: Element | null): boolean {
  if (!el) return false;
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return true;
  return (el as HTMLElement).isContentEditable === true;
}

export interface CommandDialogProps {
  /** A `<Command>` tree. */
  children?: ReactNode | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Accessible name of the dialog. */
  label?: string | undefined;
  /**
   * The letter that opens/closes the palette globally alongside Cmd
   * (macOS) or Ctrl (everywhere else) - `k`, matching the convention VS
   * Code, Linear, Slack, and GitHub all already share, rather than the
   * reference's own `⌘J`.
   * @default 'k'
   */
  shortcutKey?: string | undefined;
  className?: string | undefined;
}

/**
 * `Command` wrapped in `Overlay`, with a global Cmd/Ctrl+K listener toggling
 * it - the standard command-palette shell. `Overlay` already supplies the
 * backdrop, focus trap, scroll lock, and Escape handling; this only adds
 * the global shortcut and hands its `children` (a `Command` tree) straight
 * through.
 */
export function CommandDialog(props: CommandDialogProps) {
  const {
    children,
    open,
    defaultOpen = false,
    onOpenChange,
    label = 'Command menu',
    shortcutKey = 'k',
    className,
  } = props;

  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== shortcutKey.toLowerCase()) return;
      if (!(event.metaKey || event.ctrlKey)) return;
      // Shift/Alt held means this is a *different* combo the browser or
      // host page already owns (Ctrl+Shift+K for DevTools' console, say) -
      // matching only the bare modifier keeps this from hijacking those.
      if (event.shiftKey || event.altKey) return;
      /*
       * While closed, don't steal the shortcut from an unrelated text field
       * elsewhere on the page. While open, `Overlay` traps focus inside the
       * palette itself, so anything focused then is the palette's own
       * input - that case must stay allowed through, or the shortcut could
       * never close the palette back.
       */
      if (!isOpen && isEditableElement(document.activeElement)) return;
      event.preventDefault();
      setIsOpen(!isOpen);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // Re-subscribes on every toggle so the closure never reads a stale
    // `isOpen` - `useControllableState`'s setter takes a value, not a
    // functional updater, so this is the correct way to keep it fresh
    // rather than a bug to memoize away.
  }, [shortcutKey, isOpen, setIsOpen]);

  return (
    <Overlay
      open={isOpen}
      onClose={() => setIsOpen(false)}
      aria-label={label}
      className={['uh-command-dialog', className].filter(Boolean).join(' ')}
    >
      {children}
    </Overlay>
  );
}

if (process.env.NODE_ENV !== 'production') {
  CommandDialog.displayName = 'CommandDialog';
}
