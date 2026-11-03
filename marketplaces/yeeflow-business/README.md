# Yeeflow Business workspace plugin

This marketplace manages the existing Yeeflow Business workspace plugin. It preserves its registered plugin ID and App reference so native Connected accounts and all 31 Skills remain on one Manage page. It is scoped to this workspace; importing it into another workspace or a Personal account is not supported.

Admin import source: https://github.com/Yeeflow/app-builder-plugin
Path: marketplaces/yeeflow-business
Use the reviewed candidate branch first. Switch to stable only after import and runtime checks pass.

GitHub management preserves workspace sharing and policies. It does not connect accounts for members. Each member installs Yeeflow and authorizes their own accounts. After migration, updates come from this Git source instead of archive uploads. Do not remove the pluginId or substitute a personal test App.

## Validation before GitHub migration

- Uploaded candidate 1.21.0-rc3: 31 Skills, native Connected accounts, no RC Test intermediary.
- Two separate workspace members independently installed and authorized the same plugin.
- First member retains two accounts; read-only round trip returned workspace counts 11, 20, 11 and matching first/last identities.
- Second member independently returned their own authenticated profile and one workspace.
- No business records were read or modified.
- GitHub import completed at candidate commit 4fd0eee7, preserving the original plugin ID, Enabled/Available policies, all 31 Skills and all three member connections. Post-sync runtime checks and stable promotion are recorded separately.

See https://learn.chatgpt.com/docs/enterprise/plugin-management for the supported migration mechanism.
