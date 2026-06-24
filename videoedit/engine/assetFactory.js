const NS = 'http://www.w3.org/2000/svg';

export const ASSET_LIBRARY = [
  { id: 'creature_red_dino', type: 'creature', label: 'Rigged Red Dino', rig: ['head','jaw','leftArm','rightArm','leftLeg','rightLeg','tail'], expressions: ['happy','angry','surprised'], tags: ['creature','mascot','simple'] },
  { id: 'human_guest_basic', type: 'character', label: 'Rigged Park Guest', rig: ['head','mouth','leftUpperArm','leftForearm','rightUpperArm','rightForearm','leftLeg','rightLeg'], expressions: ['happy','neutral','surprised'], wardrobe: ['shirtColor','pantsColor','hatColor'], tags: ['human','guest','wardrobe'] },
  { id: 'ride_coaster_icon', type: 'ride', label: 'Iconic Coaster Silhouette', rig: ['train'], expressions: [], tags: ['ride','landmark','background'] },
  { id: 'vehicle_cart_basic', type: 'vehicle', label: 'Rigged Ride Cart', rig: ['frontWheel','rearWheel'], expressions: [], tags: ['vehicle','wheels'] },
  { id: 'prop_sign_arrow', type: 'prop', label: 'Arrow Sign Prop', rig: ['sign'], expressions: [], tags: ['prop','sign'] }
];

export function svgEl(tag, attrs = {}, children = []) {
  const el = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined && value !== null) el.setAttribute(key, String(value));
  }
  for (const child of children) el.appendChild(child);
  return el;
}

export function makeAsset(actor) {
  switch (actor.asset) {
    case 'human_guest_basic': return makeRiggedHuman(actor);
    case 'ride_coaster_icon': return makeCoasterIcon(actor);
    case 'vehicle_cart_basic': return makeRideCart(actor);
    case 'prop_sign_arrow': return makeArrowSign(actor);
    case 'creature_red_dino':
    default: return makeRiggedDino(actor);
  }
}

export function makeRiggedDino(actor) {
  const root = svgEl('g', { 'data-actor': actor.id, filter: 'url(#softShadow)' });
  const parts = {};
  const outline = line(actor.lineWeight || 7);
  const red = actor.color || '#c7363e';
  const belly = actor.bellyColor || '#f1a3a5';

  parts.tail = pivotGroup('tail', 340, 245, [
    svgEl('path', { d: 'M335 245 C455 230 515 190 555 120 C525 225 455 310 335 300 Z', fill: red, ...outline })
  ]);
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
  return { root, parts, type: 'creature' };
}

function makeRiggedHuman(actor) {
  const root = svgEl('g', { 'data-actor': actor.id, filter: 'url(#softShadow)' });
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
  parts.leftForearm = pivotGroup('leftForearm', 105, 217, [svgEl('path', { d: 'M105 217 C95 250 100 280 120 282 C135 260 136 235 122 215 Z', fill: skin, ...outline })]);
  parts.rightUpperArm = pivotGroup('rightUpperArm', 232, 135, [svgEl('path', { d: 'M232 135 C265 170 270 215 247 220 C228 202 215 165 212 142 Z', fill: shirt, ...outline })]);
  parts.rightForearm = pivotGroup('rightForearm', 247, 217, [svgEl('path', { d: 'M247 217 C260 250 256 280 236 282 C220 260 218 235 232 215 Z', fill: skin, ...outline })]);
  parts.neck = pivotGroup('neck', 175, 118, [svgEl('rect', { x: 158, y: 100, width: 34, height: 34, rx: 12, fill: skin, ...outline })]);
  parts.head = pivotGroup('head', 175, 80, [
    svgEl('circle', { cx: 175, cy: 78, r: 58, fill: skin, ...outline }),
    svgEl('path', { d: 'M125 62 C140 10 208 8 227 62 C195 45 160 45 125 62 Z', fill: actor.hairColor || '#3b2418', ...outline }),
    svgEl('circle', { cx: 154, cy: 78, r: 6, fill: '#111' }),
    svgEl('circle', { cx: 196, cy: 78, r: 6, fill: '#111' })
  ]);
  parts.mouth = pivotGroup('mouth', 175, 102, [svgEl('path', { d: 'M150 104 C165 118 188 118 203 104', fill: 'none', stroke: '#111', 'stroke-width': 5, 'stroke-linecap': 'round', 'data-mouth-shape': 'smile' })]);
  if (hat) {
    parts.hat = pivotGroup('hat', 175, 35, [
      svgEl('path', { d: 'M115 42 C142 18 205 18 235 42 L230 58 L120 58 Z', fill: hat, ...outline }),
      svgEl('path', { d: 'M100 60 L255 60', stroke: '#111', 'stroke-width': 9, 'stroke-linecap': 'round' })
    ]);
  }
  const expressions = expressionGroup({
    happy: [svgEl('path', { d: 'M150 104 C165 118 188 118 203 104', fill: 'none', stroke: '#111', 'stroke-width': 5, 'stroke-linecap': 'round' })],
    neutral: [svgEl('path', { d: 'M154 106 L198 106', stroke: '#111', 'stroke-width': 5, 'stroke-linecap': 'round' })],
    surprised: [svgEl('ellipse', { cx: 176, cy: 108, rx: 13, ry: 18, fill: '#111' })]
  });
  root.append(parts.leftLeg.el, parts.rightLeg.el, parts.body.el, parts.leftUpperArm.el, parts.leftForearm.el, parts.rightUpperArm.el, parts.rightForearm.el, parts.neck.el, parts.head.el, parts.mouth.el);
  if (parts.hat) root.append(parts.hat.el);
  root.append(expressions);
  return { root, parts, type: 'character' };
}

function makeCoasterIcon(actor) {
  const root = svgEl('g', { 'data-actor': actor.id, filter: 'url(#softShadow)' });
  const parts = {};
  const rail = actor.railColor || '#56606d';
  root.appendChild(svgEl('path', { d: 'M20 380 C170 110 340 110 505 380 S835 650 1010 260', fill: 'none', stroke: rail, 'stroke-width': 20, 'stroke-linecap': 'round' }));
  root.appendChild(svgEl('path', { d: 'M20 420 C170 150 340 150 505 420 S835 690 1010 300', fill: 'none', stroke: '#9aa4b5', 'stroke-width': 7, 'stroke-linecap': 'round' }));
  for (const x of [120, 250, 390, 560, 730, 900]) root.appendChild(svgEl('path', { d: `M${x} 395 L${x+35} 610`, stroke: '#3d454f', 'stroke-width': 10 }));
  parts.train = pivotGroup('train', 505, 380, [
    svgEl('rect', { x: 455, y: 345, width: 110, height: 55, rx: 15, fill: actor.color || '#e0473f', stroke: '#111', 'stroke-width': 6 }),
    svgEl('circle', { cx: 480, cy: 404, r: 10, fill: '#111' }),
    svgEl('circle', { cx: 540, cy: 404, r: 10, fill: '#111' })
  ]);
  root.appendChild(parts.train.el);
  return { root, parts, type: 'ride' };
}

function makeRideCart(actor) {
  const root = svgEl('g', { 'data-actor': actor.id, filter: 'url(#softShadow)' });
  const parts = {};
  const outline = line(6);
  root.appendChild(svgEl('path', { d: 'M35 120 L290 120 L260 205 L70 205 Z', fill: actor.color || '#f0b33f', ...outline }));
  root.appendChild(svgEl('path', { d: 'M80 82 L245 82 L290 120 L35 120 Z', fill: '#ffcf66', ...outline }));
  parts.frontWheel = pivotGroup('frontWheel', 230, 215, wheel(230, 215));
  parts.rearWheel = pivotGroup('rearWheel', 95, 215, wheel(95, 215));
  root.append(parts.rearWheel.el, parts.frontWheel.el);
  return { root, parts, type: 'vehicle' };
}

function makeArrowSign(actor) {
  const root = svgEl('g', { 'data-actor': actor.id, filter: 'url(#softShadow)' });
  const parts = {};
  root.appendChild(svgEl('rect', { x: 90, y: 155, width: 24, height: 210, rx: 8, fill: '#7a4b2c', stroke: '#111', 'stroke-width': 5 }));
  parts.sign = pivotGroup('sign', 102, 150, [
    svgEl('path', { d: 'M20 70 L205 70 L205 35 L310 110 L205 185 L205 150 L20 150 Z', fill: actor.color || '#75c6ff', stroke: '#111', 'stroke-width': 7, 'stroke-linejoin': 'round' }),
    svgEl('text', { x: 80, y: 127, 'font-size': 42, 'font-family': 'Arial Black, Arial', fill: '#111' }, [document.createTextNode(actor.text || 'RIDE')])
  ]);
  root.appendChild(parts.sign.el);
  return { root, parts, type: 'prop' };
}

export function setMouthShape(rig, shape = 'smile') {
  const mouth = rig?.parts?.mouth?.el;
  if (!mouth) return;
  const path = mouth.querySelector('path, ellipse');
  if (!path) return;
  if (path.tagName.toLowerCase() === 'path') {
    const d = {
      smile: 'M150 104 C165 118 188 118 203 104',
      neutral: 'M154 106 L198 106',
      open: 'M154 100 C165 122 188 122 200 100 C190 132 164 132 154 100',
      o: 'M158 105 C158 88 194 88 194 105 C194 128 158 128 158 105',
      wide: 'M143 101 C162 126 191 126 210 101'
    }[shape] || 'M150 104 C165 118 188 118 203 104';
    path.setAttribute('d', d);
    path.setAttribute('fill', shape === 'open' || shape === 'o' ? '#111' : 'none');
  }
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
