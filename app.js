import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';
import LeafletHash from './leaflet-fullHash';
import './style.css';

var map = L.map('map').setView([47.3, 11.3], 9);

map.attributionControl.setPrefix(false);
var collapsed = window.matchMedia && window.matchMedia('all and (max-width: 700px)').matches;
var layers = L.control.layers({}, {}, {collapsed: collapsed}).addTo(map);

L.Control.geocoder({
  expand: 'click',
  position: 'topleft',
}).addTo(map);

L.control
  .locate({
    icon: 'tm-marker',
    iconLoading: 'tm-marker',
  })
  .addTo(map);

var attribution = [
  '<a href="https://github.com/simon04/tyrolean-map">Tyrolean Map</a> (Simon Legner)',
  '<a href="https://www.tirol.gv.at/data/">data.tirol.gv.at</a>',
  '<a href="https://www.tirol.gv.at/data/nutzungsbedingungen/">CC BY 3.0 AT</a>',
];
var attributionST = [
  '<a href="https://github.com/simon04/tyrolean-map">Tyrolean Map</a> (Martin Raifer)',
  '<a href="http://geoportal.buergernetz.bz.it/">geoportal.buergernetz.bz.it</a>',
  '<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>',
];
var attributionST_CC0 = [
  '<a href="https://github.com/simon04/tyrolean-map">Tyrolean Map</a> (Martin Raifer)',
  '<a href="http://geoportal.buergernetz.bz.it/">geoportal.buergernetz.bz.it</a>',
  '<a href="https://creativecommons.org/publicdomain/zero/1.0/deed">CC0</a>',
];
var attributionOsm = '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> (ODbL)';

var allMapLayers = {};

[
  {id: 'gdi_base_summer', title: 'Elektronische Karte Tirol: Sommer'},
  {id: 'gdi_base_winter', title: 'Elektronische Karte Tirol: Winter'},
].forEach(function (options, idx) {
  var imprint =
    '<a href="https://www.tirol.gv.at/statistik-budget/tiris/tiris-geodatendienste/impressum-elektronische-karte-tirol/">Elektronische Karte Tirol</a>';
  var layer = L.tileLayer(
    'https://wmts.kartetirol.at/wmts/{TileMatrixSet}/{TileMatrixSet}/{z}/{x}/{y}.jpeg80',
    {
      TileMatrixSet: options.id,
      maxZoom: 18,
      attribution: [].concat(attribution, [imprint, attributionOsm]),
    }
  );
  idx === 0 && layer.addTo(map);
  layers.addBaseLayer(layer, options.title);
  allMapLayers[options.id] = layer;
});

[
  {
    id: 'Image_Schummerung_Gelaendemodell',
    title: 'Gelände Tirol: Geländemodell',
  },
  {
    id: 'Image_Schummerung_Oberflaechenmodell',
    title: 'Gelände Tirol: Oberflächenmodell',
  },
  {id: 'Image_Exposition', title: 'Gelände Tirol: Exposition'},
  {id: 'Image_Gelaendeneigung_Grad', title: 'Gelände Tirol: Geländeneigung'},
].forEach(function (options) {
  var layer = L.tileLayer.wms(
    'https://gis.tirol.gv.at/arcgis/services/Service_Public/terrain/MapServer/WMSServer',
    {
      layers: options.id,
      format: 'image/jpeg',
      maxZoom: 20,
      attribution: attribution,
    }
  );
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
  {id: 'Image_2013-2015', title: 'Orthofoto Tirol: 2013–2015'},
  {id: 'Image_2016', title: 'Orthofoto Tirol: 2016'},
  {id: 'Image_Aktuell_RGB', title: 'Orthofoto Tirol: aktuell'},
  {
    id: 'Image_Aktuell_CIR',
    title: 'Orthofoto Tirol: <abbr title="photographisches Infrarot">CIR</abbr> aktuell',
  },
].forEach(function (options) {
  var layer = L.tileLayer.wms(
    'https://gis.tirol.gv.at/arcgis/services/Service_Public/orthofoto/MapServer/WMSServer',
    {
      layers: options.id,
      format: 'image/jpeg',
      maxZoom: 20,
      attribution: attribution,
    }
  );
  layers.addBaseLayer(layer, options.title);
  allMapLayers[options.id] = layer;
});

[
  {id: 'geolandbasemap/normal', title: 'basemap.at', format: 'png'},
  {id: 'bmapgrau/normal', title: 'basemap.at Grau', format: 'png'},
  {id: 'bmaporthofoto30cm/normal', title: 'basemap.at Orthofoto', format: 'jpg'},
  {id: 'bmapgelaende/grau', title: 'basemap.at Gelände', format: 'jpg'},
].forEach(function (options) {
  var layer = L.tileLayer(
    'https://maps{s}.wien.gv.at/basemap/{layer}/google3857/{z}/{y}/{x}.{format}',
    {
      subdomains: '1234',
      layer: options.id,
      format: options.format,
      maxZoom: 19,
      attribution: [
        'Grundkarte: <a href="https://www.basemap.at/">basemap.at</a>',
        '<a href="https://creativecommons.org/licenses/by/4.0/deed.de">CC BY 4.0</a>',
      ],
    }
  );
  layers.addBaseLayer(layer, options.title);
  allMapLayers[options.id] = layer;
});

[{id: 'P_BZ_BASEMAP_TOPO', title: 'South Tyrol Base Map'}].forEach(function (options) {
  var layer = L.tileLayer(
    'http://geoservices.buergernetz.bz.it/geoserver/gwc/service/wmts/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER={layer}&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX=GoogleMapsCompatible%3A{z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg',
    {
      layer: options.id,
      maxZoom: 20,
      attribution: [].concat(attributionST, [attributionOsm]),
    }
  );
  layers.addBaseLayer(layer, options.title);
  allMapLayers[options.id] = layer;
});

[
  {
    id: 'DTM-2p5m_Hillshade,DTM_Hillshade_SolarTirol_3857',
    title: 'DTM South Tyrol',
  },
  {
    id: 'DSM-2p5m_Hillshade,DSM_Hillshade_SolarTirol_3857',
    title: 'DSM South Tyrol',
  },
].forEach(function (options) {
  var layer = L.tileLayer.wms(
    'https://geoservices.buergernetz.bz.it/geoserver/p_bz-elevation/ows',
    {
      layers: options.id,
      format: 'image/jpeg',
      attribution: attributionST_CC0,
    }
  );
  layers.addBaseLayer(layer, options.title);
  allMapLayers[options.id] = layer;
});

[
  {id: 'Orthophoto_1992_97', title: 'Orthofoto South Tyrol: 1992–1997'},
  {id: 'Orthophoto_2000', title: 'Orthofoto South Tyrol: 2000'},
  {id: 'P_BZ_OF_2011_EPSG3857', title: 'Orthofoto South Tyrol: 2011'},
  {
    id: 'P_BZ_OF_2014_2015_EPSG3857',
    title: 'Orthofoto South Tyrol: 2014–2015',
  },
  {
    id: 'p_bz-orthoimagery:Orthophoto_2011_CIR_EPSG3857,P_BZ_OF_2014_CIR_EPSG3857',
    title: 'Orthofoto South Tyrol: 2011–2014 <abbr title="photographisches Infrarot">CIR</abbr>',
  },
].forEach(function (options) {
  var layer = L.tileLayer.wms(
    'https://geoservices.buergernetz.bz.it/geoserver/p_bz-orthoimagery/ows',
    {
      layers: options.id,
      format: 'image/jpeg',
      maxZoom: 20,
      attribution: attributionST,
    }
  );
  layers.addBaseLayer(layer, options.title);
  allMapLayers[options.id] = layer;
});

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: attributionOsm,
});
layers.addBaseLayer(osm, 'OpenStreetMap');
allMapLayers['OSM'] = osm;

new LeafletHash(map, allMapLayers);
