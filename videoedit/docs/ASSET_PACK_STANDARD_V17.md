# Ride Through Asset Pack Standard V17

V17 moves the engine from a hardcoded-only asset list to a catalog-driven asset-pack system.

## Folder layout

```text
assets/
  catalog/
    asset_packs.json
  packs/
    core-characters/
      manifest.json
    core-creatures/
      manifest.json
    core-rides/
      manifest.json
    core-props/
      manifest.json
```

## Catalog file

`assets/catalog/asset_packs.json` lists every asset pack the engine should load.

```json
{
  "schema": "ride_through_asset_catalog_v1",
  "engineVersion": "v17",
  "packs": [
    { "id": "core-characters", "manifest": "../packs/core-characters/manifest.json" }
  ]
}
```

Paths are resolved relative to the catalog file, so this works on localhost and GitHub Pages.

## Manifest file

Each pack has a `manifest.json` containing metadata and one or more asset definitions.

```json
{
  "schema": "ride_through_asset_pack_v1",
  "id": "core-characters",
  "label": "Core Characters",
  "version": "17.0.0",
  "style": "simple_theme_park_svg_v3",
  "assets": [
    {
      "id": "human_guest_basic",
      "type": "character",
      "label": "Rigged Park Guest",
      "factory": "human_guest_basic",
      "rig": ["head", "mouth", "leftUpperArm", "leftForearm"],
      "expressions": ["happy", "neutral", "surprised"],
      "defaults": { "shirtColor": "#2f80ed" }
    }
  ]
}
```

## V17 implementation note

The drawing factories still live in `engine/assetFactory.js`, but asset metadata, defaults, pack ownership, and library visibility now come from the external manifests. This is the bridge step before V18/V19, where each asset can carry its own external SVG part files or parametric draw instructions.

## Art standard

All core assets should stay near the current dino, human, and ride-cart detail level:

- thick black outline
- rounded cartoon shape language
- simple readable silhouettes
- enough detail to identify the object/place/ride
- rigged moving parts only where they add animation value
- no disconnected hand pieces unless hands are explicitly rigged to the forearm hierarchy
- one active mouth layer per character or creature unless a special effect intentionally requires otherwise
