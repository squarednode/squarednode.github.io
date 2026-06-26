# Ride Through Offline Video Creator - V22.1

V22.1 patches V22 and keeps the category asset library structure. V22 restructures the asset library into stable production categories instead of release-phase packs.

## Run locally

```bash
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080/engine/player.html
```

## GitHub Pages

Replace your `videoedit` folder with this V22.1 folder content, commit, then open:

```text
https://squarednode.github.io/videoedit/engine/player.html?v=22.1
```

## Primary change

The asset system now loads from:

```text
assets/catalog/asset_catalog.json
```

Assets are organized by class:

```text
assets/characters/
assets/creatures/
assets/vehicles/
assets/rides/
assets/props/
assets/landmarks/
assets/environments/
assets/wardrobe/
assets/facial_features/
assets/effects/
assets/signage/
assets/background_layers/
```

Each asset is self-contained:

```text
assets/creatures/creature_trex/
  manifest.json
  thumbnail.svg
  parts/
    body.svg
    head.svg
    jaw.svg
```

Environment assets use `layers/`:

```text
assets/environments/environment_jungle_path/
  manifest.json
  thumbnail.svg
  layers/
    sky.svg
    background.svg
    ground.svg
```

## Why this matters

New assets can now be added by placing a folder under the correct category and adding one catalog entry. The engine no longer needs to care whether an asset was originally "core" or "expansion".

## Included stories

```text
stories/episode_001.json
stories/episode_expansion_test.json
stories/story_catalog.json
```

Direct-load example:

```text
https://squarednode.github.io/videoedit/engine/player.html?v=22.1&story=episode_expansion_test
```
