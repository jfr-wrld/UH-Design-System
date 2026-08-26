// Public entry point of @umrahhaji/ui.
// Styles are shipped separately as @umrahhaji/ui/styles.css.
export { Button } from './components/Button/index.js';
export type { ButtonProps, ButtonSize, ButtonVariant } from './components/Button/index.js';

export { Input } from './components/Input/index.js';
export type { InputProps, InputSize, InputType } from './components/Input/index.js';

export { PhoneInput, DEFAULT_COUNTRIES } from './components/PhoneInput/index.js';
export type { PhoneInputProps, Country, FlagComponent } from './components/PhoneInput/index.js';

export { Select } from './components/Select/index.js';
export type { SelectProps, SelectOption } from './components/Select/index.js';

export { Checkbox } from './components/Checkbox/index.js';
export type { CheckboxProps } from './components/Checkbox/index.js';

export { Radio, RadioGroup } from './components/Radio/index.js';
export type { RadioProps, RadioGroupProps, RadioOrientation } from './components/Radio/index.js';

export { Switch } from './components/Switch/index.js';
export type { SwitchProps, SwitchSize } from './components/Switch/index.js';

export { Badge } from './components/Badge/index.js';
export type { BadgeProps, BadgeSize, BadgeStatus, BadgeVariant } from './components/Badge/index.js';

export { Avatar, AvatarGroup } from './components/Avatar/index.js';
export type {
  AvatarProps,
  AvatarGroupProps,
  AvatarShape,
  AvatarSize,
} from './components/Avatar/index.js';

export { Spinner } from './components/Spinner/index.js';
export type { SpinnerProps, SpinnerColor, SpinnerSize } from './components/Spinner/index.js';

export {
  Skeleton,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
} from './components/Skeleton/index.js';
export type {
  SkeletonProps,
  SkeletonAnimation,
  SkeletonVariant,
  SkeletonListProps,
  SkeletonTableProps,
} from './components/Skeleton/index.js';

export { Tooltip } from './components/Tooltip/index.js';
export type {
  TooltipProps,
  TooltipAlign,
  TooltipPlacement,
  TooltipSide,
} from './components/Tooltip/index.js';
