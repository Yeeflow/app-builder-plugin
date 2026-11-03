# Yeeflow App Builder 1.18.1

Fixes the `yeeflow-feature-configuration-guide` helper (`scripts/knowledge.mjs`) printing nothing when the plugin is reached through a symlinked path, which is how Claude's synced plugin cache is mounted. Node reports the script's real path while the command line keeps the symlinked path, so the 1.18.0 entry check never matched and the helper exited with status 0 and no output. The check now compares real paths.

Adds `npm run test:feature-configuration-guide`, which runs the helper in the source skill and both distributions, directly and through a symlink, and is included in the plugin host compatibility CI job. No skill content, catalog entries or other skills change; 28 Skills remain bundled.

Validation boundaries: offline package, parity and helper tests only. Install acceptance and tenant runtime behavior remain pending.
