# V19.1 Patch

## Changes

- Asset Library now has a fixed max height and scrolls as the library grows.
- Human guest no longer renders legacy detached skin-colored forearm/hand shapes. The active rig keeps upper arms, legs, head, and mouth.
- Coaster icon now renders track only. Trains/carts should be placed as separate vehicle actors for cleaner story control.

## Reason

This keeps the simple SVG style consistent while avoiding misleading baked-in details that cannot be independently rigged.
