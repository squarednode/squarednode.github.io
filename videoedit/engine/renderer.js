import { svgEl, makeAsset, getAssetLibrary, setMouthShape } from './assetFactory.js';

export class Renderer {
  constructor(stage) {
    this.stage = stage;
    this.sceneRoot = svgEl('g', { id: 'sceneRoot' });
    this.stage.appendChild(this.sceneRoot);
    this.actors = new Map();
    this.camera = { x: 0, y: 0, zoom: 1 };
  }

  clear() {
    this.sceneRoot.replaceChildren();
    this.actors.clear();
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.applyCamera();
  }

  buildShot(shot) {
    this.clear();
    this.drawEnvironment(shot.environment || {});
    this.setCamera(shot.camera || { position: [0,0], zoom: 1 });
    for (const actor of shot.actors || []) this.addActor(actor);
    this.sortDepth();
  }

  drawEnvironment(environment = {}) {
    const sky = svgEl('rect', { x: -2000, y: -900, width: 5000, height: 2200, fill: environment.sky || '#dff4ff', 'data-depth': -100 });
    this.sceneRoot.appendChild(sky);

    const far = svgEl('g', { 'data-depth': 0, 'data-layer': 'far' });
    far.appendChild(svgEl('path', { d: 'M-200 405 C120 330 310 355 545 412 C750 460 950 320 1480 395 L1480 720 L-200 720 Z', fill: environment.farGround || '#78c16a' }));
    far.appendChild(svgEl('path', { d: 'M730 360 C830 155 1000 155 1120 360', fill: 'none', stroke: '#545b69', 'stroke-width': 14, 'stroke-linecap': 'round', opacity: 0.58 }));
    far.appendChild(svgEl('circle', { cx: 930, cy: 255, r: 20, fill: '#c4333a', stroke: '#111', 'stroke-width': 4, opacity: 0.62 }));
    this.sceneRoot.appendChild(far);

    const mid = svgEl('g', { 'data-depth': 1, 'data-layer': 'mid' });
    if (environment.asset === 'park_entry_day') {
      mid.appendChild(svgEl('path', { d: 'M90 395 L210 245 L330 395 Z', fill: '#ffe18a', stroke: '#111', 'stroke-width': 6 }));
      mid.appendChild(svgEl('rect', { x: 125, y: 395, width: 170, height: 105, fill: '#f6a55c', stroke: '#111', 'stroke-width': 6 }));
      mid.appendChild(svgEl('path', { d: 'M515 385 C550 250 735 250 770 385 L770 500 L515 500 Z', fill: '#e1efff', stroke: '#111', 'stroke-width': 7 }));
      mid.appendChild(svgEl('text', { x: 545, y: 360, 'font-size': 44, 'font-family': 'Arial Black, Arial', fill: '#111' }, [document.createTextNode('PARK')]))
    }
    mid.appendChild(svgEl('path', { d: 'M-200 485 C120 430 425 445 670 490 C890 535 1060 455 1480 500 L1480 720 L-200 720 Z', fill: environment.ground || '#9dd77d' }));
    this.sceneRoot.appendChild(mid);

    const near = svgEl('g', { 'data-depth': 2, 'data-layer': 'near' });
    near.appendChild(svgEl('path', { d: 'M-200 625 C210 575 440 575 650 620 C860 665 1050 590 1480 625 L1480 720 L-200 720 Z', fill: '#56504b', opacity: 0.32 }));
    near.appendChild(svgEl('path', { d: 'M-200 690 C260 640 480 645 720 690 C940 730 1130 660 1480 705 L1480 760 L-200 760 Z', fill: '#4d473f', opacity: 0.28 }));
    this.sceneRoot.appendChild(near);
  }

  addActor(actor) {
    const rig = makeAsset(actor);
    const [x, y, z = 1] = actor.position || [0, 0, 1];
    const scale = actor.scale ?? 1;
    rig.root.setAttribute('transform', `translate(${x} ${y}) scale(${scale})`);
    rig.root.dataset.z = z;
    rig.root.dataset.asset = actor.asset;
    rig.state = { id: actor.id, asset: actor.asset, x, y, z, scale, opacity: actor.opacity ?? 1, expression: actor.expression || 'happy', baseY: y, type: rig.type };
    rig.root.setAttribute('opacity', rig.state.opacity);
    this.sceneRoot.appendChild(rig.root);
    this.actors.set(actor.id, rig);
    this.setExpression(actor.id, rig.state.expression);
  }

  setActorPosition(id, x, y, z) {
    const rig = this.actors.get(id);
    if (!rig) return;
    rig.state.x = x; rig.state.y = y;
    if (z !== undefined) rig.state.z = z;
    rig.root.dataset.z = rig.state.z;
    rig.root.setAttribute('transform', `translate(${rig.state.x} ${rig.state.y}) scale(${rig.state.scale})`);
  }

  setActorScale(id, scale) {
    const rig = this.actors.get(id);
    if (!rig) return;
    rig.state.scale = scale;
    rig.root.setAttribute('transform', `translate(${rig.state.x} ${rig.state.y}) scale(${rig.state.scale})`);
  }

  setPartAngle(actorId, partName, angle) {
    const rig = this.actors.get(actorId);
    const part = rig?.parts?.[partName];
    if (!part) return;
    part.angle = angle;
    const [px, py] = part.pivot;
    part.el.setAttribute('transform', `rotate(${angle} ${px} ${py})`);
  }

  setExpression(actorId, expression) {
    const rig = this.actors.get(actorId);
    if (!rig) return;
    rig.state.expression = expression;
    for (const el of rig.root.querySelectorAll('[data-expression]')) {
      el.setAttribute('opacity', el.dataset.expression === expression ? '1' : '0');
    }
    // V17 fix: characters use one mouth part controlled by expression/mouth commands,
    // avoiding stacked base/expression mouths.
    if (rig.parts?.mouth) this.setMouth(actorId, expression);
  }

  setMouth(actorId, shape) {
    setMouthShape(this.actors.get(actorId), shape);
  }

  setOpacity(actorId, opacity) {
    const rig = this.actors.get(actorId);
    if (!rig) return;
    rig.state.opacity = opacity;
    rig.root.setAttribute('opacity', opacity);
  }

  setCamera(camera) {
    const position = camera.position || [camera.x || 0, camera.y || 0];
    this.camera = { x: position[0] || 0, y: position[1] || 0, zoom: camera.zoom || 1 };
    this.applyCamera();
  }

  applyCamera() {
    const { x, y, zoom } = this.camera;
    this.sceneRoot.setAttribute('transform', `translate(${640} ${360}) scale(${zoom}) translate(${-640 - x} ${-360 - y})`);
    for (const node of this.sceneRoot.children) {
      const depth = Number(node.dataset.depth || node.dataset.z || 1);
      const parallax = node.dataset.layer === 'far' ? 0.35 : node.dataset.layer === 'mid' ? 0.7 : node.dataset.layer === 'near' ? 1.05 : 1;
      if (node.dataset.layer) node.setAttribute('transform', `translate(${x * (1 - parallax)} ${y * (1 - parallax)})`);
      node.dataset.sortKey = depth;
    }
  }

  sortDepth() {
    const nodes = [...this.sceneRoot.children];
    nodes.sort((a, b) => Number(a.dataset.z || a.dataset.depth || 0) - Number(b.dataset.z || b.dataset.depth || 0));
    for (const node of nodes) this.sceneRoot.appendChild(node);
  }

  getAssetLibrary() {
    return getAssetLibrary();
  }
}
