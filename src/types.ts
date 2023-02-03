type SeriesSize = 'sm' | 'md' | 'lg';

export interface PanelOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
}
