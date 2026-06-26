const NS = 'http://www.w3.org/2000/svg';

const CORE_ASSET_LIBRARY = [
  { id: 'creature_trex', type: 'creature', category: 'creatures', subcategory: 'dinosaur', label: 'Rigged T-Rex Creature', factory: 'creature_trex', source: 'core-fallback', rigType: 'creature_basic', scaleClass: 'creature_standard', artboard: [600, 500], groundPoint: [275, 480], anchors: { ground: [275, 480], head: [210, 105], mouth: [115, 150], leftHand: [166, 288], rightHand: [201, 288], tailTip: [555, 120] }, motions: ['idle','enter','exit','walk','wave','talk','look','expression','mouth','gesture','scale'], rig: ['head','jaw','leftArm','rightArm','leftLeg','rightLeg','tail'], expressions: { happy: {}, angry: {}, surprised: {} }, phonemes: { rest: 'smile', A: 'open', E: 'wide', O: 'o', M: 'neutral' }, tags: ['creature','dinosaur','simple'] },
  { id: 'human_guest_basic', type: 'character', category: 'characters', subcategory: 'guest', label: 'Rigged Park Guest', factory: 'human_guest_basic', source: 'core-fallback', rigType: 'humanoid_basic', scaleClass: 'character_standard', artboard: [300, 400], groundPoint: [150, 400], anchors: { ground: [150, 400], head: [175, 80], mouth: [175, 102], hat: [175, 35], leftHand: [105, 220], rightHand: [247, 220] }, motions: ['idle','enter','exit','walk','wave','talk','look','expression','mouth','gesture','scale'], rig: ['head','mouth','leftUpperArm','rightUpperArm','leftLeg','rightLeg'], expressions: { happy: {}, neutral: {}, surprised: {} }, phonemes: { rest: 'smile', A: 'open', E: 'wide', O: 'o', M: 'neutral' }, wardrobe: ['shirtColor','pantsColor','hatColor'], tags: ['human','guest','wardrobe'] },
  { id: 'ride_coaster_track', type: 'ride', category: 'rides', subcategory: 'coaster_track', label: 'Coaster Track', factory: 'ride_coaster_track', source: 'core-fallback', rigType: 'scenic_ride_static', scaleClass: 'ride_large', artboard: [900, 520], groundPoint: [450, 500], anchors: { ground: [450, 500], trackStart: [20, 380], trackEnd: [1010, 260] }, motions: ['idle','gesture','scale'], rig: [], expressions: {}, tags: ['ride','track','background'] },
  { id: 'vehicle_cart_basic', type: 'vehicle', category: 'vehicles', subcategory: 'ride_vehicle', label: 'Rigged Ride Cart', factory: 'vehicle_cart_basic', source: 'core-fallback', rigType: 'wheeled_vehicle_basic', scaleClass: 'vehicle_standard', artboard: [500, 300], groundPoint: [250, 250], anchors: { ground: [165, 245], seat: [165, 120], wheelRear: [95, 215], wheelFront: [230, 215] }, motions: ['idle','enter','exit','drive','rollWheels','bob','gesture','scale'], rig: ['frontWheel','rearWheel'], expressions: {}, tags: ['vehicle','wheels'] },
  { id: 'prop_sign_arrow', type: 'prop', category: 'props', subcategory: 'signage', label: 'Arrow Sign Prop', factory: 'prop_sign_arrow', source: 'core-fallback', rigType: 'prop_basic', scaleClass: 'prop_standard', artboard: [220, 220], groundPoint: [110, 220], anchors: { ground: [102, 365], signText: [150, 125] }, motions: ['idle','gesture','bob','scale'], rig: ['sign'], expressions: {}, tags: ['prop','sign'] }
];

const assetRegistry = new Map(CORE_ASSET_LIBRARY.map(asset => [asset.id, asset]));
export let ASSET_LIBRARY = [...assetRegistry.values()];

export function registerAssetPacks(packs = []) {
  for (const pack of packs) {
    for (const asset of pack.assets || []) {
      assetRegistry.set(asset.id, {
        ...asset,
        packId: pack.id,
        packLabel: pack.label,
        packVersion: pack.version,
        style: asset.style || pack.style,
        source: asset.source || 'asset-pack'
      });
    }
  }
  ASSET_LIBRARY = [...assetRegistry.values()].sort((a, b) => `${a.category || a.type}-${a.id}`.localeCompare(`${b.category || b.type}-${b.id}`));
  return ASSET_LIBRARY;
}

export function getAssetLibrary() {
  return ASSET_LIBRARY;
}

export function getAssetManifest(assetId) {
  return assetRegistry.get(assetId);
}

export function svgEl(tag, attrs = {}, children = []) {
  const el = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null) el.setAttribute(key, String(value));
  }
  for (const child of children) el.appendChild(child);
  return el;
}

export function makeAsset(actor) {
  const manifest = assetRegistry.get(actor.asset);
  const mergedActor = { ...(manifest?.defaults || {}), ...actor, manifest };

  if (manifest?.mode === 'external-svg') return makeExternalSvgAsset(mergedActor, manifest);

  const factory = manifest?.factory || actor.asset;
  switch (factory) {
    case 'human_guest_basic': return makeRiggedHuman(mergedActor);
    case 'ride_coaster_track': return makeCoasterIcon(mergedActor);
    case 'vehicle_cart_basic': return makeRideCart(mergedActor);
    case 'prop_sign_arrow': return makeArrowSign(mergedActor);
    case 'creature_trex':
    default: return makeRiggedDino(mergedActor);
  }
}

function makeExternalSvgAsset(actor, manifest) {
  const root = svgEl('g', { 'data-actor': actor.id, 'data-factory': 'external-svg', 'data-asset-id': manifest.id, filter: 'url(#softShadow)' });
  const parts = {};
  const sortedParts = [...(manifest.parts || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  for (const part of sortedParts) {
    if (!part.svgText || part.loadError) continue;
    const pivot = part.pivot || [0, 0];
    const nodes = parseSvgNodes(applyTemplate(part.svgText, actor, manifest));
    const partGroup = pivotGroup(part.name, pivot[0], pivot[1], nodes);
    if (part.expression) partGroup.el.dataset.expression = part.expression;
    if (part.phoneme) partGroup.el.dataset.phoneme = part.phoneme;
    parts[part.name] = partGroup;
    root.appendChild(partGroup.el);
  }

  return { root, parts, anchors: manifest.anchors || {}, scaleClass: manifest.scaleClass, type: manifest.type, manifest };
}

function applyTemplate(text, actor, manifest) {
  const values = { ...(manifest.defaults || {}), ...(actor.wardrobe || {}), ...actor };
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const value = key.split('.').reduce((acc, k) => acc && acc[k], values);
    return value ?? '';
  });
}

function parseSvgNodes(svgText) {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) return [];
  const source = doc.documentElement?.tagName?.toLowerCase() === 'svg' ? doc.documentElement : doc;
  return [...source.childNodes]
    .filter(node => node.nodeType === Node.ELEMENT_NODE || (node.nodeType === Node.TEXT_NODE && node.textContent.trim()))
    .map(node => document.importNode(node, true));
}

export function makeRiggedDino(actor) {
  const root = svgEl('g', { 'data-actor': actor.id, 'data-factory': 'creature_trex', filter: 'url(#softShadow)' });
  const parts = {};
  const outline = line(actor.lineWeight || 7);
  const red = actor.color || '#c7363e';
  const belly = actor.bellyColor || '#f1a3a5';

  parts.tail = pivotGroup('tail', 340, 245, [svgEl('path', { d: 'M335 245 C455 230 515 190 555 120 C525 225 455 310 335 300 Z', fill: red, ...outline })]);
  parts.body = pivotGroup('body', 260, 265, [
    svgEl('path', { d: 'M155 195 C235 150 365 178 405 265 C435 335 380 420 275 425 C170 430 105 365 115 280 C120 238 135 213 155 195 Z', fill: red, ...outline }),
    svgEl('path', { d: 'M185 230 C195 320 238 382 320 402 C250 420 175 382 150 315 C136 276 146 245 185 230 Z', fill: belly, stroke: '#111', 'stroke-width': 5, fillOpacity: 0.95 })
  ]);
  parts.leftLeg = pivotGroup('leftLeg', 215, 400, [svgEl('path', { d: 'M210 390 C195 425 178 455 130 455 C105 455 102 484 130 484 L218 484 C250 482 245 445 230 405 Z', fill: red, ...outline })]);
  parts.rightLeg = pivotGroup('rightLeg', 310, 400, [svgEl('path', { d: 'M300 390 C292 425 282 455 240 455 C215 455 212 484 240 484 L330 484 C360 482 352 445 325 405 Z', fill: red, ...outline })]);
  parts.leftArm = pivotGroup('leftArm', 170, 230, [svgEl('path', { d: 'M170 230 C143 260 140 295 166 288 C178 306 199 292 186 272 C208 270 207 248 185 250 Z', fill: red, ...outline })]);
  parts.rightArm = pivotGroup('rightArm', 205, 230, [svgEl('path', { d: 'M205 230 C178 260 175 295 201 288 C213 306 234 292 221 272 C243 270 242 248 220 250 Z', fill: red, ...outline })]);
  parts.neck = pivotGroup('neck', 220, 170, [svgEl('path', { d: 'M200 140 L255 140 L265 250 L210 255 Z', fill: red, ...outline })]);
  parts.head = pivotGroup('head', 210, 105, [
    svgEl('path', { d: 'M60 42 C70 20 185 22 205 33 C218 10 270 24 302 58 C330 88 325 165 296 190 C260 222 75 218 42 188 C12 162 15 82 60 42 Z', fill: red, ...outline }),
    svgEl('circle', { cx: 220, cy: 88, r: 12, fill: '#060606' })
  ]);
  parts.jaw = pivotGroup('jaw', 68, 138, [
    svgEl('path', { d: 'M40 138 L225 138 L208 178 L62 178 Z', fill: red, stroke: '#111', 'stroke-width': 6 }),
    teethPath()
  ]);
  const expressions = expressionGroup({
    happy: [svgEl('path', { d: 'M85 146 C130 168 170 168 210 146', fill: 'none', stroke: '#111', 'stroke-width': 5, 'stroke-linecap': 'round' })],
    angry: [svgEl('path', { d: 'M200 72 L242 86', stroke: '#111', 'stroke-width': 6, 'stroke-linecap': 'round' })],
    surprised: [svgEl('circle', { cx: 124, cy: 154, r: 13, fill: '#111' })]
  });
  root.append(parts.tail.el, parts.leftLeg.el, parts.rightLeg.el, parts.body.el, parts.neck.el, parts.leftArm.el, parts.rightArm.el, parts.head.el, parts.jaw.el, expressions);
  return { root, parts, type: 'creature', manifest: actor.manifest };
}

function makeRiggedHuman(actor) {
  const root = svgEl('g', { 'data-actor': actor.id, 'data-factory': 'human_guest_basic', filter: 'url(#softShadow)' });
  const parts = {};
  const skin = actor.skinColor || '#c98657';
  const shirt = actor.shirtColor || actor.wardrobe?.shirtColor || '#2f80ed';
  const pants = actor.pantsColor || actor.wardrobe?.pantsColor || '#25324a';
  const hat = actor.hatColor || actor.wardrobe?.hatColor;
  const outline = line(5);

  parts.leftLeg = pivotGroup('leftLeg', 145, 265, [svgEl('path', { d: 'M135 260 L160 260 L170 365 L140 365 Z', fill: pants, ...outline })]);
  parts.rightLeg = pivotGroup('rightLeg', 205, 265, [svgEl('path', { d: 'M195 260 L220 260 L235 365 L202 365 Z', fill: pants, ...outline })]);
  parts.body = pivotGroup('body', 175, 180, [
    svgEl('path', { d: 'M115 125 C145 105 205 105 235 125 L245 260 L105 260 Z', fill: shirt, ...outline }),
    svgEl('path', { d: 'M120 125 C150 150 200 150 230 125', fill: 'none', stroke: '#111', 'stroke-width': 4 })
  ]);
  parts.leftUpperArm = pivotGroup('leftUpperArm', 118, 135, [svgEl('path', { d: 'M118 135 C88 170 82 215 105 220 C124 202 135 165 138 142 Z', fill: shirt, ...outline })]);
  parts.rightUpperArm = pivotGroup('rightUpperArm', 232, 135, [svgEl('path', { d: 'M232 135 C265 170 270 215 247 220 C228 202 215 165 212 142 Z', fill: shirt, ...outline })]);
  parts.neck = pivotGroup('neck', 175, 118, [svgEl('rect', { x: 158, y: 100, width: 34, height: 34, rx: 12, fill: skin, ...outline })]);
  parts.head = pivotGroup('head', 175, 80, [
    svgEl('circle', { cx: 175, cy: 78, r: 58, fill: skin, ...outline }),
    svgEl('path', { d: 'M125 62 C140 10 208 8 227 62 C195 45 160 45 125 62 Z', fill: actor.hairColor || '#3b2418', ...outline }),
    svgEl('circle', { cx: 154, cy: 78, r: 6, fill: '#111' }),
    svgEl('circle', { cx: 196, cy: 78, r: 6, fill: '#111' })
  ]);
  // V17 fix: one mouth only. No extra expression-mouth overlays.
  parts.mouth = pivotGroup('mouth', 175, 102, [svgEl('path', { d: 'M150 104 C165 118 188 118 203 104', fill: 'none', stroke: '#111', 'stroke-width': 5, 'stroke-linecap': 'round', 'data-mouth-shape': 'smile' })]);
  if (hat) {
    parts.hat = pivotGroup('hat', 175, 35, [
      svgEl('path', { d: 'M115 42 C142 18 205 18 235 42 L230 58 L120 58 Z', fill: hat, ...outline }),
      svgEl('path', { d: 'M100 60 L255 60', stroke: '#111', 'stroke-width': 9, 'stroke-linecap': 'round' })
    ]);
  }
  root.append(parts.leftLeg.el, parts.rightLeg.el, parts.body.el, parts.leftUpperArm.el, parts.rightUpperArm.el, parts.neck.el, parts.head.el, parts.mouth.el);
  if (parts.hat) root.append(parts.hat.el);
  return { root, parts, type: 'character', manifest: actor.manifest };
}

function makeCoasterIcon(actor) {
  const root = svgEl('g', { 'data-actor': actor.id, 'data-factory': 'ride_coaster_track', filter: 'url(#softShadow)' });
  const parts = {};
  const rail = actor.railColor || '#56606d';
  root.appendChild(svgEl('path', { d: 'M20 380 C170 110 340 110 505 380 S835 650 1010 260', fill: 'none', stroke: rail, 'stroke-width': 20, 'stroke-linecap': 'round' }));
  root.appendChild(svgEl('path', { d: 'M20 420 C170 150 340 150 505 420 S835 690 1010 300', fill: 'none', stroke: '#9aa4b5', 'stroke-width': 7, 'stroke-linecap': 'round' }));
  for (const x of [120, 250, 390, 560, 730, 900]) root.appendChild(svgEl('path', { d: `M${x} 395 L${x+35} 610`, stroke: '#3d454f', 'stroke-width': 10 }));
  return { root, parts, type: 'ride', manifest: actor.manifest };
}

function makeRideCart(actor) {
  const root = svgEl('g', { 'data-actor': actor.id, 'data-factory': 'vehicle_cart_basic', filter: 'url(#softShadow)' });
  const parts = {};
  const outline = line(6);
  root.appendChild(svgEl('path', { d: 'M35 120 L290 120 L260 205 L70 205 Z', fill: actor.color || '#f0b33f', ...outline }));
  root.appendChild(svgEl('path', { d: 'M80 82 L245 82 L290 120 L35 120 Z', fill: '#ffcf66', ...outline }));
  parts.frontWheel = pivotGroup('frontWheel', 230, 215, wheel(230, 215));
  parts.rearWheel = pivotGroup('rearWheel', 95, 215, wheel(95, 215));
  root.append(parts.rearWheel.el, parts.frontWheel.el);
  return { root, parts, type: 'vehicle', manifest: actor.manifest };
}

function makeArrowSign(actor) {
  const root = svgEl('g', { 'data-actor': actor.id, 'data-factory': 'prop_sign_arrow', filter: 'url(#softShadow)' });
  const parts = {};
  root.appendChild(svgEl('rect', { x: 90, y: 155, width: 24, height: 210, rx: 8, fill: '#7a4b2c', stroke: '#111', 'stroke-width': 5 }));
  parts.sign = pivotGroup('sign', 102, 150, [
    svgEl('path', { d: 'M20 70 L205 70 L205 35 L310 110 L205 185 L205 150 L20 150 Z', fill: actor.color || '#75c6ff', stroke: '#111', 'stroke-width': 7, 'stroke-linejoin': 'round' }),
    svgEl('text', { x: 80, y: 127, 'font-size': 42, 'font-family': 'Arial Black, Arial', fill: '#111' }, [document.createTextNode(actor.text || 'RIDE')])
  ]);
  root.appendChild(parts.sign.el);
  return { root, parts, type: 'prop', manifest: actor.manifest };
}


export function makeEnvironmentNodes(environment = {}) {
  const manifest = assetRegistry.get(environment.asset);
  if (!manifest || manifest.type !== 'environment' || manifest.mode !== 'external-svg') return null;
  const groups = [];
  const layers = [...(manifest.layers || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const layer of layers) {
    if (!layer.svgText || layer.loadError) continue;
    const nodes = parseSvgNodes(applyTemplate(layer.svgText, environment, manifest));
    const group = svgEl('g', {
      'data-depth': layer.depth ?? 0,
      'data-layer': layer.id,
      'data-parallax': layer.parallax ?? 1,
      'data-environment-layer': 'true'
    });
    for (const node of nodes) group.appendChild(node);
    groups.push(group);
  }
  return groups.length ? groups : null;
}

export function setMouthShape(rig, shape = 'smile') {
  const mouth = rig?.parts?.mouth?.el;
  if (!mouth) return;
  const path = mouth.querySelector('[data-mouth-shape]') || mouth.querySelector('path');
  if (!path) return;
  const manifestShape = rig?.manifest?.mouthShapes?.[shape] || rig?.manifest?.mouthShapes?.smile;
  const fallbackShape = {
    smile: { d: 'M150 104 C165 118 188 118 203 104', fill: 'none' },
    happy: { d: 'M150 104 C165 118 188 118 203 104', fill: 'none' },
    neutral: { d: 'M154 106 L198 106', fill: 'none' },
    surprised: { d: 'M158 105 C158 88 194 88 194 105 C194 128 158 128 158 105', fill: '#111' },
    open: { d: 'M154 100 C165 122 188 122 200 100 C190 132 164 132 154 100', fill: '#111' },
    o: { d: 'M158 105 C158 88 194 88 194 105 C194 128 158 128 158 105', fill: '#111' },
    wide: { d: 'M143 101 C162 126 191 126 210 101', fill: 'none' }
  }[shape] || { d: 'M150 104 C165 118 188 118 203 104', fill: 'none' };
  const nextShape = manifestShape || fallbackShape;
  path.setAttribute('d', nextShape.d);
  path.setAttribute('fill', nextShape.fill ?? 'none');
  path.setAttribute('stroke', nextShape.stroke ?? '#111');
  path.setAttribute('stroke-width', nextShape.strokeWidth ?? 5);
}

function pivotGroup(name, px, py, children) {
  const el = svgEl('g', { 'data-part': name, 'data-pivot-x': px, 'data-pivot-y': py });
  for (const child of children) el.appendChild(child);
  return { el, pivot: [px, py], angle: 0 };
}

function teethPath() {
  const g = svgEl('g');
  const xs = [58, 82, 106, 130, 154, 178, 202];
  for (const x of xs) g.appendChild(svgEl('path', { d: `M${x} 139 L${x + 12} 163 L${x + 24} 139 Z`, fill: '#efe687', stroke: '#111', 'stroke-width': 4, 'stroke-linejoin': 'round' }));
  return g;
}

function expressionGroup(map) {
  const root = svgEl('g', { 'data-expression-root': 'true' });
  for (const [name, nodes] of Object.entries(map)) {
    const g = svgEl('g', { 'data-expression': name, opacity: name === 'happy' ? 1 : 0 });
    for (const node of nodes) g.appendChild(node);
    root.appendChild(g);
  }
  return root;
}

function wheel(cx, cy) {
  return [
    svgEl('circle', { cx, cy, r: 34, fill: '#222', stroke: '#111', 'stroke-width': 5 }),
    svgEl('circle', { cx, cy, r: 14, fill: '#ddd', stroke: '#111', 'stroke-width': 4 }),
    svgEl('path', { d: `M${cx-30} ${cy} L${cx+30} ${cy} M${cx} ${cy-30} L${cx} ${cy+30}`, stroke: '#ddd', 'stroke-width': 4 })
  ];
}

function line(width) { return { stroke: '#111', 'stroke-width': width, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }; }
