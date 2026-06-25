export function validateAssetPacks(packReport, assetLibrary = []) {
  const checks = [];
  const assets = [];
  const seenIds = new Map();

  for (const err of packReport.errors || []) {
    checks.push(issue('error', 'pack-load', 'Asset pack failed to load', err.pack?.id || err.catalog || 'catalog', String(err.error || err)));
  }

  for (const pack of packReport.loaded || []) {
    if (!pack.id) checks.push(issue('error', 'pack-id', 'Pack is missing id', '(unknown pack)', pack.manifestUrl || ''));
    if (!Array.isArray(pack.assets)) checks.push(issue('error', 'pack-assets', 'Pack has no assets array', pack.id || '(unknown pack)', pack.manifestUrl || ''));

    for (const asset of pack.assets || []) {
      assets.push(asset);
      if (!asset.id) checks.push(issue('error', 'asset-id', 'Asset is missing id', pack.id, asset.label || 'Unnamed asset'));
      if (!asset.type) checks.push(issue('warning', 'asset-type', 'Asset is missing type', asset.id || pack.id, 'Use character, creature, ride, vehicle, prop, landmark, or environment.'));
      if (asset.id) {
        if (seenIds.has(asset.id)) checks.push(issue('warning', 'duplicate-id', 'Duplicate asset id overrides earlier asset', asset.id, `First seen in ${seenIds.get(asset.id)}, repeated in ${pack.id}.`));
        seenIds.set(asset.id, pack.id);
      }
      if (asset.mode !== 'external-svg') checks.push(issue('info', 'asset-mode', 'Asset is not external SVG mode', asset.id || '(unknown asset)', asset.mode || 'missing mode'));
      if (!asset.path) checks.push(issue('warning', 'asset-path', 'Asset is missing path', asset.id || '(unknown asset)', 'External asset packs should point to an asset folder.'));

      const parts = Array.isArray(asset.parts) ? asset.parts : [];
      const rig = Array.isArray(asset.rig) ? asset.rig : [];
      const partNames = new Set();
      if (!parts.length) checks.push(issue('error', 'parts', 'Asset has no parts', asset.id || '(unknown asset)', 'Add at least one SVG part.'));

      for (const part of parts) {
        const label = `${asset.id || '(unknown asset)'}.${part.name || '(unnamed part)'}`;
        if (!part.name) checks.push(issue('error', 'part-name', 'Part is missing name', asset.id || '(unknown asset)', part.file || 'No file'));
        if (part.name && partNames.has(part.name)) checks.push(issue('warning', 'duplicate-part', 'Duplicate part name', label, 'Only one part should use a given rig name.'));
        if (part.name) partNames.add(part.name);
        if (!part.file) checks.push(issue('error', 'part-file', 'Part is missing SVG file', label, 'Add file property.'));
        if (part.loadError) checks.push(issue('error', 'missing-svg', 'SVG file failed to load', label, `${part.file}: ${part.loadError}`));
        if (!part.svgText && asset.mode === 'external-svg') checks.push(issue('error', 'empty-svg', 'Part has no loaded SVG text', label, part.file || 'No file'));
        if (!isGoodPivot(part.pivot)) checks.push(issue('error', 'bad-pivot', 'Pivot must be [number, number]', label, JSON.stringify(part.pivot)));
        if (part.svgText && !looksLikeSvg(part.svgText)) checks.push(issue('warning', 'svg-content', 'Part file does not look like an SVG', label, part.file));
        if ((part.order ?? null) === null) checks.push(issue('info', 'part-order', 'Part has no draw order', label, 'Add order to control layering.'));
      }

      for (const rigPart of rig) {
        if (!partNames.has(rigPart)) checks.push(issue('warning', 'rig-missing-part', 'Rig entry has no matching part', `${asset.id}.${rigPart}`, 'Motion command may not affect anything.'));
      }
    }
  }

  for (const asset of assetLibrary || []) {
    if (asset.source === 'core-fallback') checks.push(issue('info', 'fallback-asset', 'Fallback engine asset is still available', asset.id, 'Okay for safety, but real production assets should be external SVG packs.'));
  }

  return {
    summary: summarize(checks, assets),
    checks,
    assets
  };
}

export function collectRenderedAssetDiagnostics(renderer, actorId = 'asset_test') {
  const rig = renderer.actors.get(actorId);
  if (!rig) return [issue('error', 'render-test', 'No rendered test actor found', actorId, 'Build a test shot first.')];
  const checks = [];
  for (const [name, part] of Object.entries(rig.parts || {})) {
    try {
      const box = part.el.getBBox();
      if (!Number.isFinite(box.width) || !Number.isFinite(box.height)) {
        checks.push(issue('error', 'bbox-invalid', 'Invalid bounding box', name, 'Browser returned non-finite dimensions.'));
      } else if (box.width <= 0 || box.height <= 0) {
        checks.push(issue('warning', 'bbox-empty', 'Empty or invisible part bounding box', name, `x=${round(box.x)}, y=${round(box.y)}, w=${round(box.width)}, h=${round(box.height)}`));
      } else {
        checks.push(issue('pass', 'bbox', 'Rendered part bounding box', name, `x=${round(box.x)}, y=${round(box.y)}, w=${round(box.width)}, h=${round(box.height)}`));
      }
    } catch (err) {
      checks.push(issue('warning', 'bbox-error', 'Could not read part bounding box', name, String(err)));
    }
  }
  return checks;
}

export function makeAssetTestShot(asset, partName = null) {
  const type = asset.type || 'prop';
  const scale = type === 'landmark' || type === 'ride' ? 0.85 : type === 'vehicle' ? 1.15 : type === 'prop' ? 1.1 : 0.9;
  return {
    id: 'asset_test_shot',
    title: `Asset test - ${asset.id}`,
    duration: 6,
    environment: { asset: 'park_entry_day' },
    camera: { type: '2.5d', position: [0, 0], zoom: 1 },
    actors: [
      {
        id: 'asset_test',
        asset: asset.id,
        position: [type === 'landmark' || type === 'ride' ? 260 : 480, type === 'landmark' || type === 'ride' ? 120 : 235, 5],
        scale,
        expression: 'happy',
        wardrobe: { shirtColor: '#2f80ed', pantsColor: '#25324a', hatColor: '#ffd34d' },
        text: 'RIDE'
      }
    ],
    timeline: partName ? [
      { start: 0.25, duration: 2.5, actor: 'asset_test', action: 'gesture', parts: { [partName]: [-25, 25] } },
      { start: 2.75, duration: 2.5, actor: 'asset_test', action: 'gesture', parts: { [partName]: [25, -25] } }
    ] : makeDefaultTimeline(type)
  };
}

function makeDefaultTimeline(type) {
  if (type === 'vehicle') return [{ start: 0.3, duration: 4, actor: 'asset_test', action: 'drive', from: [340, 330, 5], to: [760, 330, 5] }];
  if (type === 'character') return [{ start: 0.4, duration: 3, actor: 'asset_test', action: 'wave' }, { start: 3.2, duration: 2, actor: 'asset_test', action: 'talk' }];
  if (type === 'creature') return [{ start: 0.4, duration: 3, actor: 'asset_test', action: 'talk' }, { start: 3.2, duration: 2, actor: 'asset_test', action: 'gesture', parts: { tail: [-10, 12], head: [-6, 8] } }];
  if (type === 'ride') return [{ start: 0.4, duration: 4, actor: 'asset_test', action: 'gesture', parts: { wheel: [0, 360], train: [-4, 4] } }];
  return [{ start: 0.4, duration: 2.2, actor: 'asset_test', action: 'gesture', parts: { sign: [-8, 8], gate: [-1, 1], balloon: [-12, 12] } }];
}

function isGoodPivot(pivot) {
  return Array.isArray(pivot) && pivot.length === 2 && Number.isFinite(Number(pivot[0])) && Number.isFinite(Number(pivot[1]));
}

function looksLikeSvg(text) {
  return /<svg[\s>]/i.test(text) || /<(path|circle|rect|g|polygon|ellipse|line|polyline|text)[\s>]/i.test(text);
}

function issue(level, code, message, target, detail) {
  return { level, code, message, target, detail };
}

function summarize(checks, assets) {
  const counts = { pass: 0, info: 0, warning: 0, error: 0 };
  for (const check of checks) counts[check.level] = (counts[check.level] || 0) + 1;
  return { assetCount: assets.length, ...counts };
}

function round(value) {
  return Math.round(value * 10) / 10;
}
