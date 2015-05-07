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

        if (v['Name'] == 'Cook County Average')
          console.log('a')
          // series_data.push({name: v['Name'], data: data, color: '#cccccc', lineWidth: 20, zIndex: -1});
        else
          series_data.push({name: v['Name'], data: data, lineWidth: 2});

      });
  
      // initialize chart
      $('#chart').highcharts({
          title: {
              text: null,
              x: -20 //center
          },
          credits: { enabled: false },
          xAxis: {
              type: 'datetime'
          },
          yAxis: {
              title: {
                  text: 'Price Index'
              }
          },
          tooltip: {
            crosshairs: true,
            formatter: function() {
              console.log(this)
              var s = "<strong>" + this.series.name + "</strong><br />" + Highcharts.dateFormat("%B %Y", this.x) + "<br />Price index: " + this.y;
              
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
            pointStart: Date.UTC(1997, 0, 1),
            shadow: false,
            states: {
               hover: {
                  lineWidth: 5
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