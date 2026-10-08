# Yeeflow for Claude

Claude 1.17.0 is a testing candidate until installation, OAuth and live operation evidence below is recorded. Its package and repository marketplace are separate from the existing OpenAI submission and publication lifecycle.

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

In Claude Desktop: Customize > Plugins > Add > Upload plugin. Select the ZIP and check the plugin name/version and Skill inventory. Complete Yeeflow login through Claude's MCP/connector OAuth flow. The web tests installed the package in both Free and Pro accounts, but OAuth failed before a login popup opened: default published-client identity (CIMD) returned HTTP 400, and automatic registration (DCR) in the Pro account displayed a sign-in registration failure. Do not claim either registration mode is runtime-supported until login and authenticated reads succeed. Never copy OpenAI credentials or tokens.

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
