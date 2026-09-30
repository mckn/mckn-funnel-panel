![GitHub](https://img.shields.io/github/license/mckn/mckn-funnel-panel)
![Version](https://img.shields.io/github/package-json/v/mckn/mckn-funnel-panel)

# Funnel Panel

Grafana panel to create funnel charts

![Screenshot](https://raw.githubusercontent.com/mckn/mckn-funnel-panel/main/src/img/panel.png)

## What are funnel charts?

A funnel chart is a specialized chart type that demonstrates the flow of e.g. users through a business or sales process. The chart takes its name from its shape, which starts from a broad head and ends in a narrow neck. The number of users at each stage of the process are indicated from the funnel’s width as it narrows.

## Layouts

The panel has two layouts. Select one with the **Layout** option.

**Classic** shows one bar per step, with the step name on the left and the percentage on the right. The gap between two bars shows the drop from one step to the next. Hover a bar or a gap to see details.

**Flow** shows the funnel as one continuous band that narrows from step to step. Each step shows its name, its value, and the drop or retention from the previous step. The band shows the percentage of the first step. Hover a step to highlight it. The flow layout can run top to bottom (**Vertical**) or left to right (**Horizontal**).

## Panel options

These options are in the **Funnel** category:

- **Layout** selects the classic or the flow layout.
- **Orientation** selects a vertical or a horizontal band. Only the flow layout uses it.
- **Sorting** sorts the steps from highest to lowest, from lowest to highest, or not at all.
- **Show retention rate** shows the retention between steps instead of the drop.
- **Show percentages** shows or hides the percentage column. Only the classic layout uses it.

When the data has a Grafana Time comparison period, the flow layout also shows the options in [Time comparison](#time-comparison).

## Data links

Add data links in the standard options of the panel to link each step to another dashboard or page. In the flow layout, each step shows a **...** button on hover or focus. The button opens a menu with the data links of that step. The classic layout does not use data links.

## Getting Started

The panel can be used with any data source that returns data frame(s) containing one numeric field per step in the funnel.

The easiest way to achieve this is to have one query per step (probably the most common way to query the data).

If your data, instead, is returned as one data frame with two fields. One field containing all the step labels and one field containing all the numeric values. We recommend using transformations (`Rows to fields`) to transform that data into one data frame with one field per value.

The most common scenarios for this would be if you have a pre-baked view containing the data for the funnel e.g. if you have some heavy queries running on a regular basis to aggregate the data.

We have provided an example [dashboard](https://github.com/mckn/mckn-funnel-panel/blob/main/provisioning/dashboards/panels.json) to show case both of these scenarios in the panel.

## Time comparison

The flow layout can compare the funnel with an earlier period. It shows one funnel at a time, and each step shows its change from the other period:

- The count change, for example `+1200 (+3.5%)`, and the count of the other period.
- The change of the drop-off or retention rate in percentage points, for example `+2.1 pp`.
- A header with the overall conversion from the first to the last step, and its change.

To compare, enable **Time comparison** in the time settings of the panel. The panel uses the period that Grafana adds. Time comparison needs Grafana 12.3 or later. Grafana 12.3 also needs the `panelTimeSettings` and `timeComparison` feature toggles. To go back to a single funnel, disable Time comparison.

When the panel has a comparison period, these options show in the **Time comparison** category:

- **Funnel to display** shows the newest or the oldest period. The steps are sorted by the displayed period.
- **A favorable outcome is** sets the colors. With **Higher**, increases are green and decreases are red. With **Lower**, the colors are the other way around.

Grafana shows the compared period next to the panel title, for example **Compared to day before**. A change is shown as `—` when it can not be calculated, for example when the count of the other period is zero.

![Time comparison](https://raw.githubusercontent.com/mckn/mckn-funnel-panel/main/src/img/panel-comparison.png)

A plain **Time shift** changes the time range of the whole panel. It does not give a second period to compare with.

## Compatibility

The panel supports Grafana 11.0.0 and later. Time comparison needs Grafana 12.3 or later. The panel is available in English, Swedish, Spanish, Portuguese and French.

## Demo dashboard

The repository has a demo of a checkout funnel with a drill-down. The dashboards use generated TestData, so no other plugin is needed. Run `npm run server` and open `/d/funnel-demo`. The files are [funnel-demo.json](https://github.com/mckn/mckn-funnel-panel/blob/main/provisioning/dashboards/funnel-demo.json) and [funnel-demo-drilldown.json](https://github.com/mckn/mckn-funnel-panel/blob/main/provisioning/dashboards/funnel-demo-drilldown.json).

The demo shows how to build the common scenarios of product analytics tools:

- **Step conversion and drop-off.** The flow layout shows the count, the conversion and the drop-off of each step.
- **Comparison with an earlier period.** Grafana Time comparison shows the change of each step and of the overall conversion.
- **Breakdown by property.** A `platform` variable repeats a compact funnel for each platform. The funnels show retention instead of drop-off.
- **Drill-down.** A data link on each step opens the drill-down dashboard. The link passes the step, the platform and the time range.
- **Session replay.** A data link on the user column of the drill-down table opens a session replay.
- **Conversion over time, time to convert and next actions.** Standard Grafana panels show these next to the funnel.

Some scenarios depend on how you query the data, not on the panel. Examples are open and closed funnels, strict step order and the conversion window. Use dashboard variables to change your query for these.

## FAQ

**Q: The percentage values look off in my funnel, what am I doing wrong?**

A: Check the standard options for your panel. Your `min` value might be set to `auto` which will cause Grafana to normalize the data and use the lowest value in the data set as the minimum value. Try to set this value to `0` to see if it will resolve the issue. For more details see the following [issue](https://github.com/mckn/mckn-funnel-panel/issues/47#issuecomment-2561915080).

## Contributing

- For bugs or enhancements please create an [issue](https://github.com/mckn/mckn-funnel-panel/issues/new).

## Development

To run the plugin locally:

```sh
# Get the source code.
git clone git@github.com:mckn/mckn-funnel-panel.git
cd mckn-funnel-panel

# Install dependencies and build the plugin.
npm ci
npm run dev

# Start a local instance of Grafana with a provisioned dashboard.
npm run server
```
