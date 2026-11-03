# Yeeflow App Builder 1.19.0-rc1

Candidate extension based on 1.18.1. This adds three specialist skills and enhances six existing skills, bringing both host distributions to 31 skills. The 1.18.1 Feature Configuration Guide and its symlink-safe helper remain included.

## New specialists

- `yeeflow-workflow-stage-ui`: native progress driven by actual tasks, phase gates, task-page Toggle defaults, separate editable demos, and phone/tablet proof.
- `yeeflow-attachment-ocr-orchestrator`: single-attachment applicability and upload-completion guards, authorized MD5 plus file-type success cache, manual retry, in-flight deduplication, and stale response protection.
- `yeeflow-document-archive-lifecycle`: explicit document identity and version policy, latest approved reuse, native attachment mapping, and approval writeback proof.

## Enhanced skills

Approval Form, Expression, Data List, Dashboard, Custom Code, and Runtime Test receive focused guidance linked to shared document-workflow standards. Existing source content is preserved; project-specific taxonomy, identity keys, spacing, colors, groups and status semantics are not imposed globally.

`docs/standards/document-workflow-distribution.json` explicitly lists the new resources. The preparation script keeps them in future rebuilds. Host tests assert 31 skills; the Claude builder derives its version from the shared manifest. Hosted MCP settings and marketplace identities remain unchanged.

## Validation and release boundary

The local planning suite has 32 state, cache, validation, version and mapping tests. Distribution tests check new references, mirror parity, retained feature-guide support and host guidance. Host profile and Claude package regression gates must pass before this candidate is accepted.

No live third-party OCR request or callback is established by these tests. No new business workflow, user permissions or tenant data is changed. Existing project proof has been sanitized and its limits are documented in `docs/document-workflow-skills-evidence.md`.

This candidate is not an installed-host acceptance record. No final release tag, GitHub Release, marketplace submission or stable promotion should be inferred from a successful build or PR. Installation/discovery and actual host smoke remain required before stable promotion.

## Local verification record

| Check | Result |
| --- | --- |
| Pure planning regression tests | 32 passed; no network or live writes |
| Specialist distribution / enhancement mirrors | Passed; 3 new, 6 enhanced, 31 total |
| Codex and ChatGPT Web host profiles | Passed; both archives, shared parity and validator entrypoints |
| Claude distribution regeneration | Passed; 31 skills, shared resources, source immutability |
| Feature Configuration Guide | Passed on source/Codex/Claude, direct and symlinked paths |
| Plugin MCP metadata and unified connection gates | Passed; hosted transport unchanged |
| Packaged Skill format | 31 passed |
| Packaged JSON parse | 567 passed |
| Packaged JS/MJS syntax | 530 passed |
| Relative references and source-root hygiene | Passed |

Recorded from the development checkout based on commit `37ef13a189563d17ec94070a224e26162a15dbd5`. These are local checks, not installed-host or live OCR acceptance.
