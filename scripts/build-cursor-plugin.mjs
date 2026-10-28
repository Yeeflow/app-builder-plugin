#!/usr/bin/env node
// Build the Cursor-format Yeeflow plugin used by Cursor and Grok Bot.
// Grok Bot installs plugins through Cursor's plugin system, so one package
// serves both hosts. The file selection matches the Claude build; only the
// manifest, MCP config, README, logo and per-skill host guidance differ.
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, renameSync, existsSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { consolidateClaudeResources } from "./claude-shared-resources.mjs";

export const EXPECTED_SKILL_COUNT = 31;
export const MCP_URL = "https://api.yeeflow.com/v1/mcp";
export const LOGO_PATH = "assets/yeeflow-logo-plate.png";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const outputIndex = args.indexOf("--output");
if (args.length !== 2 || outputIndex !== 0 || !args[1]) {
  throw new Error("Usage: node scripts/build-cursor-plugin.mjs --output <zip>");
}
const output = resolve(root, args[outputIndex + 1]);
const dist = resolve(root, "dist/yeeflow-cursor-plugin");
if (!output.endsWith(".zip") || output.startsWith(resolve(root, "dist") + "/")) throw new Error("Archive must be a .zip outside distribution directories");

const temp = mkdtempSync(join(tmpdir(), "yeeflow-cursor-"));
try {
  // Reuse the reviewed file selection and dependency repairs; do not mutate the OpenAI payload.
  execFileSync(process.execPath, [resolve(root, "scripts/build-plugin-archive.mjs"), "--tracked-only", "--output", join(temp, "source.zip")], { cwd: root, stdio: "inherit" });
  execFileSync("unzip", ["-q", join(temp, "source.zip"), "-d", temp]);
  const stage = join(temp, "yeeflow-app-builder-plugin");
  const original = JSON.parse(readFileSync(join(stage, ".codex-plugin/plugin.json"), "utf8"));
  rmSync(join(stage, ".codex-plugin"), { recursive: true });
  rmSync(join(stage, ".app.json"), { force: true });
  rmSync(join(stage, ".mcp.json"), { force: true });

  mkdirSync(join(stage, ".cursor-plugin"));
  copyFileSync(resolve(root, "docs/cursor-plugin-logo.png"), join(stage, LOGO_PATH));
  const manifest = {
    name: "yeeflow",
    version: original.version,
    description: "Build and maintain Yeeflow business applications, records, tasks and workflows with guided skills and Yeeflow's hosted MCP connection.",
    author: { name: "Yeeflow", email: "support@yeeflow.com" },
    homepage: "https://www.yeeflow.com",
    repository: "https://github.com/Yeeflow/app-builder-plugin",
    license: "MIT",
    keywords: ["yeeflow", "low-code", "business-applications", "workflow", "approvals", "ai-agents", "automation"],
    logo: LOGO_PATH,
    skills: "./skills/",
    mcpServers: "./mcp.json"
  };
  writeFileSync(join(stage, ".cursor-plugin/plugin.json"), JSON.stringify(manifest, null, 2) + "\n");
  // Remote Streamable HTTP server with OAuth; no headers or secrets in the package.
  writeFileSync(join(stage, "mcp.json"), JSON.stringify({ mcpServers: { yeeflow_mcp: { url: MCP_URL } } }, null, 2) + "\n");

  const guidance = `## Grok Bot and Cursor host requirements

Resolve this plugin root from the loaded skill path (<plugin-root>/skills/<skill-name>/SKILL.md), or CURSOR_PLUGIN_ROOT when provided. If the skill path is not a readable filesystem path, locate .cursor-plugin/plugin.json under the host's plugin directories, verify its name is yeeflow and its version matches the installed plugin, and resolve resources from that root. Do not use another installed version or another host's cache. If multiple roots match, stop and report ambiguity.

Use only the discovered tools of this plugin's yeeflow_mcp connection. Authenticate through the host's plugin OAuth flow (Grok Bot: Connect apps, Yeeflow, Authenticate). Never ask the user to paste passwords, tokens or API keys into chat. Do not fall back to direct REST calls, API keys or retired MCP endpoints.

Run bundled validators with the Node runtime available on the host computer or terminal. If Node or the plugin files are unavailable, report that validation did not run and continue supported MCP work; never claim unexecuted validation passed. Use browser tools only when available and authorized; API acceptance, readback, designer rendering and runtime proof are separate.

Confirm the target workspace and application, and get explicit user approval, before any create, update, import or delete. Do not edit installed plugin caches. Maintainer references describing Codex, OpenAI or Claude publishing are for those platforms; Cursor and Grok Bot publishing is documented in the source repository at https://github.com/Yeeflow/app-builder-plugin/blob/main/docs/cursor-plugin.md (not bundled in this package).

`;
  let count = 0;
  for (const name of readdirSync(join(stage, "skills"))) {
    const file = join(stage, "skills", name, "SKILL.md");
    if (!existsSync(file)) continue;
    let body = readFileSync(file, "utf8");
    body = body.replace(/training Codex/g, "training the agent")
      .replace(/asks Codex to/g, "asks the agent to")
      .replace(/use the Codex Yeeflow environment/g, "use the authorized Yeeflow tenant")
      .replace(/sync the relevant project skill mirrors and active `~\/.codex\/skills` installs/g, "update the relevant source skill mirrors in the selected development checkout and rebuild the Cursor package")
      .replace(/support chatgpt and codex workflows/g, "support Grok Bot and Cursor workflows")
      .replace(/\/Users\/[^`\n]+(?=`)/g, value => "<historical-local-artifact>/" + value.split("/").pop())
      .replace(/\/Users\/[^\s`<>]+/g, value => "<historical-local-artifact>/" + value.split("/").pop());
    const end = body.indexOf("\n---", 3);
    if (!body.startsWith("---\n") || end < 0) throw new Error("Skill frontmatter missing: " + name);
    const offset = end + 4;
    body = body.slice(0, offset) + "\n\n" + guidance + body.slice(offset);
    writeFileSync(file, body);
    count++;
  }
  if (count !== EXPECTED_SKILL_COUNT) throw new Error("Expected " + EXPECTED_SKILL_COUNT + " skills; review source inventory before release");

  writeFileSync(join(stage, "README.md"), readFileSync(resolve(root, "docs/cursor-public-readme.md"), "utf8"));
  writeFileSync(join(stage, "LICENSE"), readFileSync(resolve(root, "docs/claude-plugin-LICENSE.txt"), "utf8"));
  const sharing = consolidateClaudeResources(stage);
  console.log("CURSOR_SHARED_RESOURCES " + JSON.stringify({ removedFiles: sharing.removedFiles, savedBytes: sharing.savedBytes }));

  mkdirSync(dirname(output), { recursive: true });
  rmSync(output, { force: true });
  execFileSync("zip", ["-qr", output, "."], { cwd: stage });
  rmSync(dist, { recursive: true, force: true });
  renameSync(stage, dist);
  console.log("CURSOR_PLUGIN_BUILT " + manifest.version + " skills=" + count + " zip=" + output);
} finally { rmSync(temp, { recursive: true, force: true }); }
