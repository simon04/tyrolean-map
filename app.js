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
var attributionST = [
  '<a href="https://github.com/simon04/tyrolean-map">Tyrolean Map</a> (Martin Raifer)',
  '<a href="http://geoportal.buergernetz.bz.it/">geoportal.buergernetz.bz.it</a>',
  '<a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>'
];
var attributionST_CC0 = [
  '<a href="https://github.com/simon04/tyrolean-map">Tyrolean Map</a> (Martin Raifer)',
  '<a href="http://geoportal.buergernetz.bz.it/">geoportal.buergernetz.bz.it</a>',
  '<a href="https://creativecommons.org/publicdomain/zero/1.0/deed">CC0</a>'
];
var attributionOsm = '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> (ODbL)';

var allMapLayers = {};

[
  {id: 'gdi_base_summer', title: 'Elektronische Karte Tirol: Sommer'},
  {id: 'gdi_base_winter', title: 'Elektronische Karte Tirol: Winter'}
].forEach(function(options, idx) {
  var layer = L.tileLayer('https://wmts.kartetirol.at/wmts/{TileMatrixSet}/{TileMatrixSet}/{z}/{x}/{y}.jpeg80', {
    TileMatrixSet: options.id,
    attribution: [].concat(attribution, [attributionOsm])
  });
  idx === 0 && layer.addTo(map);
  layers.addBaseLayer(layer, options.title);
  allMapLayers[options.id] = layer;
});

[
  {id: 'Image Schummerung_Gelaendemodell', title: 'Gelände Tirol: Geländemodell'},
  {id: 'Image Schummerung_Oberflaechenmodell', title: 'Gelände Tirol: Oberflächenmodell'},
  {id: 'Image Exposition', title: 'Gelände Tirol: Exposition'},
  {id: 'Image Gelaendeneigung_Grad', title: 'Gelände Tirol: Geländeneigung'}
].forEach(function(options) {
  var layer = L.tileLayer.wms('https://gis.tirol.gv.at/arcgis/services/Service_Public/terrain/MapServer/WMSServer', {
    layers: options.id,
    format: 'image/jpeg',
    attribution: attribution
  });
  layers.addBaseLayer(layer, options.title);
  allMapLayers[options.id] = layer;
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
].forEach(function(options) {
  var layer = L.tileLayer.wms('https://gis.tirol.gv.at/arcgis/services/Service_Public/orthofoto/MapServer/WMSServer', {
    layers: options.id,
    format: 'image/jpeg',
    attribution: attribution
  });
  layers.addBaseLayer(layer, options.title);
  allMapLayers[options.id] = layer;
});

[
  {id: 'P_BZ_BASEMAP_TOPO', title: 'South Tyrol Base Map'},
].forEach(function(options) {
  var layer = L.tileLayer('http://geoservices.buergernetz.bz.it/geoserver/gwc/service/wmts/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER={layer}&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX=GoogleMapsCompatible%3A{z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg', {
    layer: options.id,
    attribution: [].concat(attributionST, [attributionOsm])
  });
  layers.addBaseLayer(layer, options.title);
  allMapLayers[options.id] = layer;
});

[
  {id: 'DTM-2p5m_Hillshade,DTM_Hillshade_SolarTirol_3857', title: 'DTM South Tyrol'},
  {id: 'DSM-2p5m_Hillshade,DSM_Hillshade_SolarTirol_3857', title: 'DSM South Tyrol'}
].forEach(function(options) {
  var layer = L.tileLayer.wms('https://geoservices.buergernetz.bz.it/geoserver/p_bz-elevation/ows', {
    layers: options.id,
    format: 'image/jpeg',
    attribution: attributionST_CC0
  });
  layers.addBaseLayer(layer, options.title);
  allMapLayers[options.id] = layer;
});

[
  {id: 'Orthophoto_1992_97', title: 'Orthofoto South Tyrol: 1992-97'},
  {id: 'Orthophoto_2000', title: 'Orthofoto South Tyrol: 2000'},
  {id: 'P_BZ_OF_2011_EPSG3857,P_BZ_OF_2014_EPSG3857', title: 'Orthofoto South Tyrol: 2011-2014'},
  {id: 'P_BZ_OF_2014_CIR_EPSG3857', title: 'Orthofoto South Tyrol: 2014 <abbr title="photographisches Infrarot">CIR</abbr>'}
].forEach(function(options) {
  var layer = L.tileLayer.wms('https://geoservices.buergernetz.bz.it/geoserver/p_bz-orthoimagery/ows', {
    layers: options.id,
    format: 'image/jpeg',
    //format: 'image/png',
    //transparent: true,
    attribution: attributionST
  });
  layers.addBaseLayer(layer, options.title);
  allMapLayers[options.id] = layer;
});

var hash = new L.Hash(map, allMapLayers);
