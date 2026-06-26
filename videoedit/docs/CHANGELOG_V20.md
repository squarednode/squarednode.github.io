# V20 Changelog

## Added

- Asset category schema.
- Scale classes, artboards, and ground points.
- Semantic anchors.
- Motion compatibility tags.
- Story validation panel.
- Layered external environment pack.
- Thumbnail declarations.
- Color-word naming validation.

## Changed

- `creature_red_dino` renamed to `creature_trex`.
- `ride_coaster_icon` renamed to `ride_coaster_track`.
- Coaster track remains scenic-only; vehicles are separate actors.
- Default story updated to use `park_path_day` environment.

## Rule locked

Asset IDs must describe the reusable object, not a color variant. Color must be driven by manifest defaults or story-level overrides.
