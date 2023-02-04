/**
 * A Leaflet Layer Control, which may be expanded by default, but may be collapsed using a button.
 *
 * @example new CollapsableLayerControl(layers, {}, { collapsed: false })
 */
export class CollapsableLayerControl extends L.Control.Layers {
  onAdd(map: L.Map) {
    L.Control.Layers.prototype.onAdd.call(this, map);
    const div = document.createElement('div');
    div.style.textAlign = 'right';
    const bar = document.createElement('div');
    bar.classList.add('leaflet-bar');
    bar.style.cursor = 'pointer';
    bar.style.display = 'inline-block';
    const close = document.createElement('a');
    close.innerHTML = '×';
    close.title = 'Close';
    close.style.fontSize = '150%';
    close.style.height = '20px';
    close.style.lineHeight = '1';
    close.style.width = '20px';
    close.onclick = () => this.collapse();
    bar.append(close);
    div.append(bar);
    this.getContainer().querySelector('.leaflet-control-layers-list').prepend(div);
    return this.getContainer();
  }
}
