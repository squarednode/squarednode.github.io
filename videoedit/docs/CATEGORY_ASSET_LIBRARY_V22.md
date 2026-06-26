# V22 Category Asset Library Standard

V22 replaces release-phase folders such as `core-*` and `expansion-*` with production category folders.

## Required folder layout

```text
assets/
  catalog/
    asset_catalog.json
  characters/
  creatures/
  vehicles/
  rides/
  props/
  landmarks/
  environments/
  wardrobe/
  facial_features/
  effects/
  signage/
  background_layers/
```

Each asset lives in its own self-contained folder:

```text
assets/creatures/creature_trex/
  manifest.json
  thumbnail.svg
  parts/
    body.svg
    head.svg
    jaw.svg
```

Environments use `layers/` instead of `parts/`:

```text
assets/environments/environment_jungle_path/
  manifest.json
  thumbnail.svg
  layers/
    sky.svg
    background.svg
    ground.svg
    foreground.svg
```

## Asset catalog

The engine now loads from:

```text
assets/catalog/asset_catalog.json
```

The catalog points to each individual asset manifest:

```json
{
  "schemaVersion": "22.0.0",
  "assets": [
    {
      "id": "creature_trex",
      "category": "creatures",
      "path": "../creatures/creature_trex/manifest.json"
    }
  ]
}
```

## Naming rules

Do not put color, release phase, or pack sequence into asset IDs.

Good:

```text
creature_trex
vehicle_jeep
human_guest_basic
ride_coaster_track
```

Bad:

```text
creature_red_dino
core_guest_human
expansion_dragon_01
vehicle_yellow_jeep
```

Colors belong in `defaults`, `colorSlots`, wardrobe settings, or story overrides.

## Adding a new asset

1. Create `assets/<category>/<asset_id>/`.
2. Add `manifest.json`.
3. Add SVG files under `parts/` or `layers/`.
4. Add a catalog entry to `assets/catalog/asset_catalog.json`.
5. Run asset validation in the player.
6. Run story validation.

No engine code should need to change for a normal asset addition.

## Legacy support

V22 keeps the loader capable of reading the old V21 pack format as a fallback, but the generated V22 library no longer depends on `assets/packs/`.
