# Ride Through Episode Maker - V20

V20 is the foundation-lock build before large-scale asset expansion. It adds formal asset categories, scale classes, semantic anchors, motion compatibility tags, thumbnail declarations, layered environment assets, and story validation.

## Run locally

```bash
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080/engine/player.html
```

## GitHub Pages

Upload/replace the `videoedit` folder contents and open:

```text
https://squarednode.github.io/videoedit/engine/player.html?v=20
```

## Key V20 changes

- Neutral asset names: color is no longer part of reusable asset ids. Example: `creature_trex` with story-level `color` overrides.
- Category schema locked: characters, creatures, vehicles, rides, landmarks, environments, props, wardrobe, facial_features, effects, signage, background_layers.
- Scale classes, artboards, ground points, and semantic anchors added to manifests.
- Motion compatibility tags added so story commands can be validated against each asset.
- Expression and phoneme metadata separated.
- External layered environment pack added: `park_path_day`.
- Story validation panel added.
- Coaster track remains track-only; ride vehicles are separate actors.

## Important files

```text
engine/storyValidator.js
engine/assetValidator.js
engine/assetPackLoader.js
engine/assetFactory.js
assets/catalog/asset_packs.json
assets/packs/core-environments/manifest.json
docs/FOUNDATION_STANDARD_V20.md
docs/CHANGELOG_V20.md
```
