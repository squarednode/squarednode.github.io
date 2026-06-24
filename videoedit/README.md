# Ride Through Offline Episode Maker - V16 Full Engine Build

V16 expands the V15 rig test into a larger system-level prototype.

## New in V16

- Asset library browser in the right-side panel
- New rigged human character asset with wardrobe color controls
- New ride/coaster scenic asset
- New vehicle/cart asset with wheel rigging
- New sign prop asset
- Mouth phoneme presets for simple talking animation
- 2.5D camera movement and basic parallax layers
- Gesture command for named body parts
- Drive command for wheeled vehicles and ride trains
- Export current shot or export all shots one by one
- Copyable shot template button

## How to run

From inside this folder:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/engine/player.html
```

No internet connection is required.

## Main files

```text
engine/player.html       Main UI
engine/app.js            UI wiring and story loading
engine/renderer.js       Scene building, depth sorting, camera, actors
engine/timeline.js       Motion command system
engine/assetFactory.js   Built-in SVG asset library and rig definitions
engine/exporter.js       WebM export
stories/episode_001.json V16 feature test story
docs/ASSET_RIG_STANDARD_V16.md
```

## Supported timeline commands in V16

- `enter`
- `exit`
- `walk`
- `wave`
- `talk`
- `mouth`
- `expression`
- `look`
- `gesture`
- `drive`
- `scale`
- `camera_move`

## Supported built-in asset IDs

- `creature_red_dino`
- `human_guest_basic`
- `ride_coaster_icon`
- `vehicle_cart_basic`
- `prop_sign_arrow`

## Notes

This is still intentionally SVG-simple. The point of V16 is to prove the control architecture: story JSON -> asset loading -> rig assembly -> named part animation -> 2.5D scene playback -> WebM export.

Next versions should split procedural demo assets into real reusable SVG part files and add an asset pack validator.
