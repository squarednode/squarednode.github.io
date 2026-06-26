export async function loadAssetPacks(catalogUrl = '../assets/catalog/asset_catalog.json') {
  const loaded = [];
  const errors = [];

  try {
    const res = await fetch(catalogUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Catalog not found: ${catalogUrl}`);
    const catalog = await res.json();
    const catalogBaseUrl = new URL(catalogUrl, window.location.href);

    if (Array.isArray(catalog.assets)) {
      const categoryPackMap = new Map();
      for (const item of catalog.assets) {
        try {
          const manifestUrl = new URL(item.path, catalogBaseUrl).toString();
          const manifestRes = await fetchWithRetry(manifestUrl);
          if (!manifestRes.ok) throw new Error(`Asset manifest not found: ${item.path}`);
          const rawAsset = await manifestRes.json();
          const assetBaseUrl = new URL(rawAsset.path || './', manifestUrl).toString();
          const asset = await hydrateExternalSvgAsset({
            ...rawAsset,
            catalogPath: item.path,
            manifestUrl,
            baseUrl: assetBaseUrl,
            category: rawAsset.category || item.category,
            legacySource: rawAsset.source,
            source: 'category-catalog'
          });
          const category = asset.category || item.category || 'uncategorized';
          if (!categoryPackMap.has(category)) {
            categoryPackMap.set(category, {
              id: category,
              label: categoryLabel(category),
              category,
              version: catalog.version || catalog.schemaVersion || '22.0.0',
              schemaVersion: catalog.schemaVersion || '22.0.0',
              source: 'category-catalog',
              manifestUrl: catalogUrl,
              assets: []
            });
          }
          categoryPackMap.get(category).assets.push(asset);
        } catch (err) {
          errors.push({ asset: item, error: String(err) });
        }
      }
      loaded.push(...categoryPackMap.values());
    } else if (Array.isArray(catalog.packs)) {
      const legacy = await loadLegacyPacks(catalog, catalogBaseUrl);
      loaded.push(...legacy.loaded);
      errors.push(...legacy.errors);
    } else {
      throw new Error('Catalog has no assets or packs array.');
    }
  } catch (err) {
    errors.push({ catalog: catalogUrl, error: String(err) });
    // Legacy safety net for older builds or partial deployments.
    if (!/asset_packs\.json$/.test(catalogUrl)) {
      try {
        const legacy = await loadAssetPacks('../assets/catalog/asset_packs.json');
        loaded.push(...legacy.loaded);
        errors.push(...legacy.errors.map(e => ({ ...e, legacyFallback: true })));
      } catch (legacyErr) {
        errors.push({ catalog: '../assets/catalog/asset_packs.json', error: String(legacyErr), legacyFallback: true });
      }
    }
  }

  return { loaded, errors };
}

async function loadLegacyPacks(catalog, catalogBaseUrl) {
  const loaded = [];
  const errors = [];
  for (const pack of catalog.packs || []) {
    try {
      const manifestUrl = new URL(pack.manifest, catalogBaseUrl).toString();
      const manifestRes = await fetchWithRetry(manifestUrl);
      if (!manifestRes.ok) throw new Error(`Manifest not found: ${pack.manifest}`);
      const manifest = await manifestRes.json();
      const manifestBaseUrl = new URL('.', manifestUrl).toString();
      const hydrated = await hydrateExternalSvgPack({ ...manifest, manifestUrl, baseUrl: manifestBaseUrl, source: 'legacy-pack' });
      loaded.push(hydrated);
    } catch (err) {
      errors.push({ pack, error: String(err) });
    }
  }
  return { loaded, errors };
}

async function hydrateExternalSvgPack(pack) {
  for (const asset of pack.assets || []) {
    asset.baseUrl = new URL(asset.path || '', pack.baseUrl).toString();
    await hydrateExternalSvgAsset(asset);
  }
  return pack;
}

async function hydrateExternalSvgAsset(asset) {
  if (asset.mode !== 'external-svg') return asset;
  const parts = Array.isArray(asset.parts) ? asset.parts : [];
  for (const part of parts) await hydrateSvgEntry(part, asset.baseUrl, 'part');

  const layers = Array.isArray(asset.layers) ? asset.layers : [];
  for (const layer of layers) await hydrateSvgEntry(layer, asset.baseUrl, 'layer');

  if (asset.thumbnail) {
    try {
      const thumbUrl = new URL(asset.thumbnail, asset.baseUrl).toString();
      const thumbRes = await fetchWithRetry(thumbUrl);
      if (thumbRes.ok) {
        asset.thumbnailText = await thumbRes.text();
        asset.thumbnailUrl = thumbUrl;
      } else {
        asset.thumbnailLoadError = `Missing thumbnail ${asset.thumbnail}`;
      }
    } catch (err) {
      asset.thumbnailLoadError = String(err);
    }
  }
  return asset;
}

async function hydrateSvgEntry(entry, baseUrl, kind = 'part') {
  if (!entry.file) return;
  try {
    const url = new URL(entry.file, baseUrl).toString();
    const res = await fetchWithRetry(url);
    if (!res.ok) throw new Error(`Missing ${kind} ${entry.file} HTTP ${res.status}`);
    entry.svgText = await res.text();
    entry.url = url;
  } catch (err) {
    entry.loadError = String(err);
  }
}

async function fetchWithRetry(url) {
  let res = await fetch(url, { cache: 'no-store' });
  if (res.ok) return res;

  // GitHub Pages can briefly serve stale or unavailable asset files right after a deploy.
  // Retry once with a cache-busting query string so individual SVG part files do not
  // get falsely marked missing during Pages propagation or hard-refresh testing.
  const retryUrl = new URL(url, window.location.href);
  retryUrl.searchParams.set('_rtv', String(Date.now()));
  res = await fetch(retryUrl.toString(), { cache: 'no-store' });
  return res;
}

function categoryLabel(category) {
  return String(category || 'Assets').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
