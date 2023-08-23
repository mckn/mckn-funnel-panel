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

## Contributing

- For bugs or enhancements please create an [issue](https://github.com/mckn/mckn-funnel-panel/issues/new).
