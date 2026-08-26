/** Every word the timeline can put on screen. */
export interface ItineraryTimelineLabels {
  /** Names the whole list: "Itinerary". */
  itinerary: string;
  day: (number: string) => string;
}

export const DEFAULT_LABELS: ItineraryTimelineLabels = {
  itinerary: 'Itinerary',
  day: (number) => `Day ${number}`,
};
