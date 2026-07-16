import maplibregl, {
  AttributionControl,
  GeolocateControl,
  Map,
  NavigationControl,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import type {CarmenGeojsonFeature, MaplibreGeocoderApi} from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import {LayerSwitcherControl, type RasterLayerDef} from './layer-switcher-control';
import {Hash} from './hash';
import './style.css';

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

function wmsTileUrl(baseUrl: string, layers: string, format?: string): string {
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    REQUEST: 'GetMap',
    VERSION: '1.1.1',
    LAYERS: layers,
    STYLES: '',
    FORMAT: format ?? 'image/jpeg',
    TRANSPARENT: 'false',
    SRS: 'EPSG:3857',
    WIDTH: '256',
    HEIGHT: '256',
  });
  // The BBOX placeholder must stay un-encoded for MapLibre to substitute it.
  return `${baseUrl}?${params.toString()}&BBOX={bbox-epsg-3857}`;
}

const baseLayers: RasterLayerDef[] = [];
const overlays: RasterLayerDef[] = [];

// Elektronische Karte Tirol (WMTS)
[
  {id: 'gdi_base_summer', title: 'Elektronische Karte Tirol: Sommer'},
  {id: 'gdi_base_winter', title: 'Elektronische Karte Tirol: Winter'},
].forEach(({id, title}) => {
  const imprint =
    '<a href="https://www.tirol.gv.at/statistik-budget/tiris/tiris-geodatendienste/impressum-elektronische-karte-tirol/">Elektronische Karte Tirol</a>';
  baseLayers.push({
    id,
    title,
    source: {
      type: 'raster',
      tiles: [`https://wmts.kartetirol.at/wmts/${id}/${id}/{z}/{x}/{y}.jpeg80`],
      tileSize: 256,
      maxzoom: 18,
      attribution: [...attribution, imprint, attributionOsm].join(', '),
    },
  });
});

// Gelände Tirol (WMS)
[
  {id: 'Image_Schummerung_Gelaendemodell', title: 'Gelände Tirol: Geländemodell'},
  {id: 'Image_Schummerung_Oberflaechenmodell', title: 'Gelände Tirol: Oberflächenmodell'},
].forEach(({id, title}) => {
  baseLayers.push({
    id,
    title,
    source: {
      type: 'raster',
      tiles: [
        wmsTileUrl(
          'https://gis.tirol.gv.at/arcgis/services/Service_Public/terrain/MapServer/WMSServer',
          id,
        ),
      ],
      tileSize: 256,
      maxzoom: 20,
      attribution: attribution.join(', '),
    },
  });
});

// Orthofoto Tirol (WMS)
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
  {id: 'Image_2019_2021', title: 'Orthofoto Tirol: 2019–2021'},
  {id: 'Image_2022', title: 'Orthofoto Tirol: 2022'},
  {id: 'Image_Aktuell_RGB', title: 'Orthofoto Tirol: aktuell'},
  {
    id: 'Image_Aktuell_CIR',
    title: 'Orthofoto Tirol: <abbr title="photographisches Infrarot">CIR</abbr> aktuell',
  },
].forEach(({id, title}) => {
  baseLayers.push({
    id,
    title,
    source: {
      type: 'raster',
      tiles: [
        wmsTileUrl(
          'https://gis.tirol.gv.at/arcgis/services/Service_Public/orthofoto/MapServer/WMSServer',
          id,
        ),
      ],
      tileSize: 256,
      maxzoom: 20,
      attribution: attribution.join(', '),
    },
  });
});

// basemap.at (XYZ)
[
  {id: 'geolandbasemap/normal', title: 'basemap.at', format: 'png'},
  {id: 'bmaphidpi/normal', title: 'basemap.at HiDPI', format: 'jpeg'},
  {id: 'bmapgrau/normal', title: 'basemap.at Grau', format: 'png'},
  {id: 'bmaporthofoto30cm/normal', title: 'basemap.at Orthofoto', format: 'jpg'},
  {id: 'bmapgelaende/grau', title: 'basemap.at Gelände', format: 'jpg'},
].forEach(({id, title, format}) => {
  baseLayers.push({
    id,
    title,
    source: {
      type: 'raster',
      tiles: [`https://mapsneu.wien.gv.at/basemap/${id}/google3857/{z}/{y}/{x}.${format}`],
      tileSize: 256,
      maxzoom: 19,
      attribution: [
        'Grundkarte: <a href="https://www.basemap.at/">basemap.at</a>',
        '<a href="https://creativecommons.org/licenses/by/4.0/deed.de">CC BY 4.0</a>',
      ].join(', '),
    },
  });
});

// South Tyrol Base Map (WMTS)
[{id: 'p_bz-BaseMap%3ABasemap-Standard', title: 'South Tyrol Base Map'}].forEach(({id, title}) => {
  baseLayers.push({
    id,
    title,
    source: {
      type: 'raster',
      tiles: [
        `https://geoservices.buergernetz.bz.it/geoserver/gwc/service/wmts/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${id}&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX=GoogleMapsCompatible%3A{z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg`,
      ],
      tileSize: 256,
      maxzoom: 20,
      attribution: [...attributionST, attributionOsm].join(', '),
    },
  });
});

// Gelände South Tyrol (WMS)
[
  {id: 'DigitalTerrainModel-0.5m-Hillshade', title: 'Gelände South Tyrol: Geländemodell 0.5m'},
  {id: 'DigitalTerrainModel-2.5m-Hillshade', title: 'Gelände South Tyrol: Geländemodell'},
  {id: 'DigitalTerrainModel-2.5m-Exposition', title: 'Gelände South Tyrol: Exposition'},
  {id: 'DigitalTerrainModel-2.5m-Slope', title: 'Gelände South Tyrol: Geländeneigung'},
].forEach(({id, title}) => {
  baseLayers.push({
    id,
    title,
    source: {
      type: 'raster',
      tiles: [wmsTileUrl('https://geoservices1.civis.bz.it/geoserver/p_bz-Elevation/wms', id)],
      tileSize: 256,
      attribution: attributionST_CC0.join(', '),
    },
  });
});

// Orthofoto South Tyrol (WMS)
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
  baseLayers.push({
    id,
    title,
    source: {
      type: 'raster',
      tiles: [
        wmsTileUrl('https://geoservices.buergernetz.bz.it/mapproxy/p_bz-Orthoimagery/wms', id),
      ],
      tileSize: 256,
      maxzoom: 20,
      attribution: attributionST.join(', '),
    },
  });
});

baseLayers.push({
  id: 'OSM',
  title: 'OpenStreetMap',
  source: {
    type: 'raster',
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    tileSize: 256,
    maxzoom: 19,
    attribution: attributionOsm,
  },
});

baseLayers.push({
  id: 'OpenTopoMap',
  title: 'OpenTopoMap',
  source: {
    type: 'raster',
    tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
    tileSize: 256,
    maxzoom: 19,
    attribution: [
      attributionOsm,
      '<a href="http://viewfinderpanoramas.org">SRTM</a>',
      'Kartendarstellung: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    ].join(', '),
  },
});

// Overlays
[
  {id: 'Image_Exposition', title: 'Gelände Tirol: Exposition'},
  {id: 'Image_Gelaendeneigung_Grad', title: 'Gelände Tirol: Geländeneigung'},
].forEach(({id, title}) => {
  overlays.push({
    id,
    title,
    source: {
      type: 'raster',
      tiles: [
        wmsTileUrl(
          'https://gis.tirol.gv.at/arcgis/services/Service_Public/terrain/MapServer/WMSServer',
          id,
        ),
      ],
      tileSize: 256,
      maxzoom: 20,
      attribution: [
        ...attribution,
        `<img src="https://gis.tirol.gv.at/arcgis/services/Service_Public/terrain/MapServer/WMSServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=${id}">`,
      ].join(', '),
    },
  });
});

overlays.push({
  id: 'OpenSlopeMap',
  title: 'OpenSlopeMap',
  paint: {'raster-opacity': 0.7},
  source: {
    type: 'raster',
    tiles: ['https://tileserver1.openslopemap.org/OSloOVERLAY_LR_All_16/{z}/{x}/{y}.png'],
    tileSize: 256,
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
});

const DEFAULT_BASE = baseLayers[0].id;

const map = new Map({
  container: 'map',
  style: {version: 8, sources: {}, layers: []},
  center: [11.3, 47.3],
  zoom: 8, // Leaflet zoom 9 with 256px tiles
  attributionControl: false,
  dragRotate: false,
});

map.addControl(new NavigationControl({showCompass: false}), 'top-left');
map.addControl(new GeolocateControl({trackUserLocation: true}), 'top-left');
map.addControl(new AttributionControl(), 'bottom-right');

// Address search via Nominatim
const geocoderApi: MaplibreGeocoderApi = {
  forwardGeocode: async ({query, limit}) => {
    const features: CarmenGeojsonFeature[] = [];
    try {
      const params = new URLSearchParams({
        q: String(query ?? ''),
        format: 'geojson',
        polygon_geojson: '0',
        addressdetails: '1',
        limit: String(limit ?? 5),
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      const geojson = await response.json();
      for (const feature of geojson.features) {
        const [minX, minY, maxX, maxY] = feature.bbox ?? [];
        features.push({
          type: 'Feature',
          id: String(feature.properties.place_id),
          geometry: feature.geometry,
          place_name: feature.properties.display_name,
          properties: feature.properties,
          text: feature.properties.display_name,
          place_type: ['place'],
          bbox: feature.bbox ? [minX, minY, maxX, maxY] : undefined,
        });
      }
    } catch (e) {
      console.error(`Failed to forwardGeocode with error: ${String(e)}`);
    }
    return {type: 'FeatureCollection', features};
  },
};
map.addControl(
  new MaplibreGeocoder(geocoderApi, {maplibregl, collapsed: true, marker: true}),
  'top-left',
);

const collapsed = window.matchMedia && window.matchMedia('all and (max-width: 700px)').matches;
const layerSwitcher = new LayerSwitcherControl(baseLayers, overlays, {collapsed});
map.addControl(layerSwitcher, 'top-right');

map.on('load', () => {
  // Show the default base layer first; a permalink may then switch/augment it.
  layerSwitcher.activate(DEFAULT_BASE);
  const hash = new Hash(map, layerSwitcher);
  hash.start();
  hash.save();
});
