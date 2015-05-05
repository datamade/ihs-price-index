var map;

$(window).resize(function () {
  var h = $(window).height(),
    offsetTop = 80; // Calculate the top offset

  $('#chart').css('height', (h - offsetTop - 200));
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
    // initialize chart
    $('#chart').highcharts({
        title: {
            text: 'Monthly Average Temperature',
            x: -20 //center
        },
        subtitle: {
            text: 'Source: WorldClimate.com',
            x: -20
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            title: {
                text: 'Temperature (°C)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: '°C'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
            name: 'Tokyo',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }, {
            name: 'New York',
            data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
        }, {
            name: 'Berlin',
            data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
        }, {
            name: 'London',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }]
    });
}

function init_map() {

    map = L.map('map').setView([41.87467,-87.62627], 9);

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