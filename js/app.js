// logic for iframe view
var is_iframe = false;
if (window.location.href.indexOf("iframe=1") >= 0) {
  is_iframe = true;
  $("#topNav").hide();
  $("#map").css("top", "0");
}

var tooltip_template = "<h3>{{{CCA_Census}}}</h3>\
  <table class='tooltip'>\
    <thead>\
      <tr>\
        <th>Housing Composition</th>\
        <th>{{{REF_GEOG}}}</th>\
        <th>Highlighted Area</th>\
      </tr>\
    </thead>\
    <tbody>\
      <tr>\
        <td class='legend-box'><span style='background:#F5D4A3;'></span> Single-Family</td>\
        <td>{{{Rshre_131}}}%</td>\
        <td>{{{share_131}}}%</td>\
      </tr>\
      <tr>\
        <td class='legend-box'><span style='background:#EDAB50;'></span> Condominium</td>\
        <td>{{{Rshre_132}}}%</td>\
        <td>{{{share_132}}}%</td>\
      </tr>\
      <tr>\
        <td class='legend-box'><span style='background:#8DA7CE;'></span> 2-4 Unit Bldg</td>\
        <td>{{{Rshre_133}}}%</td>\
        <td>{{{share_133}}}%</td>\
      </tr>\
      <tr>\
        <td class='legend-box'><span style='background:#375481;'></span> 5-49 Unit Bldg</td>\
        <td>{{{Rshre_1341}}}%</td>\
        <td>{{{share_1341}}}%</td>\
      </tr>\
      <tr>\
        <td class='legend-box'><span style='background:#1F2F47;'></span> 50+ Unit Bldg</td>\
        <td>{{{Rshre_1342}}}%</td>\
        <td>{{{share_1342}}}%</td>\
      </tr>\
    </tbody>\
  </table>\
  <div class='legend-source'><a href='http://www.housingstudies.org/research-publications/publications/composition-cook-countys-housing-market/' target='_blank'>Read the report &raquo;</a><br /></div>\
  <div class='legend-source'>Source: <a href='http://www.housingstudies.org/dataportal/info/composition/' target='_blank'>IHS calculations from the Cook County Assessor</a></div>\
  </div>\
";

var legend_template = "<div id='my-legend'>\
    <h4>Housing Composition</h4>\
    <div class='legend-scale'>\
      <ul class='legend-labels'>\
        <li><span style='background:#F5D4A3;'></span>Single-Family</li>\
        <li><span style='background:#EDAB50;'></span>Condominium</li>\
        <li><span style='background:#8DA7CE;'></span>2-4 Unit Bldg</li>\
        <li><span style='background:#375481;'></span>5-49 Unit Bldg</li>\
        <li><span style='background:#1F2F47;'></span>50+ Unit Bldg</li>\
      </ul>\
    </div>";

var mapbox_id = 'housingstudies.hace6l6h';

var map = L.mapbox.map('map', '', {minZoom: 10, maxZoom:16, doubleClickZoom: false} ).setView([41.86943299643522, -87.72926330566406], 11);
var hash = new L.Hash(map); //keep track of map location
var gridLayer = L.mapbox.gridLayer(mapbox_id);
map.addLayer(L.mapbox.tileLayer(mapbox_id));
map.addLayer(gridLayer);

if (is_iframe) {
  var legend = L.mapbox.legendControl({position: 'bottomleft'});
  legend.addLegend(legend_template);
  map.addControl(legend);
}
else {
  var tooltip = L.mapbox.gridControl(gridLayer, {position: 'bottomright', pinnable: false});
  tooltip.setTemplate(tooltip_template);
  map.addControl(tooltip);
}

// https://a.tiles.mapbox.com/v3/{mapbox_id}/markers.geojson
var commAreas;
$.when($.getJSON('data/cook-community-areas.geojson')).then(
  function(communities){
    commAreas = L.geoJson(communities, {
      style: {opacity: 0, color: "#EDAB50", fillOpacity: 0},
      onEachFeature: function(feature, layer){
        layer.on('mouseover', function(e){
          layer.setStyle({opacity: 0.7})
        });
        layer.on('mouseout', function(e){
          layer.setStyle({opacity: 0})
        });
        layer.on('click', function(e){
          map.fitBounds(e.target.getBounds(), {padding: [50,50]});
        });
      }
    })
    commAreas.addTo(map);
  }
)