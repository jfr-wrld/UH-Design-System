// Public entry point of @umrahhaji/ui.
// Styles are shipped separately as @umrahhaji/ui/styles.css.
export { Button } from './components/Button/index.js';
export type { ButtonProps, ButtonSize, ButtonVariant } from './components/Button/index.js';

export { SocialButton } from './components/SocialButton/index.js';
export type { SocialButtonProps, SocialProvider } from './components/SocialButton/index.js';

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

export { Modal } from './components/Modal/index.js';
export type { ModalProps, ModalSize, ModalVariant } from './components/Modal/index.js';
export { useFocusTrap, useScrollLock, FOCUSABLE } from './hooks/index.js';
export type { FocusTrapOptions } from './hooks/index.js';

export { Overlay } from './components/Overlay/index.js';
export type { OverlayProps, OverlayRole } from './components/Overlay/index.js';

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  CommandDialog,
} from './components/Command/index.js';
export type {
  CommandProps,
  CommandFilter,
  CommandInputProps,
  CommandListProps,
  CommandEmptyProps,
  CommandGroupProps,
  CommandItemProps,
  CommandSeparatorProps,
  CommandShortcutProps,
  CommandDialogProps,
} from './components/Command/index.js';

export { BottomSheet } from './components/BottomSheet/index.js';
export type { BottomSheetProps, BottomSheetLabels } from './components/BottomSheet/index.js';

export { Drawer } from './components/Drawer/index.js';
export type { DrawerProps, DrawerSide, DrawerSize } from './components/Drawer/index.js';

export { Popover } from './components/Popover/index.js';
export type { PopoverProps } from './components/Popover/index.js';

export { ToastProvider, useToast } from './components/Toast/index.js';
export type {
  ToastAction,
  ToastContextValue,
  ToastHandle,
  ToastOptions,
  ToastPosition,
  ToastProviderProps,
  ToastVariant,
} from './components/Toast/index.js';

export { Alert } from './components/Alert/index.js';
export type {
  AlertAction,
  AlertLayout,
  AlertProps,
  AlertVariant,
} from './components/Alert/index.js';

export { ProgressBar } from './components/ProgressBar/index.js';
export type { ProgressBarProps, ProgressBarVariant } from './components/ProgressBar/index.js';

export { EmptyState } from './components/EmptyState/index.js';
export type {
  EmptyStateAction,
  EmptyStateProps,
  EmptyStateSize,
} from './components/EmptyState/index.js';

export { ErrorState } from './components/ErrorState/index.js';
export type {
  ErrorStateAction,
  ErrorStateProps,
  ErrorStateSize,
} from './components/ErrorState/index.js';

export { Card } from './components/Card/index.js';
export type { CardPadding, CardProps, CardVariant } from './components/Card/index.js';

export { Chip } from './components/Chip/index.js';
export type { ChipProps } from './components/Chip/index.js';

export { Tabs } from './components/Tabs/index.js';
export type { TabsProps, TabItem } from './components/Tabs/index.js';

export { Carousel } from './components/Carousel/index.js';
export type { CarouselProps, CarouselSlide, CarouselLabels } from './components/Carousel/index.js';

export { Pagination } from './components/Pagination/index.js';
export type { PaginationProps, PaginationLabels } from './components/Pagination/index.js';

export { Stack } from './components/Stack/index.js';
export type {
  StackProps,
  StackDirection,
  StackGap,
  StackAlign,
  StackJustify,
} from './components/Stack/index.js';

export { Grid } from './components/Grid/index.js';
export type { GridProps, GridGap } from './components/Grid/index.js';

export { Container } from './components/Container/index.js';
export type { ContainerProps, ContainerSize } from './components/Container/index.js';

export { FilterPanel } from './components/FilterPanel/index.js';
export type {
  FilterPanelProps,
  FilterPanelLabels,
  FilterOption,
} from './components/FilterPanel/index.js';

export { Chart } from './components/Chart/index.js';
export type {
  ChartProps,
  ChartType,
  ChartSeries,
  ChartSeriesColor,
} from './components/Chart/index.js';

export { ScrollArea } from './components/ScrollArea/index.js';
export type { ScrollAreaProps, ScrollAreaOrientation } from './components/ScrollArea/index.js';

export { Slider } from './components/Slider/index.js';
export type { SliderProps, SliderValueDisplay } from './components/Slider/index.js';

export { TextArea } from './components/TextArea/index.js';
export type { TextAreaProps } from './components/TextArea/index.js';

export { TimeField } from './components/TimeField/index.js';
export type {
  TimeFieldProps,
  TimeFieldGranularity,
  TimeFieldHourCycle,
  TimeFieldLabels,
  TimeValue,
} from './components/TimeField/index.js';

export { TimePicker } from './components/TimePicker/index.js';
// TimeValue is the same type TimeField already exports; not re-exported a
// second time here to avoid a duplicate-export name clash.
export type { TimePickerProps, TimePickerHourCycle } from './components/TimePicker/index.js';

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './components/Table/index.js';
export type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
} from './components/Table/index.js';

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './components/Accordion/index.js';
export type {
  AccordionProps,
  AccordionSingleProps,
  AccordionMultipleProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
} from './components/Accordion/index.js';

export { Breadcrumbs } from './components/Breadcrumbs/index.js';
export type {
  BreadcrumbsProps,
  BreadcrumbItem,
  BreadcrumbDivider,
} from './components/Breadcrumbs/index.js';

export { ButtonGroup } from './components/ButtonGroup/index.js';
export type { ButtonGroupProps, ButtonGroupOrientation } from './components/ButtonGroup/index.js';

export { Separator } from './components/Separator/index.js';
export type { SeparatorProps, SeparatorOrientation } from './components/Separator/index.js';

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownGroup,
  DropdownSeparator,
} from './components/Dropdown/index.js';
export type {
  DropdownProps,
  DropdownTriggerProps,
  DropdownContentProps,
  DropdownItemProps,
  DropdownGroupProps,
  DropdownSeparatorProps,
} from './components/Dropdown/index.js';

export {
  DateField,
  daysInMonth,
  formatDateValue,
  toNativeDateString,
} from './components/DateField/index.js';
export type { DateFieldProps, DateFieldLabels, DateValue } from './components/DateField/index.js';

export { AspectRatio } from './components/AspectRatio/index.js';
export type { AspectRatioProps, AspectRatioPreset } from './components/AspectRatio/index.js';

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './components/Collapsible/index.js';
export type {
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsibleContentProps,
} from './components/Collapsible/index.js';

export { List, ListItem } from './components/List/index.js';
export type { ListProps, ListDirection, ListItemProps } from './components/List/index.js';

export { NativeSelect } from './components/NativeSelect/index.js';
export type { NativeSelectProps } from './components/NativeSelect/index.js';
