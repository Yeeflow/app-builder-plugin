# Claude plugin directory build

The public Claude plugin directory listing is published from a separate repository, [Yeeflow/yeeflow-claude-plugin](https://github.com/Yeeflow/yeeflow-claude-plugin). Its contents are generated from the Claude distribution in this repository (`dist/yeeflow-claude-plugin`). Do not edit the public repository by hand; rebuild it.

## Why a separate build

The directory's validator downloads the whole repository and checks the plugin folder against the [pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist):

| Limit | This repository / full Claude build | Directory build |
|---|---|---|
| Repository archive ≤ 50 MiB compressed, ≤ 256 MiB unpacked | ~626 MB (release ZIPs in `dist/`) — validation stops | ~3 MB compressed |
| ≤ 512 files in the plugin (otherwise held for a reviewer) | 1,861 | ~460 |
| Text files ≤ 256 KiB (otherwise held for a reviewer) | 16 over | 6 over (data that cannot be compacted safely) |

The full build also timed out in portal validation. The directory build keeps the marketplace and Codex builds unchanged.

## What the directory profile does

`scripts/claude-directory-profile.mjs` runs on a staged copy, in order:

1. **Prune** maintainer-only material: the `yeeflow-plugin-release-manager` and `yeeflow-feature-learning-orchestrator` skills, test scripts (`test-*.mjs`, `*.test.mjs`), Codex `agents/openai.yaml`, `CHANGELOG.md`, `docs/releases/`, `docs/training/`, `fixtures/`, `execution/`, `distribution-files.json` and release/packaging scripts.
2. **Dedupe** byte-identical copies (mostly validators copied into several skill folders) to one canonical file, preferring `scripts/`, then the plugin root. Relative `require`/`import` specifiers, `path.join(__dirname, …)` literals and Markdown paths are rewritten. A copy that some code still names through another literal (candidate lists, `path.join(repoRoot, …)`, spawned scripts) is kept.
3. **Bundle** each `docs/studies/normalized/<topic>/` folder of JSON study outputs into `docs/studies/normalized/<topic>.bundle.json`. A reference `…/<topic>.bundle.json#<name>` means `files["<name>"]` in that file. Scripts only write to these folders (`--normalized-dir`), so no code path changes.
4. **Closure**: keep only files reachable from the shipped skills, manifest, README, LICENSE and icon, following paths, folders and code imports transitively.
5. **Collect** Markdown in `docs/`, `docs/studies/`, `docs/standards/` and each skill's `references/` into `collection-NN.md` files (≤ 220 KiB each). Each source document starts at `<a id="<name>"></a>`; references become `collection-NN.md#<name>`. Markdown that code opens by path keeps its own file.
6. **Compact** JSON data over 256 KiB (same parsed value; files containing integers beyond 2^53 are left byte-for-byte).
7. **Verify** file count, file sizes and that no relative import became unresolved.

The build then sets `repository` in `plugin.json` to the public repository, adds a short note to each skill's *Claude host requirements* block explaining bundle and collection references, and writes `.claude-plugin/marketplace.json` with `source: "./"`.

## Build, test and publish

```sh
npm run build:claude-plugin -- --output artifacts/claude/yeeflow-<version>.zip   # if skills changed
npm run test:claude-plugin
npm run test:claude-directory

git clone https://github.com/Yeeflow/yeeflow-claude-plugin ../yeeflow-claude-plugin
# empty the working tree but keep .git
git -C ../yeeflow-claude-plugin rm -rq . && git -C ../yeeflow-claude-plugin clean -fdq
npm run build:claude-directory -- --output ../yeeflow-claude-plugin --report artifacts/claude/directory-report.json
claude plugin validate ../yeeflow-claude-plugin
git -C ../yeeflow-claude-plugin add -A && git -C ../yeeflow-claude-plugin commit -m "Yeeflow <version>"
git -C ../yeeflow-claude-plugin push
```

The directory follows the public repository's default branch. After a push it scans the new commit; open the plugin at [claude.ai/directory/manage](https://claude.ai/directory/manage) and select **Check for new commits** to scan immediately. Raise `version` in `plugin.json` with every release.

## Verification performed for 1.17.2

- `claude plugin validate`: passed (only advisory: marketplace description).
- Every shipped script was run with `--help` in the full build and the directory build: identical exit codes, no new module-load errors (282 scripts).
- Every shipped script was run against 7 fixture inputs in both builds: 1,575 runs, byte-identical output after path normalisation.
- Markdown path references: the only references that no longer resolve point at intentionally removed maintainer or test material.
- Pre-existing issue, not introduced here: `tools/generators/generate-sub-list-dynamic-actions-runtime-proof.mjs` and `tools/generators/generate-vendor-onboarding-yapk-schema-v2.mjs` import `./scripts/...` relative to `tools/generators/` and fail to load in both builds.

Installation, OAuth and live Yeeflow runtime behaviour still need a separate smoke test after publishing.

## Lean edition

`npm run build:claude-directory -- --output <dir> --edition lean` builds a much smaller directory payload for when interactive portal validation times out on the full build. On 2026-10-26, 2.6 MB validated and 8.4 MB timed out.

- Ships the 14 connector-oriented skills listed in `LEAN_SKILLS` in `scripts/claude-directory-profile.mjs`: the Feature Configuration Guide, the MCP incremental application builder, the workflow stage UI, OCR and document archive skills, data reports, knowledge sources, and the AI Agent/Copilot skills. With their dependencies this comes to about 0.45 MB.
- The generator/validator stack is left out: package generation, layout templates, golden references and local validators. Every one of those skills needs 10–17 MB of shared data and scripts.
- If a kept skill's dependency footprint exceeds `LEAN_BUDGET_BYTES` (400 KiB), the build changes its links into that stack into "full Yeeflow plugin only" mentions. The surrounding rules stay, and an edition note goes after the front matter. Today this applies only to the incremental builder's dashboard paragraphs.
- Kept skills that mention a specialist that isn't shipped get a note pointing to the full plugin.
- The README is replaced with a short directory-edition README that links the published connector and the full plugin.

Source skills and the marketplace/Codex payloads are never modified. `npm run test:claude-directory` builds both editions and checks the lean skill list, its size, its links and anchors, and the helper.
