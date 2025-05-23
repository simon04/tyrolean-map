// slightly modified version of https://github.com/KoGor/leaflet-fullHash by "KoGor"
import {LatLng, Util} from 'leaflet';

export default class LeafletHash {
  map: L.Map = null;
  options: Record<string, L.Layer> = {};
  lastHash = null;
  movingMap = false;
  changeDefer = 100;
  changeTimeout = null;
  isListening = false;
  constructor(map: L.Map, options: Record<string, L.Layer>) {
    this.onHashChange = this.onHashChange.bind(this);
    if (map) {
      this.init(map, options);
    }
  }

  parseHash(hash: string) {
    if (hash.indexOf('#') === 0) {
      hash = hash.substr(1);
    }
    const args = hash.split('/');
    if (args.length >= 3) {
      const zoom = parseInt(args[0], 10);
      const lat = parseFloat(args[1]);
      const lon = parseFloat(args[2]);
      const layers = decodeURIComponent(args[3] || '').split(',');
      if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) {
        return false;
      } else {
        return {
          center: new LatLng(lat, lon),
          zoom: zoom,
          layers: layers,
        };
      }
    } else {
      return false;
    }
  }

  formatHash(map: L.Map) {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));
    const layers = [];

    const options = this.options;
    //Check active layers
    Object.keys(options).forEach((key) => {
      if (map.hasLayer(options[key])) {
        layers.push(key);
      }
    });

    return (
      '#' +
      [zoom, center.lat.toFixed(precision), center.lng.toFixed(precision), layers.join(',')].join(
        '/',
      )
    );
  }

  init(map: L.Map, options: Record<string, L.Layer>) {
    this.map = map;
    Util.setOptions(this, options);

    // reset the hash
    this.lastHash = null;
    this.onHashChange();

    if (!this.isListening) {
      this.startListening();
    }
  }

  removeFrom() {
    if (this.changeTimeout) {
      clearTimeout(this.changeTimeout);
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.map = null;
  }

  onMapMove() {
    // bail if we're moving the map (updating from a hash),
    // or if the map is not yet loaded

    if (this.movingMap || !(this.map as any)._loaded) {
      return false;
    }

    const hash = this.formatHash(this.map);
    if (this.lastHash != hash) {
      location.replace(hash);
      this.lastHash = hash;
    }
  }

  update() {
    const hash = location.hash;
    if (hash === this.lastHash) {
      return;
    }
    const parsed = this.parseHash(hash);
    if (parsed) {
      this.movingMap = true;

      this.map.setView(parsed.center, parsed.zoom);
      const layers = parsed.layers;
      const options = this.options;

      if (Array.isArray(layers) && layers.every((l) => options[l])) {
        this.map.eachLayer((layer) => this.map.removeLayer(layer));
        layers.forEach((l) => this.map.addLayer(options[l]));
      }

      this.movingMap = false;
    } else {
      this.onMapMove();
    }
  }

  // defer hash change updates every 100ms
  onHashChange() {
    // throttle calls to update() so that they only happen every
    // `changeDefer` ms
    if (!this.changeTimeout) {
      this.changeTimeout = setTimeout(() => {
        this.update();
        this.changeTimeout = null;
      }, this.changeDefer);
    }
  }

  startListening() {
    this.map.on('moveend layeradd layerremove', this.onMapMove, this);
    window.addEventListener('hashchange', this.onHashChange);
    this.isListening = true;
  }

  stopListening() {
    this.map.off('moveend layeradd layerremove', this.onMapMove, this);
    window.removeEventListener('hashchange', this.onHashChange);
    this.isListening = false;
  }
}
