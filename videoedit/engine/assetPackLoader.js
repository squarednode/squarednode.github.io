export async function loadAssetPacks(catalogUrl = '../assets/catalog/asset_packs.json') {
  const loaded = [];
  const errors = [];

  try {
    const res = await fetch(catalogUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Catalog not found: ${catalogUrl}`);
    const catalog = await res.json();
    const packs = catalog.packs || [];
    const catalogBaseUrl = new URL(catalogUrl, window.location.href);

    for (const pack of packs) {
      try {
        const manifestUrl = new URL(pack.manifest, catalogBaseUrl).toString();
        const manifestRes = await fetch(manifestUrl, { cache: 'no-cache' });
        if (!manifestRes.ok) throw new Error(`Manifest not found: ${pack.manifest}`);
        const manifest = await manifestRes.json();
        const manifestBaseUrl = new URL('.', manifestUrl).toString();
        const hydrated = await hydrateExternalSvgAssets({ ...manifest, manifestUrl, baseUrl: manifestBaseUrl });
        loaded.push(hydrated);
      } catch (err) {
        errors.push({ pack, error: String(err) });
      }
    }
  } catch (err) {
    errors.push({ catalog: catalogUrl, error: String(err) });
  }

  return { loaded, errors };
}

async function hydrateExternalSvgAssets(pack) {
  for (const asset of pack.assets || []) {
    asset.baseUrl = new URL(asset.path || '', pack.baseUrl).toString();
    if (asset.mode !== 'external-svg') continue;
    const parts = Array.isArray(asset.parts) ? asset.parts : [];
    for (const part of parts) await hydrateSvgEntry(part, asset.baseUrl, 'part');

    const layers = Array.isArray(asset.layers) ? asset.layers : [];
    for (const layer of layers) await hydrateSvgEntry(layer, asset.baseUrl, 'layer');

    if (asset.thumbnail) {
      try {
        const thumbUrl = new URL(asset.thumbnail, asset.baseUrl).toString();
        const thumbRes = await fetch(thumbUrl, { cache: 'no-cache' });
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
  }
  return pack;
}


async function hydrateSvgEntry(entry, baseUrl, kind = 'part') {
  if (!entry.file) return;
  try {
    const url = new URL(entry.file, baseUrl).toString();
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Missing ${kind} ${entry.file}`);
    entry.svgText = await res.text();
    entry.url = url;
  } catch (err) {
    entry.loadError = String(err);
  }
}
