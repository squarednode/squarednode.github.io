# Asset Pack Standard V18

V18 asset packs can contain real SVG part files. The engine loads the pack catalog, loads each pack manifest, then hydrates all SVG parts listed by every `external-svg` asset.

## Catalog

```text
assets/catalog/asset_packs.json
```

Example:

```json
{
  "version": "18.0.0",
  "packs": [
    { "id": "core-characters", "manifest": "../packs/core-characters/manifest.json" }
  ]
}
```

## Pack manifest

```json
{
  "id": "core-characters",
  "label": "Core Characters",
  "version": "18.0.0",
  "style": "simple_theme_park_svg_v4",
  "assets": []
}
```

## External SVG asset

```json
{
  "id": "human_guest_basic",
  "type": "character",
  "label": "Rigged Park Guest",
  "mode": "external-svg",
  "path": "human_guest_basic/",
  "source": "external-svg",
  "defaults": {
    "skinColor": "#c98657",
    "shirtColor": "#2f80ed"
  },
  "rig": ["head", "mouth", "rightUpperArm", "rightForearm"],
  "parts": [
    { "name": "body", "file": "body.svg", "pivot": [175, 180], "order": 20 }
  ]
}
```

## Part rules

- Each part file should be a normal SVG file.
- Coordinates should share the asset's common local coordinate system.
- The engine imports the SVG children into a generated part group.
- `pivot` defines the rotation point used by timeline commands.
- `order` defines draw order within the actor.
- Use stable rig names such as `head`, `jaw`, `mouth`, `leftUpperArm`, `rightForearm`, `frontWheel`, `rearWheel`, `wheel`, and `sign`.

## Template values

SVG files may use simple placeholders:

```svg
<path fill="{{shirtColor}}" />
<text>{{text}}</text>
```

Values come from manifest defaults, actor wardrobe, and actor fields in the story JSON. Actor fields win.

## Mouth control

Character mouth assets should use one mouth part only:

```svg
<path data-mouth-shape="smile" d="..." />
```

The manifest may define `mouthShapes`. Timeline `talk`, `mouth`, and `expression` commands update that one path. Do not stack multiple mouth SVGs unless intentionally creating a special effect.

## Style baseline

Use the V18 core assets as the target detail level:

- rounded cartoon forms
- thick black outline
- simple flat fills
- limited highlight/detail lines
- clear silhouette at video size
- riggable parts with obvious pivots
