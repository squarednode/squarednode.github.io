# V21 Asset Expansion Pack 01

This release starts the real reusable asset library after the V20 foundation lock.

## Added packs

- expansion-characters-pack-01: 5 humanoid character variants using the simplified no-visible-hands rig.
- expansion-creatures-pack-01: 5 creature variants with color overrides and rigged parts.
- expansion-vehicles-pack-01: 5 vehicles, with wheeled and non-wheeled motion compatibility separated.
- expansion-rides-pack-01: 5 ride/scenic systems. Track/scenery remains separate from vehicles.
- expansion-props-pack-01: 10 story props.
- expansion-landmarks-pack-01: 5 large scenic landmarks.
- expansion-environments-pack-01: 5 layered 2.5D environments.

## Naming rule

Asset IDs avoid baked-in color names. Color is controlled by story overrides, wardrobe, or defaults.

Example:

```json
{
  "asset": "creature_dragon",
  "color": "#4f9f45",
  "bellyColor": "#b9e4a6"
}
```

## Test story

`stories/episode_expansion_test.json` is included as a simple lineup scene that calls assets from multiple new packs.
