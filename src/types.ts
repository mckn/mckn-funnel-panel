export enum Sorting {
  ascending = 'ascending',
  descending = 'descending',
  none = 'none',
}

export enum Layout {
  classic = 'classic',
  flow = 'flow',
}

export enum Orientation {
  vertical = 'vertical',
  horizontal = 'horizontal',
}

export enum ComparisonMode {
  auto = 'auto',
  manual = 'manual',
  off = 'off',
}

export enum ComparisonPeriod {
  newest = 'newest',
  oldest = 'oldest',
}

export enum OutcomeDirection {
  higher = 'higher',
  lower = 'lower',
}

export interface PanelOptions {
  layout: Layout;
  orientation: Orientation;
  sorting: Sorting;
  showRemainedPercentage: boolean;
  showPercentage: boolean;
  comparisonMode: ComparisonMode;
  currentRefId: string;
  previousRefId: string;
  comparisonPeriod: ComparisonPeriod;
  outcomeDirection: OutcomeDirection;
}
