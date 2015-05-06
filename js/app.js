var map;
$(window).resize(function () {
  var h = $(window).height(),
    offsetTop = 280; // Calculate the top offset

  $('#chart').css('height', (h - offsetTop));
  $('#map').css('height', (h - offsetTop));
}).resize();

$(function () {

    // logic for iframe view
    var is_iframe = false;
    if (window.location.href.indexOf("iframe=1") >= 0) {
      is_iframe = true;
      $("#topNav").hide();
      $("#chart").css("top", "0");
      $("#map").css("top", "0");
    }

    init_chart();
    init_map();

});

function init_chart(){

  $.when($.get('/data/cook_puma_trend_by_quarter.csv')).then(
    function(data){
      var puma_data = $.csv.toObjects(data);
      var series_data = [];

      $.each(puma_data, function(k, v){

        var data = [];
        for (var year = 1997; year < 2015; year++) {
          for (var quarter = 1; quarter < 5; quarter++) {
            data.push(parseFloat(v[ year + 'Q' + quarter ]));
          }
        }

        series_data.push({name: v['Name'], data: data});

      });
  
      // initialize chart
      $('#chart').highcharts({
          title: {
              text: 'Cook County Housing Price Index',
              x: -20 //center
          },
          xAxis: {
              type: 'datetime'
          },
          yAxis: {
              title: {
                  text: 'Price Index'
              },
              plotLines: [{
                  value: 0,
                  width: 1,
                  color: '#808080'
              }]
          },
          tooltip: {
            crosshairs: true,
            formatter: function() {
              var s = "<strong>" + Highcharts.dateFormat("%B %Y", this.x); + "</strong>";
              $.each(this.points, function(i, point) {
                s = "<br /><span style='color: " + point.series.color + "'>" + point.series.name + ":</span> " + Highcharts.numberFormat(point.y, 0);
              });
              return s;
            }
          },
          legend: {
              layout: 'vertical',
              align: 'right',
              verticalAlign: 'middle',
              borderWidth: 0
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
            pointStart: 1997,
            shadow: false,
            states: {
               hover: {
                  lineWidth: 3
               }
            }
          }
        },
          series: series_data
      });
    });
}

function init_map() {

    map = L.map('map').setView([41.79998325207397, -87.87277221679688], 9);

    L.tileLayer('https://{s}.tiles.mapbox.com/v3/datamade.hn83a654/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        id: 'datamade.hn83a654'
    }).addTo(map);

    $.when($.getJSON('data/pumas.geojson')).then(
      function(pumas){
        L.geoJson(pumas, {
            style: puma_style,
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.NAMELSAD10);
            }
        }).addTo(map);
    });
}

function puma_style(feature){
    var style = {
        "color": "white",
        "fillColor": "#0570b0",
        "opacity": 1,
        "weight": 1,
        "fillOpacity": 0.5,
    }
    return style;
}