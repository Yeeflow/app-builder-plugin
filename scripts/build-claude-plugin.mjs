#!/usr/bin/env node
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, renameSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { consolidateClaudeResources } from "./claude-shared-resources.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const outputIndex = args.indexOf("--output");
if (args.length !== 2 || outputIndex !== 0 || !args[1]) {
  throw new Error("Usage: node scripts/build-claude-plugin.mjs --output <zip>");
}
const output = resolve(root, args[outputIndex + 1]);
const dist = resolve(root, "dist/yeeflow-claude-plugin");
if (!output.endsWith(".zip") || output.startsWith(resolve(root, "dist") + "/")) throw new Error("Archive must be a .zip outside distribution directories");
const temp = mkdtempSync(join(tmpdir(), "yeeflow-claude-"));
try {
  // Reuse reviewed file selection and dependency repairs; do not mutate OpenAI payload.
  execFileSync(process.execPath, [resolve(root, "scripts/build-plugin-archive.mjs"), "--tracked-only", "--output", join(temp, "source.zip")], { cwd: root, stdio: "inherit" });
  execFileSync("unzip", ["-q", join(temp, "source.zip"), "-d", temp]);
  const stage = join(temp, "yeeflow-app-builder-plugin");
  const original = JSON.parse(readFileSync(join(stage, ".codex-plugin/plugin.json"), "utf8"));
  rmSync(join(stage, ".codex-plugin"), { recursive: true });
  rmSync(join(stage, ".app.json"), { force: true });
  mkdirSync(join(stage, ".claude-plugin"));
  const manifest = {
    name: "yeeflow", displayName: "Yeeflow", version: "1.17.1-rc.1",
    description: "Build and maintain Yeeflow business applications with guided skills and hosted MCP.",
    license: "MIT", author: {...original.author, email: "support@yeeflow.com"}, homepage: "https://www.yeeflow.com",
    repository: "https://github.com/Yeeflow/app-builder-plugin",
    keywords: ["yeeflow", "applications", "workflow"],
    skills: "./skills/", mcpServers: "./.mcp.json"
  };
  writeFileSync(join(stage, ".claude-plugin/plugin.json"), JSON.stringify(manifest, null, 2) + "\n");
  const guidance = `## Claude host requirements

If the Skill tool reports a virtual or missing base directory, do not assume bundled files are missing. When filesystem tools are available, locate .claude-plugin/plugin.json under the host-provided plugin mounts, verify its name is yeeflow and version matches this session, and resolve resources from that actual root. Do not use another installed version or another host cache. If multiple roots match, stop and report ambiguity.

Resolve this plugin root from the loaded skill path (<plugin-root>/skills/<skill-name>/SKILL.md), or CLAUDE_PLUGIN_ROOT when provided. Read bundled resources with Claude's available file tools. Resolve shared docs, scripts and core from the plugin root, never from a developer checkout or another host's cache.

Use only the discovered tools of this plugin's unified yeeflow_mcp connection. Authenticate through Claude's connector/MCP OAuth flow. Never copy OpenAI login tokens or invent tool namespace prefixes. Do not fall back to direct REST calls, API keys or retired MCP endpoints.

Run bundled validators with the host's available Node runtime. File execution is available only where Claude supplies a filesystem and execution tools. In chat, report missing execution access and continue supported MCP work; never claim unexecuted validation passed. Use browser tools only when available and authorized; API acceptance, readback, designer rendering and runtime proof are separate.

Do not edit installed plugin caches or another host's skills. Put learning changes in an explicitly selected development checkout and rebuild this Claude package there. Maintainer references describing Codex/OpenAI publishing are for those platforms; Claude publishing uses docs/claude-plugin.md and scripts/build-claude-plugin.mjs in the source repository.

`;
  let count = 0;
  for (const name of readdirSync(join(stage, "skills"))) {
    const file = join(stage, "skills", name, "SKILL.md");
    if (!existsSync(file)) continue;
    let body = readFileSync(file, "utf8");
    body = body.replace(/training Codex/g, "training Claude")
      .replace(/asks Codex to/g, "asks Claude to")
      .replace(/use the Codex Yeeflow environment/g, "use the authorized Yeeflow tenant")
      .replace(/sync the relevant project skill mirrors and active `~\/.codex\/skills` installs/g, "update the relevant source skill mirrors in the selected development checkout and rebuild the Claude package")
      .replace(/support chatgpt and codex workflows/g, "support Claude workflows")
      .replace(/\/Users\/[^`\n]+(?=`)/g, value => "<historical-local-artifact>/" + value.split("/").pop())
      .replace(/\/Users\/[^\s`<>]+/g, value => "<historical-local-artifact>/" + value.split("/").pop());
    const end = body.indexOf("\n---", 3);
    if (!body.startsWith("---\n") || end < 0) throw new Error("Skill frontmatter missing: " + name);
    const offset = end + 4;
    body = body.slice(0, offset) + "\n\n" + guidance + body.slice(offset);
    writeFileSync(file, body);
    count++;
  }
  if (count !== 27) throw new Error("Expected 27 skills; review source inventory before release");
  writeFileSync(join(stage, "CLAUDE-README.md"), "# Yeeflow for Claude\n\nVersion " + manifest.version + ". Testing candidate: installation, OAuth and live runtime acceptance require separate verification. See the source repository docs/claude-plugin.md.\n");
  writeFileSync(join(stage, "README.md"), readFileSync(resolve(root, "docs/claude-public-readme.md"), "utf8"));
  writeFileSync(join(stage, "LICENSE"), readFileSync(resolve(root, "docs/claude-plugin-LICENSE.txt"), "utf8"));
  const sharing = consolidateClaudeResources(stage);
  console.log("CLAUDE_SHARED_RESOURCES " + JSON.stringify({removedFiles:sharing.removedFiles,savedBytes:sharing.savedBytes}));
  // ZIP has plugin files at its root, including the hidden manifest directory.
  mkdirSync(dirname(output), { recursive: true });
  rmSync(output, { force: true });
  execFileSync("zip", ["-qr", output, "."], { cwd: stage });
  rmSync(dist, { recursive: true, force: true });
  renameSync(stage, dist);
  console.log("CLAUDE_PLUGIN_BUILT " + manifest.version + " skills=" + count + " zip=" + output);
} finally { rmSync(temp, { recursive: true, force: true }); }
