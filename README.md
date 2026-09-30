![GitHub](https://img.shields.io/github/license/mckn/mckn-funnel-panel)
![Version](https://img.shields.io/github/package-json/v/mckn/mckn-funnel-panel)

# Funnel Panel

Grafana panel to create funnel charts

![Screenshot](https://raw.githubusercontent.com/mckn/mckn-funnel-panel/83b6605fa913001f965ff951892c9bdf13429f07/src/img/panel.png)

## What are funnel charts?

A funnel chart is a specialized chart type that demonstrates the flow of e.g. users through a business or sales process. The chart takes its name from its shape, which starts from a broad head and ends in a narrow neck. The number of users at each stage of the process are indicated from the funnel’s width as it narrows.

## Getting Started

The panel can be used with any data source that returns data frame(s) containing one numeric field per step in the funnel.

The easies way to achive this is to have one query per step (probably the most common way to query the data).

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

A plain **Time shift** changes the time range of the whole panel. It does not give a second period to compare with.

## FAQ

**Q: The percentage values looks off in my funnel, what am I doing wrong?**

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
npm install
npm run dev

# Start a local instance of Grafana with a provisioned dashboard.
docker-compose up
```
