# Ride Through Asset Validation Standard V19

V19 adds an in-engine validation and rig test loop for external SVG asset packs.

## What the validator checks

- Asset pack catalog and manifest load status
- Required asset identity fields: `id`, `type`, `mode`, and `path`
- Duplicate asset ids and duplicate part names
- Missing SVG files and empty SVG text
- Bad pivots; every rigged part should use `pivot: [x, y]`
- Rig entries that do not match any loaded part
- Rendered part bounding boxes after the test actor is built on the stage

## Rig test workflow

1. Select an item in Asset Library.
2. Choose `Auto test / default motion` or a specific part under Rig Part Test.
3. Press `Show Selected Asset` to build the test shot and calculate bounding boxes.
4. Press `Play Rig Test` to animate the default asset motion or the selected part pivot.

## Acceptance target

A production asset should have:

- No error rows
- No missing SVG files
- No bad pivots
- No empty rendered bounding boxes unless the part is intentionally invisible
- Rig part names that match timeline commands exactly

## Current V19 element expansion

V19 adds first-pass buildout assets:

- `ride_drop_tower_icon`
- `vehicle_omni_mover`
- `prop_ticket`
- `prop_balloon`
- `landmark_iconic_globe`

These are still simple SVG style assets, matching the existing dino, human, cart, coaster, and sign detail level.
