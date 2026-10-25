# Plugin host build profiles

The archive builder is the single packaging entrypoint for local and registered-App hosts plus the directory candidate. All profiles preserve all 31 skills and the complete shared runtime/template payload. Version comes from the released distribution manifest; this command does not publish, move stable, or reinstall a local plugin.

## Codex

```sh
node scripts/build-plugin-archive.mjs --profile codex --output /tmp/yeeflow-codex.zip
```

The default remains `codex`, with the existing archive layout and direct `.mcp.json` configuration. Existing release consumers need no new arguments.

## Private registered-App distribution (chatgpt-web)

Obtain actual registered App IDs from the target workspace or publishing organization. Supply a reviewed JSON file with exactly `apps` and one mapping `yeeflow`, containing only `id`. IDs must begin with `asdk_app_`, `connector_`, or `templated_apps_`, followed by an alphanumeric character and then alphanumeric, underscore or hyphen characters. The ID must belong to the unified endpoint, not one of the retired scoped connections. This legacy upload profile currently rejects IDs beginning `plugin_asdk_app_`. Current OpenAI local-plugin documentation also describes that technical ID form; confirm the target host/import contract before changing or converting an ID. ID syntax checks do not establish existence, authorization or connectivity.

```sh
node scripts/build-plugin-archive.mjs --profile chatgpt-web \
  --apps /absolute/path/to/reviewed-apps.json \
  --output /tmp/yeeflow-chatgpt-web.zip
```

This generates `.app.json`, removes direct MCP manifest configuration **and** `.mcp.json`/`mcp.json` discovery files, and uses the manifest name as the top-level archive folder. All four capability domains use the single registered unified App. No review organization IDs are built in or silently used in production.

For side-by-side review, explicitly choose a distinct identity:

```sh
node scripts/build-plugin-archive.mjs --profile chatgpt-web \
  --apps /absolute/path/to/reviewed-apps.json \
  --name yeeflow-app-builder-web-review \
  --display-name 'Yeeflow App Builder — Web Review' \
  --output /tmp/yeeflow-web-review.zip
```

ChatGPT's Add plugin upload creates an identity and rejects an existing name. Do not treat uploading a version change as an update or delete the existing plugin to make room. Use the supported update mechanism when available, or keep a separately named review candidate. Do not change the public identity merely to bypass a collision.

## Directory-compatible OAuth candidate

Use this profile for the shared plugin installed independently by each user. It generates the supported `.codex-plugin/plugin.json` and `.mcp.json` compatibility layout, preserves the plugin identity and all 31 skills, declares the unified HTTPS MCP endpoint and OAuth with DCR, and excludes registered App references, compatibility autodiscovery files and hooks. The host owns each user's independent OAuth connections and routes calls to the selected account. There is no per-user configuration file, App ID, credential or shared login in the package.

```sh
node scripts/build-plugin-archive.mjs --tracked-only --profile directory \
  --version 1.20.0-local.1 --output /absolute/path/to/yeeflow-directory-local.zip
```

`--version` overrides only the staged archive manifest; it does not modify the source distribution version, install a plugin or create a tag. Omit it to use the source distribution version. The directory profile rejects `--apps`, `--name` and `--display-name` so an individual developer's App mapping or private identity cannot be reused accidentally. Default `codex` behavior remains compatible.

This is a local candidate format, not a store submission or an approval claim. Package checks do not establish OAuth server correctness, live profile identity or multi-account isolation. Before any later submission, review all current listing/reviewer requirements and the existing review/support status. Do not upload, reconnect, rescan, replace or cancel a version under review as part of local testing.

See [independent sign-in and multi-account validation](multi-account-oauth.md) for the server contract and runtime acceptance matrix.

## Shared repairs and build gates

- At archive staging, the application-generator validator delegates to the canonical root validator; its shared dependencies resolve from the package regardless of the caller's working directory. This avoids future regeneration restoring a stale standalone validator copy.
- Every staged skill receives the centrally maintained `plugin-resource-access.md` instructions. Read skill-local references through the skill API; resolve shared root references through the current host's mounted filesystem. Do not hardcode a local checkout, host path or cache version.
- The staged package includes `scripts/test-skill-entrypoint-compat.mjs`. It exercises positive and negative field/schema/workflow fixtures and launches the validator from a temporary cwd.
- `npm run test:plugin-host-profiles` builds and extracts all three profiles, checks 31 skills, shared payload byte parity, transport metadata, invalid/missing IDs and legacy four-App mappings, and executes the archived regression entrypoints from a temporary cwd.
- CI runs this gate on PRs to main/stable and manual dispatch. `--tracked-only` packages tracked dist plus existing explicit reviewed manifests; the host repair overlay is applied even in this mode. Full builds additionally run the existing core/execution build steps.

## Hosted proof boundary

Historical evidence for the previous four-service transport only: the 2026-09-14 Web Review test installed successfully, recognized 27 skills and four connected Apps, read an application skill and root reference, ran the validator and synthetic regression, and completed `workspace_list` (Status 0, isError false, 8 results). Each service separately passed a minimal ChatGPT read test. This supports the host-specific transport split, not exhaustive skill/tool validation or public marketplace approval.

After any new package is uploaded, verify ingestion, user installation, skill/resource access, script execution and minimal reads on the host. A local build gate alone does not establish these hosted results. Tenant writes and public release require their own authorized scope and acceptance evidence.
