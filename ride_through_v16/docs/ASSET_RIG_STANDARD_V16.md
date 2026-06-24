# Asset Rig Standard V16

## Goal

Every renderable item should be controlled by a stable asset ID and a predictable rig map. The story should never need to know raw SVG paths. It should only call assets, wardrobe, expressions, and timeline commands.

## Asset object pattern

```json
{
  "id": "guest1",
  "asset": "human_guest_basic",
  "position": [390, 250, 4],
  "scale": 0.92,
  "expression": "happy",
  "wardrobe": {
    "shirtColor": "#2f80ed",
    "pantsColor": "#25324a",
    "hatColor": "#ffd34d"
  }
}
```

The position array is `[x, y, z]`. Higher `z` renders closer to camera.

## Required rig data

Each rigged asset should define:

```json
{
  "asset": "asset_id",
  "type": "character | creature | ride | vehicle | prop | environment",
  "parts": {
    "head": "part definition",
    "rightArm": "part definition"
  },
  "pivots": {
    "head": [175, 80],
    "rightArm": [232, 135]
  },
  "expressions": ["happy", "neutral", "surprised"],
  "motionCompatibility": ["walk", "wave", "talk", "gesture"]
}
```

## Naming convention

Use stable camelCase part names:

- `head`
- `mouth`
- `jaw`
- `leftArm`
- `rightArm`
- `leftUpperArm`
- `leftForearm`
- `rightUpperArm`
- `rightForearm`
- `leftLeg`
- `rightLeg`
- `tail`
- `frontWheel`
- `rearWheel`
- `train`
- `sign`

## Motion commands

### Talk

```json
{
  "start": 2.4,
  "duration": 2.5,
  "actor": "guest1",
  "action": "talk",
  "expression": "happy",
  "phonemes": ["smile", "open", "wide", "o"]
}
```

### Gesture

```json
{
  "start": 2.2,
  "duration": 2.0,
  "actor": "guest1",
  "action": "gesture",
  "parts": {
    "leftUpperArm": [0, -55],
    "rightUpperArm": [0, 42],
    "head": [0, -8]
  }
}
```

### Camera move

```json
{
  "start": 1.0,
  "duration": 4.5,
  "action": "camera_move",
  "from": [0, 0],
  "to": [160, 30],
  "fromZoom": 1,
  "toZoom": 1.08
}
```

## V17 recommendation

Move from procedural assets inside `assetFactory.js` to asset pack folders:

```text
assets/
  characters/human_guest_basic/manifest.json
  characters/human_guest_basic/parts/head.svg
  creatures/red_dino/manifest.json
  rides/coaster_icon/manifest.json
```

Then add a validator that confirms every manifest has pivots, required part names, compatible motions, default scale, and style metadata.
