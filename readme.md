# BASIC USAGE

Just run node _generate_report.js_ to launch new Chrome instance and generate all reports listed in _report_list.js_. You can also run with _chromePort=xx_ option for running in existing Chrome instance.

## report_list.js

return an array of object where key symbolizes page you are running report for and value is page url. Key will be used for as report file name.

## config.json

* headless - only works when using new Chrome instace, default: _true_
* output - output format (json/csv/html), default: _html_
* reportListPath - location of JS file returning array of page objects, relative to generate_report.js file, default: _./report_list.js_
* outputPath - output path, default: ./reports/_%DD%.%M%_ , where symbols surrounded with % are replaced by according value

## Pages requiring login

To use on pages requiring login you can use chromePort argument. Run chrome-debug in CLI, login in required page manually, open a new tab and close that contaning page you want to audit, pass port provided by running chrome-debug in terminal as argument.
