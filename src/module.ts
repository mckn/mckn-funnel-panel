import { FieldColorModeId, FieldConfigProperty, PanelPlugin } from '@grafana/data';
import { t } from '@grafana/i18n';
import { FunnelPanel } from 'components/FunnelPanel';
import { hasGrafanaComparison } from 'data/comparison';
import { initI18n } from './initI18n';
import { ComparisonPeriod, Layout, Orientation, OutcomeDirection, Sorting, type PanelOptions } from './types';

await initI18n();

export const plugin = new PanelPlugin<PanelOptions>(FunnelPanel)
  .useFieldConfig({
    disableStandardOptions: [FieldConfigProperty.NoValue, FieldConfigProperty.Thresholds],
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
      path: 'layout',
      name: t('panel.options.layout.name', 'Layout'),
      category: ['Funnel'],
      settings: {
        options: [
          {
            value: Layout.classic,
            label: t('panel.options.layout.classic-label', 'Classic'),
            description: t(
              'panel.options.layout.classic-description',
              'Centered funnel with labels on the left and percentages on the right'
            ),
          },
          {
            value: Layout.flow,
            label: t('panel.options.layout.flow-label', 'Flow'),
            description: t(
              'panel.options.layout.flow-description',
              'One section per step with details next to a continuous, smoothly narrowing funnel'
            ),
          },
        ],
      },
      defaultValue: Layout.classic,
    });

    builder.addRadio({
      path: 'orientation',
      name: t('panel.options.orientation.name', 'Orientation'),
      category: ['Funnel'],
      settings: {
        options: [
          {
            value: Orientation.vertical,
            label: t('panel.options.orientation.vertical-label', 'Vertical'),
            description: t(
              'panel.options.orientation.vertical-description',
              'Steps from top to bottom with the funnel on the right'
            ),
          },
          {
            value: Orientation.horizontal,
            label: t('panel.options.orientation.horizontal-label', 'Horizontal'),
            description: t(
              'panel.options.orientation.horizontal-description',
              'Steps from left to right with the funnel below the details'
            ),
          },
        ],
      },
      defaultValue: Orientation.vertical,
      showIf: (options) => options.layout === Layout.flow,
    });

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
      description: t('panel.options.show-percentage.description', 'Show the percentage column next to the funnel bars'),
      defaultValue: true,
      showIf: (options) => options.layout !== Layout.flow,
    });

    builder.addRadio({
      path: 'comparisonPeriod',
      name: t('panel.options.comparison-period.name', 'Funnel to display'),
      category: ['Time comparison'],
      settings: {
        options: [
          {
            value: ComparisonPeriod.newest,
            label: t('panel.options.comparison-period.newest-label', 'Newest period'),
            description: t(
              'panel.options.comparison-period.newest-description',
              'Show the newest period and its change from the oldest period'
            ),
          },
          {
            value: ComparisonPeriod.oldest,
            label: t('panel.options.comparison-period.oldest-label', 'Oldest period'),
            description: t(
              'panel.options.comparison-period.oldest-description',
              'Show the oldest period and its change from the newest period'
            ),
          },
        ],
      },
      defaultValue: ComparisonPeriod.newest,
      // Grafana adds the comparison period when Time comparison is enabled in the time settings of the panel.
      showIf: (options, data) => options.layout === Layout.flow && hasGrafanaComparison(data),
    });

    builder.addRadio({
      path: 'outcomeDirection',
      name: t('panel.options.outcome-direction.name', 'A favorable outcome is'),
      category: ['Time comparison'],
      settings: {
        options: [
          {
            value: OutcomeDirection.higher,
            label: t('panel.options.outcome-direction.higher-label', 'Higher'),
            description: t('panel.options.outcome-direction.higher-description', 'Show increases as favorable'),
          },
          {
            value: OutcomeDirection.lower,
            label: t('panel.options.outcome-direction.lower-label', 'Lower'),
            description: t('panel.options.outcome-direction.lower-description', 'Show decreases as favorable'),
          },
        ],
      },
      defaultValue: OutcomeDirection.higher,
      // Grafana adds the comparison period when Time comparison is enabled in the time settings of the panel.
      showIf: (options, data) => options.layout === Layout.flow && hasGrafanaComparison(data),
    });
  });
