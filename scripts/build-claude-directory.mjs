#!/usr/bin/env node
// Build the public Claude plugin directory payload from the checked-in Claude
// distribution (dist/yeeflow-claude-plugin), without modifying it.
//
//   node scripts/build-claude-directory.mjs --output <empty-directory> [--report <file.json>]
//
// The output is the root of the public repository Yeeflow/yeeflow-claude-plugin.
// See docs/claude-directory-build.md.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyDirectoryProfile, DIRECTORY_LIMITS, FULL_PLUGIN_URL } from "./claude-directory-profile.mjs";

export const DIRECTORY_REPOSITORY = "https://github.com/Yeeflow/yeeflow-claude-plugin";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const outputArg = opt("--output");
const reportArg = opt("--report");
const edition = opt("--edition") || "full";
if (!outputArg || !["full", "lean"].includes(edition) || args.length !== 2 + (reportArg ? 2 : 0) + (args.includes("--edition") ? 2 : 0)) {
  throw new Error("Usage: node scripts/build-claude-directory.mjs --output <empty-directory> [--report <file.json>] [--edition full|lean]");
}
const source = join(root, "dist/yeeflow-claude-plugin");
const output = resolve(outputArg);
if (!existsSync(join(source, ".claude-plugin/plugin.json"))) throw new Error("Build the Claude distribution first: npm run build:claude-plugin");
if (output === root || output.startsWith(root + "/dist") || output.startsWith(source)) throw new Error("Output must be outside the repository's dist directories");
if (existsSync(output) && readdirSync(output).filter(n => n !== ".git").length) throw new Error("Output must be empty (a .git folder is allowed); existing files are preserved");

mkdirSync(output, { recursive: true });
cpSync(source, output, { recursive: true });

const manifestPath = join(output, ".claude-plugin/plugin.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (manifest.name !== "yeeflow") throw new Error("Unexpected plugin name: " + manifest.name);
manifest.repository = DIRECTORY_REPOSITORY;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

const report = applyDirectoryProfile(output, { edition });

// Tell every shipped skill how bundled study references read.
const note = "In the directory build, normalized study folders are bundled into one JSON file each. A reference such as `docs/studies/normalized/<topic>.bundle.json#<name>` means the value of `files[\"<name>\"]` in that file; a reference to the bundle alone means all of its entries. Shared scripts live once under the plugin root; resolve `<plugin-root>/...` paths from the plugin root.\n\n";
for (const skill of readdirSync(join(output, "skills"))) {
  const file = join(output, "skills", skill, "SKILL.md");
  if (!existsSync(file)) continue;
  const body = readFileSync(file, "utf8");
  const marker = "## Claude host requirements\n\n";
  if (!body.includes(marker)) throw new Error("Claude host requirements block missing: " + skill);
  writeFileSync(file, body.replace(marker, marker + note));
}

if (edition === "lean") {
  const shipped = readdirSync(join(output, "skills")).filter(s => existsSync(join(output, "skills", s, "SKILL.md"))).sort();
  writeFileSync(join(output, "README.md"), `# Yeeflow

Yeeflow helps Claude work with business applications, records, workflow tasks and AI agents through Yeeflow's hosted MCP connection and ${shipped.length} guided skills. This is the Claude directory edition: it pairs with the Yeeflow connector (https://claude.ai/directory/yeeflow) and focuses on work you do through the live connection.

## What the skills cover

- Choosing and configuring Yeeflow controls, actions, workflow steps, reports and portals, grounded in official Help Center references.
- Building and changing live applications step by step through the connector, with a confirmation before every write and read-back after each save.
- Workflow stage UI, single-attachment OCR and document archive patterns.
- Data reports and knowledge sources for AI Agents and Copilots.
- Designing, templating, importing and exporting AI Agents and Copilots.

Skills: ${shipped.map(s => "\`" + s + "\`").join(", ")}.

## Requirements and connection

You need a Yeeflow account with permission for the workspace and operation you choose. Connect Yeeflow through Claude's connector sign-in (OAuth); the endpoint is https://api.yeeflow.com/v1/mcp. Do not paste passwords, tokens or API keys into chat. Signing in does not expand your Yeeflow permissions, and Claude asks before any change.

## Full plugin

Package generation (.yap/.yapk), dashboard and form layout templates, and local validators are in the full Yeeflow plugin: ${FULL_PLUGIN_URL}. Install the full plugin instead of this edition if you build complete application packages with Claude Code or Claude Desktop.

## Privacy and support

Privacy policy: https://www.yeeflow.com/privacy. Support: support@yeeflow.com. Setup guide: https://support.yeeflow.com/en/articles/16391707-connect-yeeflow-mcp-servers-to-your-ai-tool
`);
  rmSync(join(output, "CLAUDE-README.md"), { force: true });
}

writeFileSync(join(output, ".claude-plugin/marketplace.json"), JSON.stringify({
  name: "yeeflow-claude", owner: { name: "Yeeflow" },
  description: "Yeeflow plugin for Claude: guided skills for Yeeflow business applications, workflows and AI agents with the hosted Yeeflow MCP connection.",
  plugins: [{ name: "yeeflow", source: "./", description: manifest.description }],
}, null, 2) + "\n");

const summary = {
  output, name: manifest.name, version: manifest.version, repository: manifest.repository,
  before: report.before.files, after: report.after.files, skills: report.after.skills,
  pruned: report.prune.removedFiles, deduped: report.dedupe.removedFiles, dedupedBytes: report.dedupe.savedBytes,
  bundledStudyFiles: report.bundle.removedFiles, bundles: report.bundle.bundles, unreferenced: report.closure.removedFiles,
  collectedMarkdown: report.collect.removedFiles, collections: report.collect.collections,
  filesOver256KiB: report.after.oversized.length, newlyUnresolvedImports: report.after.newlyUnresolvedImports.length,
  problems: report.after.problems, limits: DIRECTORY_LIMITS,
};
if (reportArg) writeFileSync(resolve(reportArg), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(summary, null, 2));
if (report.after.problems.length || report.after.newlyUnresolvedImports.length) {
  console.error("CLAUDE_DIRECTORY_BUILD_FAILED");
  process.exit(1);
}
