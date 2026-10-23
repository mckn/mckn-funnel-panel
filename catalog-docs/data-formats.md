---
title: Data formats
description: 'Learn what data formats the Funnel panel accepts.'
sidebar_position: 2
---

This document explains the data the Funnel panel needs from a query, so you can build a matching query or check your test data.

## Supported data shape

The panel draws one step for each numeric field in the query result. Every data frame must have at least one numeric field. String and time fields don't become steps.

You can return the steps in two ways.

### One query per step

Each query returns one data frame with one numeric field. This is often the easiest way to query the data.

#### Example

Five queries, `A` to `E`, each return a frame with one row:

| Frame name  | Value |
| ----------- | ----- |
| Sent        | 52000 |
| Viewed      | 35678 |
| Clicked     | 15690 |
| Add to cart | 5596  |
| Purchased   | 3290  |

Each row in this table is a separate frame. The frame name becomes the step name.

### One frame with one numeric field per step

One query returns one data frame. Each numeric field is a step.

#### Example

| Sent  | Viewed | Clicked | Add to cart | Purchased |
| ----- | ------ | ------- | ----------- | --------- |
| 52300 | 35679  | 15690   | 5596        | 3290      |

If your query returns the steps as rows, with one field for the step names and one field for the values, use the **Rows to fields** transformation to get this shape. For more information, refer to [Reshape data that doesn't match](#reshape-data-that-doesnt-match).

### Time comparison

When Grafana Time comparison is on, each numeric field in each period must have exactly one value, and the value must be zero or more. Both periods must have the same steps. For how to turn on Time comparison, refer to [Options](./options.md#time-comparison).

A time series query returns many values per field. Add a **Reduce** transformation and set **Mode** to **Reduce fields**. With the **Total** calculation, each step gets the sum of its values in the period.

#### Example

A time series query returns one field per step:

| Time                | Sent | Viewed | Clicked |
| ------------------- | ---- | ------ | ------- |
| 2026-10-22 10:00:00 | 1200 | 840    | 420     |
| 2026-10-22 10:10:00 | 1350 | 810    | 324     |
| 2026-10-22 10:20:00 | 1500 | 1050   | 578     |

After the **Reduce** transformation, each period has one row:

| Sent | Viewed | Clicked |
| ---- | ------ | ------- |
| 4050 | 2700   | 1322    |

## Field mapping

The panel maps the fields automatically. You can't pick fields in the editor.

- **Value**: The panel uses the last value of each numeric field.
- **Step name**: The display name of the field. When a frame has one numeric field, Grafana uses the frame name. To rename a step, use the **Display name** standard option, or add a field override for that step.
- **Order**: The **Sorting** option sorts the steps by value. With **None**, the steps keep the order of the fields in the query result.
- **Size**: With **Min** set to `0` and no **Max**, the panel draws each step relative to the largest step. The percentages show the size of each step compared with the largest step.

The panel doesn't build the funnel from raw events. Open and closed funnels, strict step order and the conversion window depend on how you query the data. Use dashboard variables to change your query for these.

## Check what your query returns

To see the data the panel receives, open the panel editor, click **Query inspector** and select the **Data** tab. You can also turn on **Table view** at the top of the panel editor to see the data as a table.

## Reshape data that doesn't match

<!-- snippet:reshape-with-transformations -->

If a query returns data in a different shape, you can reshape it without changing the query. Select the **Transform data** tab in the panel editor and add a transformation. For more information, refer to [Transform data](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/transform-data/).

<!-- /snippet:reshape-with-transformations -->

These transformations are common with this panel:

- **Rows to fields**: Turns a table with a step name field and a value field into one field per step.
- **Group by**, followed by **Rows to fields**: Sums the values per step first, for example when the table has one row per step and platform.
- **Reduce**: Turns a time series into one value per step.
