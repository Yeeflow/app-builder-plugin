# 1.20.2 published-artifact verification — 2026-10-28

Independent check of the published releases. It covers artifacts only; host install evidence is in the [1.20.2 release notes](releases/yeeflow-app-builder-v1.20.2.md#install-smoke).

| Check | Result |
|---|---|
| Tags `yeeflow-app-builder-plugin-v1.20.2` and `yeeflow-cursor-plugin-v1.20.2`, `main` and `stable` | All point to `d0d2d7cdcea3573745fd256b01310e799bd77160` |
| Both releases final (not draft or pre-release) | Yes |
| Every asset's GitHub API digest and its `.sha256` file | Match the downloaded bytes (4 ZIPs) |
| Clean rebuild at the tag commit | Claude and Cursor distributions reproduce the committed `dist` exactly |
| Published ZIP contents vs clean rebuild | Identical: Codex (1,904 files), directory (1,904), Claude (1,897), Cursor (1,897) |
| Published Cursor ZIP vs `dist/yeeflow-cursor-plugin` at the tag | Identical; manifest `yeeflow` `1.20.2`; 31 skills; both newly bundled cited references present |
| Grok Bot test-kit URLs (release ZIP, `.sha256`, raw `SKILL.md` at the tag) | HTTP 200; raw skill hashes match the test kit |

Cursor ZIP SHA-256: `3818818501e7068c387450f50917512c19ebd1f61d708b6c0851d0dc142c3a93`.

Not covered: installation, OAuth or behaviour in any host; Designer or live runtime behaviour.
