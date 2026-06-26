# Ride Through Foundation Standard V20

V20 locks the system rules before mass asset expansion.

## 1. Asset scale standard

Each asset declares:

```json
"scaleClass": "character_standard",
"artboard": [300, 400],
"groundPoint": [150, 400]
```

Baseline classes:

```text
character_standard     300 x 400
creature_standard      600 x 500
vehicle_standard       500 x 300
ride_large             900 x 520
landmark_large         800 x 500
prop_standard          220 x 220
environment_1280x720   1280 x 720
```

## 2. Semantic anchors

Rig pivots move parts. Anchors attach story objects to meaningful locations.

```json
"anchors": {
  "ground": [150, 400],
  "mouth": [175, 102],
  "rightHand": [247, 220],
  "seat": [165, 120]
}
```

Even when hands are not drawn, hand anchors remain available for balloons, tickets, maps, tools, and speech bubbles.

## 3. Categories

Allowed category names:

```text
characters
creatures
vehicles
rides
landmarks
environments
props
wardrobe
facial_features
effects
signage
background_layers
```

Each asset should also include `subcategory`, `rigType`, `style`, and `tags`.

## 4. Motion compatibility

Each asset declares supported motions:

```json
"motions": ["idle", "enter", "exit", "walk", "wave", "talk", "gesture", "scale"]
```

The story validator warns when a timeline command calls a motion not listed for the asset.

## 5. Expressions vs phonemes

Expressions describe emotion. Phonemes describe talking mouth shapes.

```json
"expressions": {
  "happy": {},
  "neutral": {},
  "surprised": {}
},
"phonemes": {
  "rest": "smile",
  "A": "open",
  "E": "wide",
  "O": "o",
  "M": "neutral"
}
```

Mouth rendering must stay single-layered. Do not stack a base mouth plus expression mouths unless hidden by the engine.

## 6. Naming convention

Asset ids must not include color names. Color belongs in defaults, actor overrides, wardrobe, or story JSON.

Correct:

```text
creature_trex
```

Incorrect:

```text
creature_red_dino
creature_green_dragon
vehicle_blue_cart
```

SVG files stay lowercase with underscores and no spaces.

## 7. Thumbnails

Every asset may declare:

```json
"thumbnail": "thumbnail.svg"
```

The validator reports missing thumbnails as informational, not fatal.

## 8. Story validation

The story validator checks missing assets, bad actor references, unsupported motions, bad position arrays, bad expression names, and timeline commands that exceed shot duration.

## 9. Environment layer standard

Environments are not props. They use external layered files:

```json
"layers": [
  { "id": "sky", "file": "sky.svg", "depth": -100, "parallax": 0.05, "order": 0 },
  { "id": "far", "file": "far_hills.svg", "depth": 0, "parallax": 0.35, "order": 10 }
]
```

## 10. Ride scenery vs ride vehicle separation

Ride scenery and vehicles remain separate assets.

```text
ride_coaster_track     scenic track only
vehicle_cart_basic     moving vehicle actor
vehicle_omni_mover     moving vehicle actor
```
