// Public entry point of @umrahhaji/ui.
// Styles are shipped separately as @umrahhaji/ui/styles.css.
export { Button } from './components/Button/index.js';
export type { ButtonProps, ButtonSize, ButtonVariant } from './components/Button/index.js';

export { Input } from './components/Input/index.js';
export type { InputProps, InputSize, InputType } from './components/Input/index.js';

export {
  PhoneInput,
  COUNTRY_RULES,
  formatNational,
  fromE164,
  parsePhone,
  toE164,
} from './components/PhoneInput/index.js';
export type { PhoneInputProps, PhoneCountry } from './components/PhoneInput/index.js';

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

export { NumberStepper, PassengerStepper } from './components/NumberStepper/index.js';
export type {
  NumberStepperProps,
  NumberStepperSize,
  PassengerStepperProps,
  PassengerCounts,
} from './components/NumberStepper/index.js';

export { useControllableState } from './hooks/index.js';

export {
  CurrencyInput,
  formatMoney,
  parseAmount,
  currencySymbol,
  currencyName,
} from './components/CurrencyInput/index.js';
export type { CurrencyInputProps, Currency } from './components/CurrencyInput/index.js';

export { OTPInput } from './components/OTPInput/index.js';
export type { OTPInputProps, OTPInputType } from './components/OTPInput/index.js';

export {
  DatePicker,
  DateRangePicker,
  formatDate,
  formatDateRange,
} from './components/DatePicker/index.js';
export type {
  DatePickerProps,
  DateRangePickerProps,
  DateRangeStatusLabels,
  DisabledDates,
} from './components/DatePicker/index.js';

export {
  FileUpload,
  DEFAULT_LABELS as FILE_UPLOAD_LABELS,
  formatFileSize,
} from './components/FileUpload/index.js';
export type {
  FileUploadProps,
  FileUploadLabels,
  UploadFile,
  Rejection,
  RejectionReason,
} from './components/FileUpload/index.js';

export {
  SearchCombobox,
  splitMatches,
  defaultEmptyMessage,
  DEFAULT_LABELS as SEARCH_COMBOBOX_LABELS,
} from './components/SearchCombobox/index.js';
export type {
  SearchComboboxProps,
  SearchComboboxLabels,
  SearchOption,
  HighlightPart,
} from './components/SearchCombobox/index.js';

export {
  PriceDisplay,
  DEFAULT_LABELS as PRICE_DISPLAY_LABELS,
} from './components/PriceDisplay/index.js';
export type {
  PriceDisplayProps,
  PriceDisplayLabels,
  PriceSize,
  InstalmentPlan,
} from './components/PriceDisplay/index.js';

export { Rating } from './components/Rating/index.js';
export type { RatingProps, RatingSize } from './components/Rating/index.js';
export { formatDuration, formatDistance, formatCount } from './lib/index.js';

export {
  PackageCard,
  BADGE_VARIANT as PACKAGE_BADGE_VARIANT,
} from './components/PackageCard/index.js';
export type {
  PackageCardProps,
  PackageCardVariant,
  PackageCardLabels,
  PackageAgency,
  PackageBadge,
  HotelDistance,
} from './components/PackageCard/index.js';
export { formatDateShort } from './components/DatePicker/index.js';

export { AgencyCard, yearsInOperation } from './components/AgencyCard/index.js';
export type {
  AgencyCardProps,
  AgencyCardVariant,
  AgencyCardLabels,
  LicenseType,
} from './components/AgencyCard/index.js';

export { PriceBreakdown } from './components/PriceBreakdown/index.js';
export type {
  PriceBreakdownProps,
  PriceBreakdownLabels,
  PriceItem,
  PriceItemType,
  BreakdownPassengerCounts,
} from './components/PriceBreakdown/index.js';

export { HotelCard } from './components/HotelCard/index.js';
export type {
  HotelCardProps,
  HotelCardVariant,
  HotelCardLabels,
  HotelCity,
  Amenity,
} from './components/HotelCard/index.js';

export { ReviewCard, RatingBreakdown, formatReviewDate } from './components/ReviewCard/index.js';
export type {
  ReviewCardProps,
  ReviewCardLabels,
  ReviewAuthor,
  ReviewPhoto,
  RatingBreakdownProps,
  RatingBreakdownLabels,
  StarBucket,
} from './components/ReviewCard/index.js';

export {
  BookingStatusTracker,
  DEFAULT_STEPS as BOOKING_TRACKER_STEPS,
} from './components/BookingStatusTracker/index.js';
export type {
  BookingStatusTrackerProps,
  BookingStatusTrackerLabels,
  BookingStep,
  StepState,
  TrackerVariant,
} from './components/BookingStatusTracker/index.js';

export { ItineraryTimeline } from './components/ItineraryTimeline/index.js';
export type {
  ItineraryTimelineProps,
  ItineraryTimelineLabels,
  ItineraryDay,
  ItineraryActivity,
  ItineraryCity,
  ActivityKind,
} from './components/ItineraryTimeline/index.js';
