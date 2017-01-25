/* global L */
'use strict';

var map = L.map('map').setView([47.3, 11.3], 9);
map.attributionControl.setPrefix(false);
var layers = L.control.layers({}, {}, {collapsed: false}).addTo(map);

['gdi_base_summer', 'gdi_base_winter'].map(function(TileMatrixSet, idx) {
  var layer = L.tileLayer('https://wmts.kartetirol.at/wmts/{TileMatrixSet}/{TileMatrixSet}/{z}/{x}/{y}.jpeg80', {
    TileMatrixSet: TileMatrixSet,
    attribution: [
      '<a href="https://www.tirol.gv.at/data/">data.tirol.gv.at</a>',
      '<a href="https://www.tirol.gv.at/data/nutzungsbedingungen/">CC BY 3.0 AT</a>'
    ]
  });
  idx === 0 && layer.addTo(map);
  var title = {
    gdi_base_summer: 'Elektronische Karte Tirol: Sommer',
    gdi_base_winter: 'Elektronische Karte Tirol: Winter',
  }
  layers.addBaseLayer(layer, title[TileMatrixSet]);
});
