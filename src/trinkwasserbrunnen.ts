// Trinkwasserbrunnen (drinking water fountains) from OpenStreetMap, queried live
// via the Overpass API. The data is fetched once, when the overlay is first shown.
import type {Feature, FeatureCollection, Point} from 'geojson';
import {Popup, type GeoJSONSource, type Map} from 'maplibre-gl';
import type {LayerDef} from './layer-switcher-control';

const ID = 'Trinkwasserbrunnen';

// area 3600052343 = relation 52343 = Bundesland Tirol
const QUERY = `[out:json][timeout:25];
area(id:3600052343)->.searchArea;
nwr["amenity"="drinking_water"](area.searchArea);
out center;`;

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {lat: number; lon: number};
  tags?: Record<string, string>;
}

let data: Promise<FeatureCollection> | undefined;

/** Fetch the fountains and reduce ways/relations to their center point. */
function load(): Promise<FeatureCollection> {
  data ??= fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: new URLSearchParams({data: QUERY}),
  })
    .then((response) => response.json())
    .then(({elements}: {elements: OverpassElement[]}) => ({
      type: 'FeatureCollection' as const,
      features: elements
        .map((element): Feature | undefined => {
          const lat = element.lat ?? element.center?.lat;
          const lon = element.lon ?? element.center?.lon;
          return lat === undefined || lon === undefined
            ? undefined
            : {
                type: 'Feature',
                id: `${element.type}/${element.id}`,
                geometry: {type: 'Point', coordinates: [lon, lat]},
                properties: {...element.tags, '@id': `${element.type}/${element.id}`},
              };
        })
        .filter((feature) => !!feature),
    }))
    .catch((e) => {
      data = undefined; // allow a retry on the next activation
      throw e;
    });
  return data;
}

function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

let popupsRegistered = false;

function registerPopups(map: Map): void {
  if (popupsRegistered) {
    return;
  }
  popupsRegistered = true;
  map.on('click', ID, (e) => {
    const feature = e.features?.[0];
    if (!feature) {
      return;
    }
    const {'@id': osmId, ...tags} = feature.properties as Record<string, string>;
    const rows = Object.entries(tags)
      .map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`)
      .join('');
    new Popup()
      .setLngLat((feature.geometry as Point).coordinates as [number, number])
      .setHTML(
        `<table class="tm-popup-tags">${rows}</table>` +
          `<a href="https://www.openstreetmap.org/${osmId}" target="_blank" rel="noreferrer">${osmId}</a>`,
      )
      .addTo(map);
  });
  map.on('mouseenter', ID, () => (map.getCanvas().style.cursor = 'pointer'));
  map.on('mouseleave', ID, () => (map.getCanvas().style.cursor = ''));
}

export function trinkwasserbrunnen(attribution: string): LayerDef {
  return {
    id: ID,
    title: 'Trinkwasserbrunnen',
    source: {type: 'geojson', data: {type: 'FeatureCollection', features: []}, attribution},
    layer: {
      type: 'circle',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 3, 16, 8],
        'circle-color': '#0288d1',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1.5,
      },
    },
    onAdded: (map, id) => {
      registerPopups(map);
      load().then(
        (features) => (map.getSource(id) as GeoJSONSource | undefined)?.setData(features),
        (e) => console.error(`Failed to load ${id}: ${String(e)}`),
      );
    },
  };
}
