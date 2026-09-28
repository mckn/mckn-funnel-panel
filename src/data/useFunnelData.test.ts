import { renderHook } from '@testing-library/react';
import { createTheme, FieldType, toDataFrame, type DataFrame, type LinkModel } from '@grafana/data';
import { Layout, Orientation, Sorting, type PanelOptions } from 'types';
import { useFunnelData } from './useFunnelData';

const options: PanelOptions = {
  layout: Layout.flow,
  orientation: Orientation.vertical,
  sorting: Sorting.ascending,
  showRemainedPercentage: false,
  showPercentage: true,
};

function createStep(name: string, value: number, withLinks: boolean): DataFrame {
  // Grafana sets a shared range with applyFieldOverrides, the test sets it on each field.
  const range = { min: 0, max: 100 };
  const frame = toDataFrame({
    fields: [
      {
        name,
        type: FieldType.number,
        values: [value],
        config: withLinks ? { ...range, links: [{ title: `Link to ${name}`, url: `/${name}` }] } : range,
      },
    ],
  });

  if (withLinks) {
    frame.fields[0].getLinks = (): LinkModel[] => [
      { title: `Link to ${name}`, href: `/${name}`, target: '_self', origin: frame.fields[0] },
    ];
  }

  return frame;
}

function renderFunnelData(data: DataFrame[], panelOptions = options) {
  return renderHook(() =>
    useFunnelData(
      {
        data,
        theme: createTheme(),
        fieldConfig: { defaults: { min: 0 }, overrides: [] },
        replaceVariables: (value) => value,
        timeZone: 'utc',
      },
      panelOptions
    )
  ).result.current;
}

describe('useFunnelData', () => {
  it('keeps each link supplier with its value after sorting', () => {
    const { values, links } = renderFunnelData([
      createStep('Sent', 100, true),
      createStep('Viewed', 60, false),
      createStep('Clicked', 20, true),
    ]);

    expect(values.map((v) => v.title)).toEqual(['Clicked', 'Viewed', 'Sent']);
    expect(links[0]?.().map((l) => l.title)).toEqual(['Link to Clicked']);
    expect(links[1]).toBeUndefined();
    expect(links[2]?.().map((l) => l.title)).toEqual(['Link to Sent']);
  });

  it('returns no links when there is no data', () => {
    const { links } = renderFunnelData([]);

    expect(links).toEqual([]);
  });
});
