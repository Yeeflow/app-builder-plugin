# Yeeflow for Claude

Claude 1.17.0 has passed the recorded package, repository installation and web upload checks. On 2026-10-10, the user confirmed that the MCP issue was resolved and separately confirmed application creation and verification through the Yeeflow plugin in Codex. Those results are recorded with their host and evidence source in [the latest verification status](claude-plugin-verification-2026-10-10.md). Its package and repository marketplace are separate from the existing OpenAI submission and publication lifecycle.

## Build

Use Node and zip/unzip from the repository root:

```sh
npm run build:claude-plugin -- --output artifacts/claude/yeeflow-claude-1.17.0.zip
npm run test:claude-plugin
npm run test:plugin-host-profiles
```

The builder reuses the existing tracked-file archive selector and dependency repairs, then converts only a temporary payload into `dist/yeeflow-claude-plugin`. It does not change the OpenAI payload or its transport settings. The ZIP has `.claude-plugin/plugin.json`, `.mcp.json`, 27 Skills and their shared dependencies at its root. Generated Claude files must be rebuilt rather than edited manually. The regression test compares the checked-in Claude directory against a fresh build, so a stale repository payload cannot pass merely because a new ZIP builds correctly.

Skills receive Claude-specific resource reading, hosted MCP discovery, OAuth and local-execution guidance after the frontmatter. Host-specific cache-update instructions are removed. Historical developer paths in Skills become historical artifact labels. References describing OpenAI release operations remain historical/maintainer documentation, not Claude publishing instructions. Never claim filesystem or Node execution in a host that does not expose those tools.

## Test installation

In Claude Desktop: Customize > Plugins > Add > Upload plugin. Select the ZIP and check the plugin name/version and Skill inventory. Complete Yeeflow login through Claude's MCP/connector OAuth flow. Never copy OpenAI credentials or tokens.

The [2026-10-08](claude-plugin-verification-2026-10-08.md) and [2026-10-09](claude-plugin-verification-2026-10-09.md) reports preserve historical OAuth failures. The user confirmed resolution on 2026-10-10; those historical errors are not the current reported blocker. [Claude's auth requirements](https://claude.com/docs/connectors/building/authentication#dcr-and-cimd-details) explain that CIMD selection requires both CIMD support and public-client token authentication in issuer metadata. The final registration mechanism and server-side fix were not independently captured in this checkout. Application creation verified in Codex is recorded as Codex evidence, not as a Claude-specific application test.

If Claude Code is available:

```sh
claude plugin validate ./dist/yeeflow-claude-plugin
claude plugin validate .
claude plugin marketplace add "$(pwd)"
claude plugin install yeeflow-app-builder@yeeflow-claude
claude plugin list
```

Record host/version, installation source/result, loaded Skill count, OAuth result and discovered tools. Read a bundled reference and run a bundled validator with host file tools. Then list authorized workspaces and inspect a selected application read-only. Installation and local validation do not prove OAuth or Yeeflow runtime behavior.

A write/runtime test requires an explicitly selected disposable workspace and authorized creation scope. Read saved resources back and inspect the actual rendered page before claiming runtime acceptance. Do not create or change existing tenant applications solely to test installation.

## Marketplace and independent release

`.claude-plugin/marketplace.json` points only to `dist/yeeflow-claude-plugin`. Existing Codex marketplace and OpenAI build profiles retain their own paths. Commit the generated Claude directory with the source changes; ZIP artifacts remain ignored.

Once merged/pushed to the branch Claude uses, Add marketplace can use `Yeeflow/app-builder-codex-plugin`. Before then, use the ZIP, a local marketplace, or the tested branch-pinned Claude Code command:

```sh
claude plugin install yeeflow-app-builder --marketplace Yeeflow/app-builder-codex-plugin#codex/claude-plugin-adaptation
```

 A local manifest alone does not make repository installation available remotely.

Use Claude-specific tags such as `claude-v1.17.0-rc1`; final Claude tags require documented installation acceptance. Do not reuse OpenAI release tags or modify its submission packet for a Claude-only change. Shared Skill or MCP changes may affect both hosts and require both-host validation. The compatibility workflow tests packages on pull requests; it does not publish or release either host.

Official format reference: https://code.claude.com/docs/en/plugins-reference
Official marketplace reference: https://code.claude.com/docs/en/plugin-marketplaces
