export type AnnouncePriority = 'polite' | 'assertive';

let politeRegion: HTMLElement | null = null;
let assertiveRegion: HTMLElement | null = null;

function createRegion(priority: AnnouncePriority): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('aria-live', priority);
  el.setAttribute('aria-atomic', 'true');
  el.className = 'uh-sr-only';
  document.body.appendChild(el);
  return el;
}

function regionFor(priority: AnnouncePriority): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  if (priority === 'assertive') return (assertiveRegion ??= createRegion('assertive'));
  return (politeRegion ??= createRegion('polite'));
}

/**
 * Speaks `message` to screen readers through a shared, module-level live
 * region - not a rendered React node, because the region has to outlive
 * whatever component triggered the announcement (a toast that has already
 * exited, a search result list mid-unmount).
 *
 * The one live region Phase 5.6 needed and never had: Toast is the first
 * consumer, but anything that needs to say something without a dialog to
 * say it in - "12 packages found", "Copied" - calls this instead of
 * growing its own hidden aria-live div.
 *
 * The visible content announcing itself (a toast's own text, wrapped in
 * role="status") was considered and rejected: role insertion is announced
 * inconsistently across screen readers, particularly Safari + VoiceOver,
 * while a live region that already existed before the text changed is
 * reliable everywhere. Clearing before setting - on a delay, not the same
 * tick - covers screen readers that ignore a live region whose text did not
 * change from empty straight to full in one paint, and covers identical
 * consecutive messages ("3 results" following "3 results") which some
 * screen readers otherwise treat as nothing having happened.
 */
export function announce(message: string, priority: AnnouncePriority = 'polite'): void {
  const region = regionFor(priority);
  if (!region || !message) return;
  region.textContent = '';
  window.setTimeout(() => {
    region.textContent = message;
  }, 50);
}

/** Test-only: drops the module-level regions so each test starts clean. */
export function resetAnnouncer(): void {
  politeRegion?.remove();
  assertiveRegion?.remove();
  politeRegion = null;
  assertiveRegion = null;
}
