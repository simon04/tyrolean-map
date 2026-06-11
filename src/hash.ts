// Permalink in the form `#zoom/lat/lon/layers`, originally a modified version of
// https://github.com/KoGor/leaflet-fullHash and ported to MapLibre GL.
import type {Map} from 'maplibre-gl';
import type {LayerSwitcherControl} from './layer-switcher-control';

// MapLibre renders 256px raster tiles one zoom level "lower" than Leaflet did.
// Keep storing the Leaflet-style zoom in the hash so existing permalinks keep working.
const ZOOM_OFFSET = 1;

interface ParsedHash {
  center: [number, number]; // [lng, lat]
  zoom: number; // MapLibre zoom
  layers: string[];
}

export class Hash {
  private lastHash = '';
  private movingMap = false;
  private changeTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly changeDefer = 100;

  constructor(
    private map: Map,
    private control: LayerSwitcherControl,
  ) {
    this.onHashChange = this.onHashChange.bind(this);
    this.onMapMove = this.onMapMove.bind(this);
  }

  /**
   * Start syncing. Applies the state from the current URL if present and returns
   * whether a valid permalink was applied (so the caller can pick a default otherwise).
   */
  start(): boolean {
    this.control.onChange = this.onMapMove;
    this.map.on('moveend', this.onMapMove);
    window.addEventListener('hashchange', this.onHashChange);

    const parsed = this.parseHash(location.hash);
    if (parsed) {
      this.applyParsed(parsed);
      return true;
    }
    return false;
  }

  /** Write the current map state into the URL hash. */
  save(): void {
    const hash = this.formatHash();
    if (hash !== this.lastHash) {
      this.lastHash = hash;
      location.replace(hash);
    }
  }

  private formatHash(): string {
    const {lat, lng} = this.map.getCenter();
    const zoom = Math.round(this.map.getZoom()) + ZOOM_OFFSET;
    const precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));
    const layers = this.control.getActiveIds();
    return `#${[zoom, lat.toFixed(precision), lng.toFixed(precision), layers.join(',')].join('/')}`;
  }

  private parseHash(hash: string): ParsedHash | false {
    if (hash.startsWith('#')) {
      hash = hash.slice(1);
    }
    const args = hash.split('/');
    if (args.length < 3) {
      return false;
    }
    const zoom = parseInt(args[0], 10);
    const lat = parseFloat(args[1]);
    const lon = parseFloat(args[2]);
    if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) {
      return false;
    }
    const layers = decodeURIComponent(args[3] || '')
      .split(',')
      .filter(Boolean);
    return {center: [lon, lat], zoom: zoom - ZOOM_OFFSET, layers};
  }

  private applyParsed(parsed: ParsedHash): void {
    this.movingMap = true;
    this.map.jumpTo({center: parsed.center, zoom: parsed.zoom});

    const base = parsed.layers.find((id) => this.control.isBase(id));
    const overlays = parsed.layers.filter((id) => this.control.isOverlay(id));
    this.control.setState(base, overlays);

    this.movingMap = false;
    this.lastHash = this.formatHash();
  }

  private onMapMove(): void {
    if (this.movingMap) {
      return;
    }
    this.save();
  }

  // Throttle `hashchange` handling to at most once per `changeDefer` ms.
  private onHashChange(): void {
    if (this.changeTimeout) {
      return;
    }
    this.changeTimeout = setTimeout(() => {
      this.update();
      this.changeTimeout = null;
    }, this.changeDefer);
  }

  private update(): void {
    if (location.hash === this.lastHash) {
      return;
    }
    const parsed = this.parseHash(location.hash);
    if (parsed) {
      this.applyParsed(parsed);
    } else {
      this.save();
    }
  }
}
