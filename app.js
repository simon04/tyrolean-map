/* global window, L */
'use strict';

var map = L.map('map').setView([47.3, 11.3], 9);
map.attributionControl.setPrefix(false);
var layers = L.control.layers({}, {}, {
  collapsed: window.matchMedia && window.matchMedia('all and (max-width: 700px)').matches
}).addTo(map);

var attribution = [
  '<a href="https://www.tirol.gv.at/data/">data.tirol.gv.at</a>',
  '<a href="https://www.tirol.gv.at/data/nutzungsbedingungen/">CC BY 3.0 AT</a>'
];

[
  {id: 'gdi_base_summer', title: 'Elektronische Karte Tirol: Sommer'},
  {id: 'gdi_base_winter', title: 'Elektronische Karte Tirol: Winter'}
].map(function(options, idx) {
  var layer = L.tileLayer('https://wmts.kartetirol.at/wmts/{TileMatrixSet}/{TileMatrixSet}/{z}/{x}/{y}.jpeg80', {
    TileMatrixSet: options.id,
    attribution: attribution
  });
  idx === 0 && layer.addTo(map);
  layers.addBaseLayer(layer, options.title);
});

[
  {id: 'Image Schummerung_Gelaendemodell', title: 'Gelände Tirol: Geländemodell'},
  {id: 'Image Schummerung_Oberflaechenmodell', title: 'Gelände Tirol: Oberflächenmodell'},
  {id: 'Image Exposition', title: 'Gelände Tirol: Exposition'},
  {id: 'Image Gelaendeneigung_Grad', title: 'Gelände Tirol: Geländeneigung'}
].map(function(options) {
  var layer = L.tileLayer.wms('https://gis.tirol.gv.at/arcgis/services/Service_Public/terrain/MapServer/WMSServer', {
    layers: options.id,
    format: 'image/jpeg',
    attribution: attribution
  });
  layers.addBaseLayer(layer, options.title);
});
