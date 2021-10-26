# Price Index Visualization for The DePaul Institute for Housing Studies

## Running locally

``` bash
git clone git@github.com:datamade/ihs-price-index.git
cd ihs-price-index
python -m SimpleHTTPServer
```

navigate to http://localhost:8000/

## Dependencies
We used the following open source tools:

* [Bootstrap](http://getbootstrap.com/) - Responsive HTML, CSS and Javascript framework
* [Leaflet](http://leafletjs.com/) - javascript library interactive maps
* [HighCharts](http://www.highcharts.com/) - javascript library online, interactive charts

## Data updates

The Price Index is updated twice a year with data from the IHS team. Data is shared in an excel spreadsheet with several tabs.

Steps to update:

1. Open up the excel file and export two sheets: index by quarter and the summary table. Save these sheets as `csv`.
2. Ensure that the format of these sheets matches the existing files in the `/data` folder. There are often times slight differences in the column titles and additional rows and columns that need to be removed.
3. Once the files are cleaned up, move them into the `/data` folder.
4. Open up a terminal and cd into the `/data` folder. Activate your python3 virtual env. There are no requirements to install.
5. Run `python munge.py`. It will update the `cook_puma_trend_by_quarter.csv` file.
6. Open up `index.html`, `js/app.js` and `js/app_iframe.js` and replace any references to the previous update's files with the new ones.
7. The chart titles on `index.html` and `js/app_iframe.js` will also need to be updated.

You can view an example PR for one of these updates here: https://github.com/datamade/ihs-price-index/pull/4

## Team

* Derek Eder - developer, content
* Eric van Zanten - developer, GIS data

## Errors / Bugs

If something is not behaving intuitively, it is a bug, and should be reported.
Report it here: https://github.com/datamade/ihs-price-index/issues

## Note on Patches/Pull Requests
 
* Fork the project.
* Make your feature addition or bug fix.
* Commit, do not mess with rakefile, version, or history.
* Send a pull request. Bonus points for topic branches.

## Copyright

Copyright (c) 2021 DataMade. Released under the [MIT License](https://github.com/datamade/ihs-price-index/blob/main/LICENSE).
