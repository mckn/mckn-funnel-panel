# Changelog

## 1.3.0

Feature: It is now possible to configure the panel to show the bar gap as a retention instead of a drop.

## 1.2.0

Feature: It is now possible to configure how to sort the bars in the funnel panel.
Bugfix: Added a FAQ to highlight that you might need to set `min:0` in standard options if your data is normalized by minium value.

## 1.1.2

Improved accessability and fixed issue with white text on light background. Big thanks to https://github.com/negrel for help fixing this.

## 1.1.1

Making sure to keep backwards compatability with older Grafana version when using the new Stack component.

## 1.1.0

Upgrade github workflows to latest version and switched to npm instead of yarn.

## 1.0.1

Bugfix: Funnel plugin shows drop numbers as the wrong percentage #21
Bugfix: Text contrast improved for light/dark backgrounds #19
Bugfix: Data will not be repeated weirdly when refreshing dashboard #20

## 1.0.0

Initial release.
