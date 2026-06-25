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
    for (const part of parts) {
      if (!part.file) continue;
      try {
        const partUrl = new URL(part.file, asset.baseUrl).toString();
        const res = await fetch(partUrl, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Missing part ${part.file}`);
        part.svgText = await res.text();
        part.url = partUrl;
      } catch (err) {
        part.loadError = String(err);
      }
    }
  }
  return pack;
}
