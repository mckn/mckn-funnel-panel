export enum Sorting {
  ascending = 'ascending',
  descending = 'descending',
  none = 'none',
}
export interface PanelOptions {
  sorting: Sorting;
  showRemainedPercentage: boolean;
}
