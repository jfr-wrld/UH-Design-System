import { internalPath, toCssSegment } from './layers.mjs';

/**
 * Internal name transform. It keeps the mode segment (`uh-light-color-text-primary`)
 * so Style Dictionary sees every token as unique; the formats strip the mode
 * back off when they write the file, because light and dark must land on the
 * same custom property for a theme switch to be a plain cascade.
 */
export const nameTransform = {
  name: 'name/uh',
  type: 'name',
  transform: (token, config) =>
    [config.prefix, ...internalPath(token)].filter(Boolean).map(toCssSegment).join('-'),
};

export const transforms = [nameTransform];
