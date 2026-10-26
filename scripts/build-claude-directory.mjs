#!/usr/bin/env node
// Build the public Claude plugin directory payload from the checked-in Claude
// distribution (dist/yeeflow-claude-plugin), without modifying it.
//
//   node scripts/build-claude-directory.mjs --output <empty-directory> [--report <file.json>]
//
// The output is the root of the public repository Yeeflow/yeeflow-claude-plugin.
// See docs/claude-directory-build.md.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyDirectoryProfile, DIRECTORY_LIMITS } from "./claude-directory-profile.mjs";

export const DIRECTORY_REPOSITORY = "https://github.com/Yeeflow/yeeflow-claude-plugin";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const outputArg = opt("--output");
const reportArg = opt("--report");
if (!outputArg || args.length !== (reportArg ? 4 : 2)) {
  throw new Error("Usage: node scripts/build-claude-directory.mjs --output <empty-directory> [--report <file.json>]");
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

const report = applyDirectoryProfile(output);

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

writeFileSync(join(output, ".claude-plugin/marketplace.json"), JSON.stringify({
  name: "yeeflow-claude", owner: { name: "Yeeflow" },
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
