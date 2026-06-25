export async function loadAssetPacks(catalogUrl = '../assets/catalog/asset_packs.json') {
  const loaded = [];
  const errors = [];

  try {
    const res = await fetch(catalogUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Catalog not found: ${catalogUrl}`);
    const catalog = await res.json();
    const packs = catalog.packs || [];

    for (const pack of packs) {
      try {
        const manifestUrl = new URL(pack.manifest, new URL(catalogUrl, window.location.href)).toString();
        const manifestRes = await fetch(manifestUrl, { cache: 'no-cache' });
        if (!manifestRes.ok) throw new Error(`Manifest not found: ${pack.manifest}`);
        const manifest = await manifestRes.json();
        loaded.push({ ...manifest, manifestUrl });
      } catch (err) {
        errors.push({ pack, error: String(err) });
      }
    }
  } catch (err) {
    errors.push({ catalog: catalogUrl, error: String(err) });
  }

  return { loaded, errors };
}
