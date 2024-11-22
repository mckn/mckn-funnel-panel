import { FieldColorModeId, FieldConfigProperty, PanelPlugin } from '@grafana/data';
import { FunnelPanel } from 'components/FunnelPanel';
import { type PanelOptions } from './types';

export const plugin = new PanelPlugin<PanelOptions>(FunnelPanel).useFieldConfig({
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
}).setPanelOptions((builder) => {
  builder.addBooleanSwitch({
    path: 'orderValues',
    name: 'Sort data values',
    defaultValue: true
  });
});

