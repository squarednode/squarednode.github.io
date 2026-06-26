# V21.1 Story Loader Patch

## Added

- Story JSON dropdown in the player UI.
- `stories/story_catalog.json` to register available stories.
- Custom story path input field.
- Query-parameter story loading, for example: `engine/player.html?v=21.1&story=episode_expansion_test`.
- No-renaming workflow for loading expansion test stories.

## Notes

The default story remains `../stories/episode_001.json`, but users can now load any story declared in the catalog or manually load another JSON file path.
