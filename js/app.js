var map;
var chart;
var puma_layer;
var leaflet_features = {};
var chart_series = {};
var feature_color = '';
var puma_lookup = {};

$(window).resize(function () {
  var h = $(window).height(),
    offsetTop = 240; // Calculate the top offset

  $('#chart').css('height', (h - offsetTop - 40));
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
    $('#indicators_table span').popover({trigger: "hover", placement: "top"})

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

      init_map();
      init_table();
  
      // initialize chart
      chart = new Highcharts.Chart({
        chart: {
            renderTo: 'chart'
        },
        title: {
            text: null,
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
                map._layers[leaflet_features[this.name]].fireEvent('mouseover');
                map._layers[leaflet_features[this.name]].setStyle({fillColor: this.color});
              },
              mouseOut: function () {
                map._layers[leaflet_features[this.name]].fireEvent('mouseout');
              }
            }
          }
        },
        series: series_data
      });
    });
}

function init_map() {

    map = L.map('map', { scrollWheelZoom: false }).setView([41.79998325207397, -87.87277221679688], 9);

    L.tileLayer('https://{s}.tiles.mapbox.com/v3/datamade.hn83a654/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        id: 'datamade.hn83a654',
        detectRetina: true
    }).addTo(map);

    // control that shows state info on hover
    var info = L.control();

    info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };

    info.update = function (props) {
      var text = 'Hover over an area';
      if (props) {
        if (puma_lookup[props.PUMACE10])
          text = puma_lookup[props.PUMACE10].Name
        else
          text = "Chicago--Loop (not enough data)";
      }
      this._div.innerHTML = '<b>' + text + '</b>';
    };

    info.addTo(map);

    function puma_style(feature){
        var style = {
            "color": "white",
            "fillColor": "#0855CD",
            "opacity": 1,
            "weight": 1,
            "fillOpacity": 0.5,
        }
        return style;
    }

    function resetHighlight(e) {
      var layer = e.target;
      puma_layer.resetStyle(layer);
      if (layer.feature.properties.PUMACE10 == "03525")
        layer.setStyle({fillColor: '#ccc'});
      else
        chart.series[chart_series[layer.feature.properties.PUMACE10]].setState();
      info.update();
    }

    function highlightFeature(e) {
      var layer = e.target;
      var color = '#ccc';
      if (chart.series[chart_series[layer.feature.properties.PUMACE10]] != undefined) {
        color = chart.series[chart_series[layer.feature.properties.PUMACE10]].color;
        chart.series[chart_series[layer.feature.properties.PUMACE10]].setState('hover');
        chart.series[chart_series[layer.feature.properties.PUMACE10]].group.toFront();
      }

      layer.setStyle({
        weight: 5,
        color: '#fff',
        dashArray: '',
        fillOpacity: 0.7,
        fillColor: color
      });

      if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
      }

      info.update(layer.feature.properties);
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
      });
    }

    $.when($.getJSON('data/pumas.geojson')).then(
      function(pumas){
        puma_layer = L.geoJson(pumas, {
            style: puma_style,
            onEachFeature: onEachFeature
        }).addTo(map);

        puma_layer.eachLayer(function (layer) {
          if (layer.feature.properties.PUMACE10 == "03525")
            layer.setStyle({fillColor: '#ccc'});
          leaflet_features[layer.feature.properties.PUMACE10] = layer._leaflet_id;
        });

        map.fitBounds(puma_layer.getBounds());
    });
}

function init_table() {
  $.each(puma_lookup, function(k,v){
    console.log(v)
    var row = "\
      <tr>\
        <td style='width: 35%'>" + v.Name + "</td>\
        " + table_row(v['Change Since 2000']) + "\
        " + table_row(v['Change Peak to Current']) + "\
        " + table_row(v['Change Bottom to Current']) + "\
        " + table_row(v['Year-over-year change']) + "\
      </tr>";

    $('#indicators_table tbody').append(row);

  });

  $('#indicators_table').dataTable( {
    "aaSorting": [ [1,'desc'] ],
    "aoColumns": [
        null,
        null,
        null,
        null,
        null
    ],
    "bInfo": false,
    "bPaginate": false,
    "bFilter": false
  });
}

function table_row(value) {
  var style = 'danger';
  if (value >= 0) {
    style = 'success';
    value = "+" + value;
  }
  return "<td class='" + style + "'>" + value + "%</td>";
}