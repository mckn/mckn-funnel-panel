import { FieldColorModeId, FieldConfigProperty, PanelPlugin } from '@grafana/data';
import { t } from '@grafana/i18n';
import { FunnelPanel } from 'components/FunnelPanel';
import { initI18n } from './initI18n';
import { Sorting, type PanelOptions } from './types';

await initI18n();

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
      name: t('panel.options.sorting.name', 'Sorting'),
      category: ['Funnel'],
      settings: {
        options: [
          {
            value: Sorting.descending,
            label: t('panel.options.sorting.descending-label', 'Descending'),
            description: t('panel.options.sorting.descending-description', 'Sort from highest to lowest'),
          },
          {
            value: Sorting.ascending,
            label: t('panel.options.sorting.ascending-label', 'Ascending'),
            description: t('panel.options.sorting.ascending-description', 'Sort from lowest to highest'),
          },
          {
            value: Sorting.none,
            label: t('panel.options.sorting.none-label', 'None'),
            description: t('panel.options.sorting.none-description', 'No sorting is applied'),
          },
        ],
      },
      defaultValue: Sorting.descending,
    });

    builder.addBooleanSwitch({
      path: 'showRemainedPercentage',
      name: t('panel.options.show-remained-percentage.name', 'Show retention rate'),
      category: ['Funnel'],
      description: t(
        'panel.options.show-remained-percentage.description',
        'Show retention rate instead of drop-off rate in gap labels and tooltips'
      ),
      defaultValue: false,
    });

    builder.addBooleanSwitch({
      path: 'showPercentage',
      name: t('panel.options.show-percentage.name', 'Show percentages'),
      category: ['Funnel'],
      description: t(
        'panel.options.show-percentage.description',
        'Show the percentage column next to the funnel bars'
      ),
      defaultValue: true,
    });
  });
