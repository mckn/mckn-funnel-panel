import { FieldColorModeId, FieldConfigProperty, PanelPlugin } from '@grafana/data';
import { FunnelPanel } from 'components/FunnelPanel';
import { Sorting, type PanelOptions } from './types';

export const plugin = new PanelPlugin<PanelOptions>(FunnelPanel)
  .useFieldConfig({
    disableStandardOptions: [FieldConfigProperty.NoValue, FieldConfigProperty.Thresholds, FieldConfigProperty.Links],
    standardOptions: {
      [FieldConfigProperty.Color]: {
        settings: {
          byValueSupport: true,
          bySeriesSupport: true,
          preferThresholdsMode: false,
        },
        defaultValue: {
          mode: FieldColorModeId.ContinuousGrYlRd,
        },
      },
      [FieldConfigProperty.Min]: {
        defaultValue: 0,
      },
    },
  })
  .setPanelOptions((builder) => {
    builder.addRadio({
      path: 'sorting',
      name: 'Sorting',
      category: ['Funnel'],
      settings: {
        options: [
          {
            value: Sorting.descending,
            label: 'Descending',
            description: 'Sort from highest to lowest',
          },
          {
            value: Sorting.ascending,
            label: 'Ascending',
            description: 'Sort from lowest to highest',
          },
          {
            value: Sorting.none,
            label: 'None',
            description: 'No sorting is applied',
          },
        ],
      },
      defaultValue: Sorting.descending,
    });
  });
