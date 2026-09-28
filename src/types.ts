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

export interface PanelOptions {
  layout: Layout;
  orientation: Orientation;
  sorting: Sorting;
  showRemainedPercentage: boolean;
  showPercentage: boolean;
}
