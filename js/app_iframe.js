var map;
var chart;
var puma_layer;
var leaflet_features = {};
var chart_series = {};
var feature_color = '';
var puma_lookup = {};

$(window).resize(function () {
  var h = $(window).height();
  $('#chart').css('height', h);
}).resize();

$(function () {
    init_chart();
});

function init_chart(){

  $.when($.get('/data/cook_puma_trend_by_quarter_q2.csv')).then(
    function(data){
      var puma_data = $.csv.toObjects(data);
      var series_data = [];

      $.each(puma_data, function(k, v){
        puma_lookup[v['PumaID']] = v;
        var data = [];
        for (var year = 2000; year <= 2015; year++) {
          for (var quarter = 1; quarter < 5; quarter++) {
            if (v[ year + 'Q' + quarter ] != undefined)
              data.push(parseFloat(v[ year + 'Q' + quarter ]));
          }
        }

        chart_series[v['PumaID']] = k;
        series_data.push({name: v['PumaID'], data: data, lineWidth: 2});

      });
  
      // initialize chart
      chart = new Highcharts.Chart({
        chart: {
            renderTo: 'chart'
        },
        title: {
            text: "Cook County House Price Index: Jan 2000 - June 2015",
            x: -20 //center
        },
        credits: { enabled: false },
        xAxis: { type: 'datetime' },
        yAxis: {
            title: {
                text: 'Price Change Since 2000'
            },
            labels: {
                formatter: function() {
                    return this.value + ' %';
                }
            },
        },
        tooltip: {
          crosshairs: true,
          formatter: function() {
            var val = this.y;
            if (this.y >= 0)
              val = "+" + this.y;
            var s = "<strong>" + puma_lookup[this.series.name].Name + "</strong><br />" + Highcharts.dateFormat("%B %Y", this.x) + "<br />Price change since 2000: " + val + "%";
            
            return s;
          }
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          series: {
            marker: {
              radius: 0,
              states: {
                hover: {
                  enabled: true,
                  radius: 5
                }
              }
            },
            pointInterval: (3 * 30.4 * 24 * 3600 * 1000),  
            pointStart: Date.UTC(2000, 2, 15),
            shadow: false,
            states: {
               hover: {
                  lineWidth: 10
               }
            },
            events: {
              mouseOver: function () {
                chart.series[this.index].group.toFront();
              }
            }
          }
        },
        series: series_data
      });
    });
}