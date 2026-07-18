// Trinkwasserbrunnen (drinking water fountains) from OpenStreetMap, queried live
// via the Overpass API. The data is fetched once, when the overlay is first shown.
import type {Feature, FeatureCollection, Point} from 'geojson';
import {Popup, type GeoJSONSource, type Map as MapGL} from 'maplibre-gl';
import tag2link from 'tag2link';
import type {LayerDef} from './layer-switcher-control';

const ID = 'Trinkwasserbrunnen';

// area 3600052343 = relation 52343 = Bundesland Tirol
const QUERY = `[out:json][timeout:25];
area(id:3600052343)->.searchArea;
nwr["amenity"="drinking_water"](area.searchArea);
out center;`;

const OVERPASS_URL = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(QUERY)}`;

const CACHE_NAME = 'overpass';
const CACHE_MAX_AGE = 4 * 60 * 60 * 1000;

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {lat: number; lon: number};
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

let data: Promise<FeatureCollection> | undefined;

/** Fetch the fountains, reusing the cached response for up to `CACHE_MAX_AGE`. */
async function fetchOverpass(): Promise<OverpassElement[]> {
  // `caches` is undefined in insecure contexts. It expires nothing by itself,
  // hence the `date` of the cached response is compared manually.
  const cache = await globalThis.caches?.open(CACHE_NAME).catch(() => undefined);
  const cached = await cache?.match(OVERPASS_URL);
  if (cached && Date.now() - Date.parse(cached.headers.get('date') ?? '') < CACHE_MAX_AGE) {
    return ((await cached.json()) as OverpassResponse).elements;
  }

  const response = await fetch(OVERPASS_URL);
  if (!response.ok) {
    // Overpass reports overload/timeouts as an HTML document, which would fail to parse as JSON
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const {elements} = (await response.clone().json()) as OverpassResponse;
  await cache?.put(OVERPASS_URL, response); // only reached once the body parsed as JSON
  return elements;
}

/** Fetch the fountains and reduce ways/relations to their center point. */
function load(): Promise<FeatureCollection> {
  data ??= fetchOverpass()
    .then((elements) => ({
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

/** Formatter URL per OSM key, `preferred` entries winning over `normal` ones. */
const formatterUrls = new Map<string, {url: string; preferred: boolean}>();
for (const {key, url, rank} of tag2link) {
  if (rank === 'deprecated') {
    continue;
  }
  const tag = key.replace(/^Key:/, '');
  const preferred = rank === 'preferred';
  const previous = formatterUrls.get(tag);
  if (!previous || (preferred && !previous.preferred)) {
    formatterUrls.set(tag, {url, preferred});
  }
}

/** Resolve a tag to its http(s) formatter URL, if tag2link knows one for the key. */
function formatterUrl(key: string, value: string): string | undefined {
  const template = formatterUrls.get(key)?.url;
  if (!template) {
    return undefined;
  }
  try {
    // `new URL` normalizes the substituted value, e.g. it percent-encodes spaces
    const url = new URL(template.replace('$1', value));
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined; // the value does not yield a valid URL, e.g. website=example
  }
}

function link(href: string, text: string): HTMLAnchorElement {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  a.target = '_blank';
  a.rel = 'noreferrer';
  return a;
}

function popupContent(osmId: string, tags: Record<string, string>): HTMLElement {
  const dl = document.createElement('dl');
  dl.className = 'tm-popup-tags';
  for (const [key, value] of Object.entries(tags)) {
    const dt = document.createElement('dt');
    dt.textContent = key;
    dt.title = key;
    const dd = document.createElement('dd');
    dd.title = value; // the entries are truncated via CSS, so expose the full value on hover
    const href = formatterUrl(key, value);
    dd.append(href ? link(href, value) : value);
    // one `dt`/`dd` pair per line, rendered inline within the row
    const row = document.createElement('div');
    row.append(dt, dd);
    dl.append(row);
  }
  const content = document.createElement('div');
  content.append(dl, link(`https://www.openstreetmap.org/${osmId}`, osmId));
  return content;
}

let popupsRegistered = false;

function registerPopups(map: MapGL): void {
  if (popupsRegistered) {
    return;
  }
  popupsRegistered = true;
  let popup: Popup | undefined;
  map.on('click', ID, (e) => {
    const feature = e.features?.[0];
    if (!feature) {
      return;
    }
    const {'@id': osmId, ...tags} = feature.properties as Record<string, string>;
    popup = new Popup({maxWidth: 'none'}) // the popup width is governed by .tm-popup-tags
      .setLngLat((feature.geometry as Point).coordinates as [number, number])
      .setDOMContent(popupContent(osmId, tags))
      .addTo(map);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      popup?.remove();
    }
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
