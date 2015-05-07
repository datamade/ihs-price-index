var map;

var puma_lookup = { '03501': 'Uptown/Rogers Park',
                    '03502': 'Lake View/Lincoln Park',
                    '03503': 'Lincoln Square/North Center',
                    '03504': 'Irving Park/Albany Park',
                    '03520': 'Portage Park/Jefferson Park',
                    '03521': 'Austin/Belmont Cragin',
                    '03522': 'Logan Square/Avondale',
                    '03523': 'Humboldt Park/Garfield Park',
                    '03524': 'West Town/Near West Side',
                    '03526': 'Bridgeport/Brighton Park',
                    '03527': 'Gage Park/West Lawn',
                    '03528': 'Chicago Lawn/Englewood',
                    '03529': 'Bronzeville/Hyde Park',
                    '03530': 'Beverly/Morgan Park',
                    '03531': 'Auburn Gresham/Chatham',
                    '03532': 'South Chicago/Hegewisch',
                    '03525': 'Loop and Surrounding',
                    '03401': 'Palatine/Barrington',
                    '03407': 'Melrose Park/Maywood',
                    '03408': 'Cicero/Oak Park',
                    '03409': 'LaGrange/Stickney',
                    '03410': 'Orland Park/Lemont',
                    '03411': 'Oak Lawn/Blue Island',
                    '03412': 'Oak Forest/Country Club Hills',
                    '03413': 'Calumat City/Harvey',
                    '03414': 'Chicago Heights/Flossmoor',
                    '03415': 'Arlington Heights/Prospect Heights',
                    '03416': 'Winnetka/Northbrook',
                    '03417': 'Hanover/Hoffman Estates',
                    '03418': 'Schaumburg',
                    '03419': 'Mount Prospect/Elk Grove Village',
                    '03420': 'Park Ridge/Des Plaines',
                    '03421': 'Evanston/Skokie',
                    '03422': 'Rosemont/Elmwood Park'};


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

        series_data.push({name: v['PumaID'], data: data, lineWidth: 2});

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
              var s = "<strong>" + puma_lookup[this.series.name] + "</strong><br />" + Highcharts.dateFormat("%B %Y", this.x) + "<br />Price index: " + this.y;
              
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
            },
            events: {
              mouseOver: function () {
                console.log('over');
                console.log(this);
              },
              mouseOut: function () {
                console.log('out');
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
    var puma_layer;

    L.tileLayer('https://{s}.tiles.mapbox.com/v3/datamade.hn83a654/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        id: 'datamade.hn83a654'
    }).addTo(map);

    // control that shows state info on hover
    var info = L.control();

    info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };

    info.update = function (props) {
      this._div.innerHTML = (props ?
        '<b>' + puma_lookup[props.PUMACE10] + '</b>'
        : 'Hover over an area');
    };

    info.addTo(map);

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

    function resetHighlight(e) {
      puma_layer.resetStyle(e.target);
      info.update();
    }

    function highlightFeature(e) {
      var layer = e.target;

      layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
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
    });
}

