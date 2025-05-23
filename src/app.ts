import {Map, Icon, Layer, TileLayer} from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {Geocoder as GeocoderControl} from 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/style.css';
import {LocateControl} from 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';
import LeafletHash from './leaflet-fullHash';
import {CollapsableLayerControl} from './leaflet-collapsable-layer-control';
import './style.css';

const map = new Map('map').setView([47.3, 11.3], 9);

map.attributionControl.setPrefix(false);
const collapsed = window.matchMedia && window.matchMedia('all and (max-width: 700px)').matches;
const layers = new CollapsableLayerControl({}, {}, {collapsed: collapsed}).addTo(map);

delete (Icon.Default.prototype as any)._getIconUrl;
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

new GeocoderControl({
  position: 'topleft',
}).addTo(map);

new LocateControl({
  icon: 'tm-marker',
  iconLoading: 'tm-marker',
}).addTo(map);

const attribution = [
  '<a href="https://github.com/simon04/tyrolean-map">Tyrolean Map</a> (Simon Legner)',
  '<a href="https://www.tirol.gv.at/data/">data.tirol.gv.at</a>',
  '<a href="https://www.tirol.gv.at/data/nutzungsbedingungen/">CC BY 3.0 AT</a>',
];
const attributionST = [
  '<a href="https://github.com/simon04/tyrolean-map">Tyrolean Map</a> (Martin Raifer)',
  '<a href="https://geoportal.buergernetz.bz.it/">geoportal.buergernetz.bz.it</a>',
  '<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>',
];
const attributionST_CC0 = [
  '<a href="https://github.com/simon04/tyrolean-map">Tyrolean Map</a> (Martin Raifer)',
  '<a href="https://geoportal.buergernetz.bz.it/">geoportal.buergernetz.bz.it</a>',
  '<a href="https://creativecommons.org/publicdomain/zero/1.0/deed">CC0</a>',
];
const attributionOsm = '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> (ODbL)';

const allMapLayers: Record<string, Layer> = {};

[
  {id: 'gdi_base_summer', title: 'Elektronische Karte Tirol: Sommer'},
  {id: 'gdi_base_winter', title: 'Elektronische Karte Tirol: Winter'},
].forEach(({id, title}, idx) => {
  const imprint =
    '<a href="https://www.tirol.gv.at/statistik-budget/tiris/tiris-geodatendienste/impressum-elektronische-karte-tirol/">Elektronische Karte Tirol</a>';
  const layer = new TileLayer(`https://wmts.kartetirol.at/wmts/${id}/${id}/{z}/{x}/{y}.jpeg80`, {
    maxZoom: 18,
    attribution: [...attribution, imprint, attributionOsm].join(', '),
  });
  idx === 0 && layer.addTo(map);
  layers.addBaseLayer(layer, title);
  allMapLayers[id] = layer;
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
].forEach(({id, title}) => {
  const layer = new TileLayer.WMS(
    'https://gis.tirol.gv.at/arcgis/services/Service_Public/terrain/MapServer/WMSServer',
    {
      layers: id,
      format: 'image/jpeg',
      maxZoom: 20,
      attribution: attribution.join(', '),
    },
  );
  layers.addBaseLayer(layer, title);
  allMapLayers[id] = layer;
});

// https://gis.tirol.gv.at/arcgis/services/Service_Public/orthofoto/MapServer/WMSServer?request=GetCapabilities&service=WMS
[
  {id: 'Image_1940', title: 'Orthofoto Tirol: 1940 (Innsbruck)'},
  {id: 'Image_1949_1954', title: 'Orthofoto Tirol: 1949–1954 (Paznauntal)'},
  {id: 'Image_1970_1982', title: 'Orthofoto Tirol: 1970–1982'},
  {id: 'Image_1999_2004', title: 'Orthofoto Tirol: 1999–2004'},
  {id: 'Image_2004_2009', title: 'Orthofoto Tirol: 2004–2009'},
  {id: 'Image_2009_2012', title: 'Orthofoto Tirol: 2009–2012'},
  {id: 'Image_2013_2015', title: 'Orthofoto Tirol: 2013–2015'},
  {id: 'Image_2016_2018', title: 'Orthofoto Tirol: 2016–2018'},
  {id: 'Image_2019_2020', title: 'Orthofoto Tirol: 2019–2020'},
  {id: 'Image_Aktuell_RGB', title: 'Orthofoto Tirol: aktuell'},
  {
    id: 'Image_Aktuell_CIR',
    title: 'Orthofoto Tirol: <abbr title="photographisches Infrarot">CIR</abbr> aktuell',
  },
].forEach(({id, title}) => {
  const layer = new TileLayer.WMS(
    'https://gis.tirol.gv.at/arcgis/services/Service_Public/orthofoto/MapServer/WMSServer',
    {
      layers: id,
      format: 'image/jpeg',
      maxZoom: 20,
      attribution: attribution.join(', '),
    },
  );
  layers.addBaseLayer(layer, title);
  allMapLayers[id] = layer;
});

[
  {id: 'geolandbasemap/normal', title: 'basemap.at', format: 'png'},
  {id: 'bmaphidpi/normal', title: 'basemap.at HiDPI', format: 'jpeg'},
  {id: 'bmapgrau/normal', title: 'basemap.at Grau', format: 'png'},
  {id: 'bmaporthofoto30cm/normal', title: 'basemap.at Orthofoto', format: 'jpg'},
  {id: 'bmapgelaende/grau', title: 'basemap.at Gelände', format: 'jpg'},
].forEach(({id, title, format}) => {
  const layer = new TileLayer(
    `https://mapsneu.wien.gv.at/basemap/${id}/google3857/{z}/{y}/{x}.${format}`,
    {
      subdomains: '1234',
      maxZoom: 19,
      attribution: [
        'Grundkarte: <a href="https://www.basemap.at/">basemap.at</a>',
        '<a href="https://creativecommons.org/licenses/by/4.0/deed.de">CC BY 4.0</a>',
      ].join(', '),
    },
  );
  layers.addBaseLayer(layer, title);
  allMapLayers[id] = layer;
});

[{id: 'p_bz-BaseMap%3ABasemap-Standard', title: 'South Tyrol Base Map'}].forEach(({id, title}) => {
  const layer = new TileLayer(
    `https://geoservices.buergernetz.bz.it/geoserver/gwc/service/wmts/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${id}&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX=GoogleMapsCompatible%3A{z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg`,
    {
      maxZoom: 20,
      attribution: [...attributionST, attributionOsm].join(', '),
    },
  );
  layers.addBaseLayer(layer, title);
  allMapLayers[id] = layer;
});

[
  {
    id: 'DigitalTerrainModel-0.5m-Hillshade',
    title: 'Gelände South Tyrol: Geländemodell 0.5m',
  },
  {
    id: 'DigitalTerrainModel-2.5m-Hillshade',
    title: 'Gelände South Tyrol: Geländemodell',
    // Hillshade/Schummerung/Ombreggiatura
  },
  {
    id: 'DigitalTerrainModel-2.5m-Exposition',
    title: 'Gelände South Tyrol: Exposition',
    // Exposition/Esposizione
  },
  {
    id: 'DigitalTerrainModel-2.5m-Slope',
    title: 'Gelände South Tyrol: Geländeneigung',
    // Slope/Hangneigung/Clivometria
  },
].forEach(({id, title}) => {
  const layer = new TileLayer.WMS('https://geoservices1.civis.bz.it/geoserver/p_bz-Elevation/wms', {
    layers: id,
    format: 'image/jpeg',
    attribution: attributionST_CC0.join(', '),
  });
  layers.addBaseLayer(layer, title);
  allMapLayers[id] = layer;
});

[
  {id: 'Aerial-1982-1985-BW', title: 'Orthofoto South Tyrol: 1982–1985'},
  {id: 'Aerial-1992-1997-BW', title: 'Orthofoto South Tyrol: 1992–1997'},
  {id: 'Aerial-1999-RGB', title: 'Orthofoto South Tyrol: 1999'},
  {id: 'Aerial-2003-BW', title: 'Orthofoto South Tyrol: 2003'},
  {id: 'Aerial-2006-RGB', title: 'Orthofoto South Tyrol: 2006'},
  {id: 'Aerial-2011-AgEA-RGB', title: 'Orthofoto South Tyrol: 2011'},
  {
    id: 'Aerial-2011-AgEA-CIR',
    title: 'Orthofoto South Tyrol: 2011 <abbr title="photographisches Infrarot">CIR</abbr>',
  },
  {id: 'Aerial-2014-RGB', title: 'Orthofoto South Tyrol: 2014'},
  {id: 'Aerial-2017-RGB', title: 'Orthofoto South Tyrol: 2017'},
  {id: 'Aerial-2020-RGB', title: 'Orthofoto South Tyrol: 2020'},
  {id: 'Aerial-2023-RGB', title: 'Orthofoto South Tyrol: 2023'},
  {
    id: 'Aerial-2023-CIR',
    title: 'Orthofoto South Tyrol: 2023 <abbr title="photographisches Infrarot">CIR</abbr>',
  },
].forEach(({id, title}) => {
  const layer = new TileLayer.WMS(
    'https://geoservices.buergernetz.bz.it/mapproxy/p_bz-Orthoimagery/wms',
    {
      layers: id,
      format: 'image/jpeg',
      maxZoom: 20,
      attribution: attributionST.join(', '),
    },
  );
  layers.addBaseLayer(layer, title);
  allMapLayers[id] = layer;
});

allMapLayers['OSM'] = new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: attributionOsm,
});
layers.addBaseLayer(allMapLayers['OSM'], 'OpenStreetMap');

allMapLayers['OpenTopoMap'] = new TileLayer('https://tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: [
    attributionOsm,
    '<a href="http://viewfinderpanoramas.org">SRTM</a>',
    'Kartendarstellung: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  ].join(', '),
});
layers.addBaseLayer(allMapLayers['OpenTopoMap'], 'OpenTopoMap');

[
  {
    id: 'Image_Exposition',
    title: 'Gelände Tirol: Exposition',
  },
  {
    id: 'Image_Gelaendeneigung_Grad',
    title: 'Gelände Tirol: Geländeneigung',
  },
].forEach(({id, title}) => {
  const layer = new TileLayer.WMS(
    'https://gis.tirol.gv.at/arcgis/services/Service_Public/terrain/MapServer/WMSServer',
    {
      layers: id,
      format: 'image/jpeg',
      maxZoom: 20,
      attribution: [
        ...attribution,
        `<img src="https://gis.tirol.gv.at/arcgis/services/Service_Public/terrain/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=${id}">`,
      ].join(', '),
    },
  );
  layers.addOverlay(layer, title);
  allMapLayers[id] = layer;
});

allMapLayers['OpenSlopeMap'] = new TileLayer(
  'https://tileserver{s}.openslopemap.org/OSloOVERLAY_LR_All_16/{z}/{x}/{y}.png',
  {
    opacity: 0.7,
    subdomains: '1234',
    attribution:
      '<a href="https://www.openslopemap.org/projekt/lizenzen/">OpenSlopeMap</a> (<a href="https://creativecommons.org/licenses/by-sa/4.0/">CC-BY-SA</a>)' +
      '<div class="legend">' +
      '<i style="color:#FFFFFF">■</i> 0°–9°, ' +
      '<i style="color:#00FF00">■</i> 10°–29°, ' +
      '<i style="color:#F0E100">■</i> 30°–34°, ' +
      '<i style="color:#FF9B00">■</i> 35°–39°, ' +
      '<i style="color:#FF0000">■</i> 40°–42°, ' +
      '<i style="color:#FF26FF">■</i> 43°–45°, ' +
      '<i style="color:#A719FF">■</i> 46°–49°, ' +
      '<i style="color:#6E00FF">■</i> 50°–54°, ' +
      '<i style="color:#0000FF">■</i> 55°–90°' +
      '</div>',
  },
);
layers.addOverlay(allMapLayers['OpenSlopeMap'], 'OpenSlopeMap');

new LeafletHash(map, allMapLayers);
