import type {IControl, Map, RasterSourceSpecification, RasterLayerSpecification} from 'maplibre-gl';

export interface RasterLayerDef {
  /** Stable key, used as the MapLibre source/layer id and in the URL hash. */
  id: string;
  /** Human readable label (may contain HTML such as `<abbr>`). */
  title: string;
  source: RasterSourceSpecification;
  paint?: RasterLayerSpecification['paint'];
}

export interface LayerSwitcherOptions {
  collapsed?: boolean;
}

const LAYERS_ICON =
  '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
  '<path fill="currentColor" d="M12 2 1 8l11 6 11-6-11-6zm0 2.3L18.9 8 12 11.7 5.1 8 12 4.3zM1 13l11 6 11-6-2.1-1.2L12 16.7 3.1 11.8 1 13zm0 4 11 6 11-6-2.1-1.2L12 20.7 3.1 15.8 1 17z"/>' +
  '</svg>';

/**
 * A MapLibre layer switcher: radio buttons for mutually-exclusive base layers
 * and checkboxes for overlays. Owns the active state and applies all source/layer
 * mutations on the map. The panel may be collapsed to a single button.
 */
export class LayerSwitcherControl implements IControl {
  private map!: Map;
  private container!: HTMLElement;
  private inputs = new globalThis.Map<string, HTMLInputElement>();
  private activeBase = '';
  private activeOverlays = new Set<string>();

  /** Invoked whenever the active layers change through this control. */
  onChange?: () => void;

  constructor(
    private baseLayers: RasterLayerDef[],
    private overlays: RasterLayerDef[],
    private options: LayerSwitcherOptions = {},
  ) {}

  onAdd(map: Map): HTMLElement {
    this.map = map;

    const container = (this.container = document.createElement('div'));
    container.className = 'maplibregl-ctrl maplibregl-ctrl-group tm-layer-switcher';
    container.addEventListener('wheel', (e) => e.stopPropagation());

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'tm-layer-switcher-toggle';
    toggle.title = 'Layers';
    toggle.setAttribute('aria-label', 'Layers');
    toggle.innerHTML = LAYERS_ICON;
    toggle.addEventListener('click', () => this.setCollapsed(false));
    container.append(toggle);

    const panel = document.createElement('div');
    panel.className = 'tm-layer-switcher-panel';

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'tm-layer-switcher-close';
    close.title = 'Close';
    close.setAttribute('aria-label', 'Close');
    close.innerHTML = '×';
    close.addEventListener('click', () => this.setCollapsed(true));
    panel.append(close);

    panel.append(this.buildSection(this.baseLayers, 'base'));
    if (this.overlays.length) {
      const separator = document.createElement('div');
      separator.className = 'tm-layer-switcher-separator';
      panel.append(separator);
      panel.append(this.buildSection(this.overlays, 'overlay'));
    }
    container.append(panel);

    this.setCollapsed(this.options.collapsed ?? false);
    return container;
  }

  onRemove(): void {
    this.container.remove();
  }

  // --- public API used by the hash permalink ---------------------------------

  isBase(id: string): boolean {
    return this.baseLayers.some((d) => d.id === id);
  }

  isOverlay(id: string): boolean {
    return this.overlays.some((d) => d.id === id);
  }

  /** Active layer ids, base first, in the order overlays were enabled. */
  getActiveIds(): string[] {
    return [this.activeBase, ...this.activeOverlays].filter(Boolean);
  }

  /** Select a base layer (used for the initial default). */
  activate(baseId: string): void {
    this.selectBase(baseId);
  }

  /** Apply a complete state, reconciling base and overlays. */
  setState(baseId: string | undefined, overlayIds: string[]): void {
    if (baseId && this.isBase(baseId)) {
      this.selectBase(baseId);
    }
    for (const id of [...this.activeOverlays]) {
      if (!overlayIds.includes(id)) {
        this.setOverlay(id, false);
      }
    }
    for (const id of overlayIds) {
      if (this.isOverlay(id)) {
        this.setOverlay(id, true);
      }
    }
  }

  // --- internals -------------------------------------------------------------

  private buildSection(defs: RasterLayerDef[], kind: 'base' | 'overlay'): HTMLElement {
    const section = document.createElement('div');
    section.className = 'tm-layer-switcher-section';
    for (const def of defs) {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = kind === 'base' ? 'radio' : 'checkbox';
      if (kind === 'base') {
        input.name = 'tm-base-layer';
      }
      input.value = def.id;
      input.addEventListener('change', () => {
        if (kind === 'base') {
          if (input.checked) {
            this.selectBase(def.id);
          }
        } else {
          this.setOverlay(def.id, input.checked);
        }
        this.onChange?.();
      });
      this.inputs.set(def.id, input);

      const text = document.createElement('span');
      text.innerHTML = ` ${def.title}`;
      label.append(input, text);
      section.append(label);
    }
    return section;
  }

  private find(id: string): RasterLayerDef | undefined {
    return this.baseLayers.find((d) => d.id === id) ?? this.overlays.find((d) => d.id === id);
  }

  /** First active overlay layer, used to keep the base layer below all overlays. */
  private firstOverlayId(): string | undefined {
    return [...this.activeOverlays][0];
  }

  private selectBase(id: string): void {
    if (this.activeBase === id) {
      return;
    }
    if (this.activeBase) {
      this.map.removeLayer(this.activeBase);
      this.map.removeSource(this.activeBase);
    }
    this.activeBase = id;
    this.addRasterLayer(id, this.firstOverlayId());

    const input = this.inputs.get(id);
    if (input) {
      input.checked = true;
    }
  }

  private setOverlay(id: string, enabled: boolean): void {
    const active = this.activeOverlays.has(id);
    if (enabled && !active) {
      this.addRasterLayer(id); // on top of everything
      this.activeOverlays.add(id);
    } else if (!enabled && active) {
      this.map.removeLayer(id);
      this.map.removeSource(id);
      this.activeOverlays.delete(id);
    }
    const input = this.inputs.get(id);
    if (input) {
      input.checked = this.activeOverlays.has(id);
    }
  }

  private addRasterLayer(id: string, beforeId?: string): void {
    const def = this.find(id);
    if (!def) {
      return;
    }
    this.map.addSource(id, def.source);
    this.map.addLayer(
      {id, type: 'raster', source: id, ...(def.paint ? {paint: def.paint} : {})},
      beforeId,
    );
  }

  private setCollapsed(collapsed: boolean): void {
    this.container.classList.toggle('tm-collapsed', collapsed);
  }
}
