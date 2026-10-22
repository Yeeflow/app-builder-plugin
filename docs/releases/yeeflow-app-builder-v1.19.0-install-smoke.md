# 1.19.0 installed-host verification

## Verified RC installation

- Source: `https://github.com/Yeeflow/app-builder-plugin.git`
- Tested ref: merged PR #12 commit `60aed5420aaf995ae4535bb7f8568f143dd6b3e5`
- Version: `1.19.0-rc1`
- Sparse paths: `.agents/plugins/marketplace.json`, `dist/yeeflow-app-builder-plugin`
- Marketplace / plugin: `yeeflow` / `yeeflow-app-builder`
- Display name: Yeeflow
- Installation: supported Codex marketplace and plugin CLI; source migrated from the historical repository without removing unrelated plugins.

The installer returned version 1.19.0-rc1 and an installed cache path. A subsequent plugin list confirmed installed/enabled state and the new source repository. A newly started Codex app-server, without any model turn, used `skills/list` with `forceReload` and `plugin/read`: both returned 31 skills. All three new specialists were enabled under the `yeeflow-app-builder:` namespace. Their discovered paths resolved to the installed 1.19.0-rc1 cache. Each SKILL.md and its skill-local reference was successfully read.

The 32 planning tests ran successfully from the installed payload with a working directory outside the plugin and source checkout. Coverage includes phase visibility and returns, upload guards, cache identity/isolation, forced retry, late responses, state-based validation, immutable attachment versions and native file mapping. These are deterministic local behavior tests, not inference or live business operations.

## Evidence boundaries and promotion

No email, OCR call or Yeeflow business read/write was performed. Authentication and live MCP acceptance were not retested. No model-generated smoke conversation, desktop screenshot, icon check or Claude installation test was performed; do not describe those as passed.

The user authorized merging PR #12, installing and verifying the new skills, and promoting stable only after verification. Final 1.19.0 metadata is prepared separately from the verified RC. Before advancing stable, reinstall the final commit and repeat fresh-host discovery, reference reads and installed planning tests. Record the final tested commit and stable ref in the delivery report. Preserve existing tags; do not infer a GitHub Release or store submission from branch promotion.
