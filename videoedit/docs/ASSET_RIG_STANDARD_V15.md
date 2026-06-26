# Asset Rig Standard V15

Every reusable render asset should follow this pattern.

## Required fields

```json
{
  "id": "creature_trex",
  "type": "creature",
  "style": "simple_theme_park_svg_v2",
  "parts": {},
  "rig": {},
  "expressions": {},
  "motions": {}
}
```

## Creature rig points

Minimum useful rig points:

| Part | Purpose |
|---|---|
| body | Main transform root |
| head | Look left/right/up/down |
| jaw | Talking, biting, expressions |
| leftArm/rightArm | Wave, point, reach |
| leftLeg/rightLeg | Walk cycle |
| tail | Secondary motion |
| eyes/brows | Emotion state |

## Style rules

- Thick black outline
- Simple rounded forms
- Flat fill colors with optional simple highlight or belly patch
- Avoid tiny details that will disappear in motion
- Each moving part must be its own SVG group
- Every movable part must declare a pivot point

## 2.5D rules

- Every actor gets `position: [x, y, z]`
- Higher `z` draws in front
- Farther-back actors should generally be smaller
- Environment should be split into far, mid, near layers later

## Story/action command rules

Commands must be time-based and deterministic:

```json
{
  "start": 1.0,
  "duration": 2.0,
  "actor": "dino1",
  "action": "wave",
  "part": "rightArm"
}
```

No command should require custom per-scene hand animation unless the library does not have that motion yet.
