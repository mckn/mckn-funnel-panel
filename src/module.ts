import { FieldColorModeId, FieldConfigProperty, PanelPlugin } from '@grafana/data';
import { FunnelPanel } from 'components/FunnelPanel';
import { type PanelOptions } from './types';

export const plugin = new PanelPlugin<PanelOptions>(FunnelPanel).useFieldConfig({
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
  },
});
