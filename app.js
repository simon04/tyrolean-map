/* global window, L */
'use strict';

var map = L.map('map').setView([47.3, 11.3], 9);
map.attributionControl.setPrefix(false);
var layers = L.control.layers({}, {}, {
  collapsed: window.matchMedia && window.matchMedia('all and (max-width: 700px)').matches
}).addTo(map);
L.control.locate({
  icon: 'tm-marker',
  iconLoading: 'tm-marker'
}).addTo(map);

var attribution = [
  '<a href="https://github.com/simon04/tyrolean-map">Tyrolean Map</a> (Simon Legner)',
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

[
  {id: 'Image_1940', title: 'Orthofoto Tirol: 1940'},
  {id: 'Image_1949-1954', title: 'Orthofoto Tirol: 1949–1954'},
  {id: 'Image_1970-1982', title: 'Orthofoto Tirol: 1970–1982'},
  {id: 'Image_1999-2004', title: 'Orthofoto Tirol: 1999–2004'},
  {id: 'Image_2004-2009', title: 'Orthofoto Tirol: 2004–2009'},
  {id: 'Image_2009-2012', title: 'Orthofoto Tirol: 2009–2012'},
  {id: 'Image_2013-2015_RGB', title: 'Orthofoto Tirol: 2013–2015'},
  {id: 'Image_2013-2015_CIR', title: 'Orthofoto Tirol: 2013–2015 <abbr title="photographisches Infrarot">CIR</abbr>'}
].map(function(options) {
  var layer = L.tileLayer.wms('https://gis.tirol.gv.at/arcgis/services/Service_Public/orthofoto/MapServer/WMSServer', {
    layers: options.id,
    format: 'image/jpeg',
    attribution: attribution
  });
  layers.addBaseLayer(layer, options.title);
});
