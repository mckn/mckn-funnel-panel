---
title: Troubleshooting
description: 'Troubleshoot the Funnel panel.'
sidebar_position: 5
---

This page explains how to fix common issues when you use the Funnel panel. For the data the panel expects, refer to [Data formats](./data-formats.md).

## The panel shows No data

The panel shows **No data** when the query returns no data frames.

To fix this, check the query in the panel editor. Make sure that it returns results for the selected time range.

## The panel shows Unsupported data

The panel shows an **Unsupported data** message when a data frame has no numeric field. Every data frame needs at least one numeric field, and the panel draws each numeric field as a step.

To fix this:

1. Check what the query returns. For the steps, refer to [Get more detail about an error](#get-more-detail-about-an-error).
1. If the values are strings, change the query to return numbers, or add the **Convert field type** transformation.
1. If a query or a frame has no values for the funnel, remove it or hide it.

## The percentages look wrong

The percentages or the bar widths don't match the values, for example the smallest step shows `0%`.

The **Min** standard option is probably set to `auto` or to another value than `0`. Grafana then uses the lowest value in the data as the minimum.

To fix this, set **Min** to `0` in the standard options of the panel. For more details, refer to [issue #47](https://github.com/mckn/mckn-funnel-panel/issues/47#issuecomment-2561915080).

## The largest step is below 100% with Time comparison

With Time comparison on, the classic layout can show the largest step below `100%`.

Grafana calculates the percentages with a range that both periods share. The classic layout shows the current period only and doesn't recalculate the range. The flow layout recalculates it from the period that it shows.

To fix this, set **Layout** to **Flow**, or turn off **Time comparison**.

## Time comparison shows a warning

When the panel can't compare the two periods, it shows a warning above a single funnel of the current period.

### Comparison needs one non-negative numeric value per step

Each step of each period must have exactly one value, and the value must be zero or more. A time series query returns many values per step.

To fix this, add a **Reduce** transformation with **Mode** set to **Reduce fields**. For an example, refer to [Data formats](./data-formats.md#time-comparison).

### Current and previous funnel steps do not match

The two periods don't have the same steps. For example, one period has a step that the other period doesn't have.

To fix this, make sure that the query returns the same steps, with the same names, for both periods.

### Time comparison needs the results of the current period

The query results only have the comparison period.

To fix this, check that the query returns data for the current time range.

## The comparison options don't show

The **Time comparison** options only show when **Layout** is set to **Flow** and the panel has a Grafana Time comparison period.

To fix this:

1. Set **Layout** to **Flow**.
1. Turn on **Time comparison** in the time settings of the panel. A plain **Time shift** doesn't add a comparison period.
1. On Grafana 12.3, turn on the `panelTimeSettings` and `timeComparison` feature toggles. Earlier versions of Grafana don't have Time comparison.

## Get more detail about an error

To see the data the panel receives, open the panel editor, click **Query inspector** and select the **Data** tab.

For errors in the panel itself, open the developer tools in your browser and check the console.

## Get additional help

If this page doesn't solve your problem:

- Search the [Grafana community forums](https://community.grafana.com/).
- If your Grafana Cloud or Grafana Enterprise plan includes support, contact Grafana Support.
- Search the [Funnel panel issues](https://github.com/mckn/mckn-funnel-panel/issues) on GitHub, or [open a new issue](https://github.com/mckn/mckn-funnel-panel/issues/new).

When you report an issue, include:

- The Grafana and plugin versions.
- The error message, with sensitive information removed.
- The steps to reproduce the issue.
- The panel options and a sample of the data it shows, with sensitive information removed.
