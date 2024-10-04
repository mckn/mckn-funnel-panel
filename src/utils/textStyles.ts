import { DisplayValue, GrafanaTheme2 } from '@grafana/data';
import tinycolor from 'tinycolor2';

export function getContrastText(values: DisplayValue[], theme: GrafanaTheme2): string {
  const bgColor = values[0]?.color ?? theme.colors.background.canvas;
  return theme.colors.getContrastText(bgColor, theme.colors.contrastThreshold);
}

export function getPercentageExtraStyles(theme: GrafanaTheme2, textColor: string, bgColor: string) {
  // Color of text over Grafana background. This happen when width of funnel's
  // end is smaller than text length.
  const textColorOverflow = theme.colors.getContrastText(
    theme.colors.background.primary,
    theme.colors.contrastThreshold
  );

  if (tinycolor(textColor).isLight() === tinycolor(textColorOverflow).isLight()) {
    return {};
  }

  return {
    backgroundColor: tinycolor(bgColor).setAlpha(0.8).toRgbString(),
    borderRadius: '0.25em',
  };
}
