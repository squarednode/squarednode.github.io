# V31 Signage Delta Changelog

Added signage category assets for wayfinding, safety, queue operation, and themed story-location signs.

Design rules maintained:

- No color-specific asset IDs.
- No attraction or IP names baked into asset IDs.
- Sign text is overrideable with the story-level `text` value.
- Colors are overrideable through `panelColor`, `accentColor`, `textColor`, `postColor`, `glowColor`, and `outlineColor`.
- Assets are self-contained under `assets/signage/<asset_id>/`.
- Catalog updated through `assets/catalog/asset_catalog.json`.
