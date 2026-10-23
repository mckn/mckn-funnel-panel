![GitHub](https://img.shields.io/github/license/mckn/mckn-funnel-panel)
![Version](https://img.shields.io/github/package-json/v/mckn/mckn-funnel-panel)

# Funnel Panel

Grafana panel to create funnel charts

![Screenshot](https://raw.githubusercontent.com/mckn/mckn-funnel-panel/83b6605fa913001f965ff951892c9bdf13429f07/src/img/panel.png)

## What are funnel charts?

A funnel chart is a specialized chart type that demonstrates the flow of e.g. users through a business or sales process. The chart takes its name from its shape, which starts from a broad head and ends in a narrow neck. The number of users at each stage of the process are indicated from the funnel’s width as it narrows.

The Funnel panel shows where users drop off between the steps of a process, such as a checkout or a campaign. It works with any data source that returns one numeric value per step.

## Features

- Two layouts: a classic centered funnel, or a flow layout with one continuous band that narrows from step to step.
- A vertical or a horizontal flow layout.
- The drop-off or the retention rate between each pair of steps.
- Steps sorted from highest to lowest, from lowest to highest, or in query order.
- Comparison with an earlier period through Grafana Time comparison, with the change of each step and of the overall conversion (Grafana 12.3 or later).
- A data links menu on each step of the flow layout, for drill-down to other dashboards.
- Translations in English, Swedish, Spanish, Portuguese and French.

For how to shape your data and configure the panel, refer to the [Funnel documentation](https://grafana.com/grafana/plugins/mckn-funnel-panel/docs/).
