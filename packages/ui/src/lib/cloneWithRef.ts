import { cloneElement, type ReactElement, type Ref } from 'react';

import { mergeRefs } from './mergeRefs.js';

/*
 * The rule forbids touching refs during render, and it is right to. Nothing is
 * touched here: the child's ref is read as a prop and folded into a callback
 * that React invokes after commit; every write happens inside it.
 *
 * Merging rather than replacing is not optional. cloneElement overwrites the
 * child's ref, so without this `<Popover trigger={<Button ref={mine} />}>`
 * would silently stop populating the caller's ref. Callers carry a one-line lint exception
 * pointing here, because the rule fires where a ref crosses a function
 * boundary during render - which is precisely the safe thing this does.
 */
export function cloneWithMergedRef<T extends HTMLElement>(
  element: ReactElement<Record<string, unknown>>,
  ownRef: Ref<T>,
  props: Record<string, unknown>,
): ReactElement {
  const childRef = element.props['ref'] as Ref<T> | undefined;
  return cloneElement(element, { ...props, ref: mergeRefs<T>(ownRef, childRef) });
}
