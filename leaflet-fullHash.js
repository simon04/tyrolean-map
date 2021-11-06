// slightly modified version of https://github.com/KoGor/leaflet-fullHash by "KoGor"
import * as L from 'leaflet';

export default class LeafletHash {
  constructor(map, options) {
    this.map = null;
    this.lastHash = null;
    this.movingMap = false;
    this.changeDefer = 100;
    this.changeTimeout = null;
    this.isListening = false;
    this.onHashChange = L.Util.bind(this.onHashChange, this);
    if (map) {
      this.init(map, options);
    }
  }

  parseHash(hash) {
    if (hash.indexOf('#') === 0) {
      hash = hash.substr(1);
    }
    const args = hash.split('/');
    if (args.length >= 3) {
      const zoom = parseInt(args[0], 10),
        lat = parseFloat(args[1]),
        lon = parseFloat(args[2]),
        layers = decodeURIComponent(args[3] || '');
      if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) {
        return false;
      } else {
        return {
          center: new L.LatLng(lat, lon),
          zoom: zoom,
          layers: layers,
        };
      }
    } else {
      return false;
    }
  }

  formatHash(map) {
    const center = map.getCenter(),
      zoom = map.getZoom(),
      precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2)),
      layers = [];

    const options = this.options;
    //Check active layers
    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        if (map.hasLayer(options[key])) {
          layers.push(key);
        }
      }
    }

    return (
      '#' +
      [zoom, center.lat.toFixed(precision), center.lng.toFixed(precision), layers.join(',')].join(
        '/'
      )
    );
  }

  init(map, options) {
    this.map = map;
    L.Util.setOptions(this, options);

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

    if (this.movingMap || !this.map._loaded) {
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
      const layers = parsed.layers, options = this.options, that = this;
      //Add/remove layers
      if (layers && options[layers]) {
        this.map.eachLayer((layer) => that.map.removeLayer(layer));
        that.map.addLayer(options[layers]);
      }

      this.movingMap = false;
    } else {
      this.onMapMove(this.map);
    }
  }

  // defer hash change updates every 100ms
  onHashChange() {
    // throttle calls to update() so that they only happen every
    // `changeDefer` ms
    if (!this.changeTimeout) {
      const that = this;
      this.changeTimeout = setTimeout(() => {
        that.update();
        that.changeTimeout = null;
      }, this.changeDefer);
    }
  }

  startListening() {
    this.map.on('moveend layeradd layerremove', this.onMapMove, this);
    L.DomEvent.addListener(window, 'hashchange', this.onHashChange);
    this.isListening = true;
  }

  stopListening() {
    this.map.off('moveend layeradd layerremove', this.onMapMove, this);
    L.DomEvent.removeListener(window, 'hashchange', this.onHashChange);
    this.isListening = false;
  }
}
