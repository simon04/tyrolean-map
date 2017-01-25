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

['gdi_base_summer', 'gdi_base_winter'].map(function(TileMatrixSet, idx) {
  var layer = L.tileLayer('https://wmts.kartetirol.at/wmts/{TileMatrixSet}/{TileMatrixSet}/{z}/{x}/{y}.jpeg80', {
    TileMatrixSet: TileMatrixSet,
    attribution: attribution
  });
  idx === 0 && layer.addTo(map);
  var title = {
    gdi_base_summer: 'Elektronische Karte Tirol: Sommer',
    gdi_base_winter: 'Elektronische Karte Tirol: Winter',
  }
  layers.addBaseLayer(layer, title[TileMatrixSet]);
});

[
  'Image Schummerung_Gelaendemodell',
  'Image Schummerung_Oberflaechenmodell',
  'Image Exposition',
  'Image Gelaendeneigung_Grad'
].map(function(id) {
  var layer = L.tileLayer.wms('https://gis.tirol.gv.at/arcgis/services/Service_Public/terrain/MapServer/WMSServer', {
    layers: id,
    format: 'image/jpeg',
    attribution: attribution
  });
  var title = {
    'Image Schummerung_Gelaendemodell': 'Gelände Tirol: Geländemodell',
    'Image Schummerung_Oberflaechenmodell': 'Gelände Tirol: Oberflächenmodell',
    'Image Exposition': 'Gelände Tirol: Exposition',
    'Image Gelaendeneigung_Grad': 'Gelände Tirol: Geländeneigung',
  }
  layers.addBaseLayer(layer, title[id]);
});
