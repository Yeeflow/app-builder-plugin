#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { resolve, dirname, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "dist/yeeflow-app-builder-plugin");
const files = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(resolve(dir, e.name)) : [resolve(dir, e.name)]);
const digest = file => createHash("sha256").update(readFileSync(file)).digest("hex");
const build = resolve(root, "scripts/build-cursor-plugin.mjs");

// Argument guards: no output inside dist, exactly one --output <zip>.
for (const args of [[], ["--output", "package.json"], ["--output", "dist/overwrite.zip"], ["--output", "one.zip", "--output", "two.zip"]]) {
  const bad = spawnSync(process.execPath, [build, ...args], { cwd: root, encoding: "utf8" });
  assert.notEqual(bad.status, 0, "build accepted invalid args: " + args.join(" "));
}

// The OpenAI and Claude payloads must not change when the Cursor package is built.
const protectedFiles = [
  ...files(source), ...files(resolve(root, "dist/yeeflow-claude-plugin")),
  resolve(root, ".agents/plugins/marketplace.json"), resolve(root, ".claude-plugin/marketplace.json"),
  resolve(root, "scripts/build-plugin-archive.mjs"), resolve(root, "scripts/plugin-host-profile.mjs")
];
const before = new Map(protectedFiles.map(f => [f, digest(f)]));

// Marketplace installs read the committed directory; detect a stale payload before rebuilding.
const generated = resolve(root, "dist/yeeflow-cursor-plugin");
assert.ok(existsSync(generated), "Build the Cursor distribution before testing");
const generatedBefore = new Map(files(generated).map(f => [relative(generated, f), digest(f)]));

const temp = mkdtempSync(resolve(tmpdir(), "yeeflow-cursor-test-"));
try {
  const zip = resolve(temp, "cursor.zip");
  execFileSync(process.execPath, [build, "--output", zip], { cwd: root, stdio: "inherit" });
  const out = resolve(temp, "extracted");
  execFileSync("unzip", ["-q", zip, "-d", out]);

  const rebuilt = new Map(files(out).map(f => [relative(out, f), digest(f)]));
  assert.deepEqual([...rebuilt.keys()].sort(), [...generatedBefore.keys()].sort(), "CURSOR_DISTRIBUTION_STALE: generated file inventory differs; rebuild and commit it");
  for (const [file, hash] of generatedBefore) assert.equal(rebuilt.get(file), hash, "CURSOR_DISTRIBUTION_STALE: " + file + "; rebuild and commit it");

  // Host isolation: no Codex or Claude manifests, no Claude-only README.
  for (const rel of [".codex-plugin", ".claude-plugin", ".app.json", ".mcp.json", "CLAUDE-README.md"]) assert.ok(!existsSync(resolve(out, rel)), "unexpected host file: " + rel);

  // Manifest (Cursor plugins reference: kebab-case name, relative paths, no "..").
  const manifest = JSON.parse(readFileSync(resolve(out, ".cursor-plugin/plugin.json"), "utf8"));
  assert.equal(manifest.name, "yeeflow");
  assert.match(manifest.name, /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/);
  assert.equal(manifest.version, JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")).version);
  assert.equal(manifest.license, "MIT");
  assert.equal(manifest.author.name, "Yeeflow");
  assert.equal(manifest.author.email, "support@yeeflow.com");
  assert.equal(manifest.repository, "https://github.com/Yeeflow/app-builder-plugin");
  for (const key of ["logo", "skills", "mcpServers"]) {
    assert.ok(!isAbsolute(manifest[key]) && !manifest[key].split("/").includes(".."), key + " must be a relative in-plugin path");
    assert.ok(existsSync(resolve(out, manifest[key])), key + " path missing: " + manifest[key]);
  }
  assert.equal(manifest.logo, "assets/yeeflow-logo-plate.png");
  assert.equal(digest(resolve(out, manifest.logo)), digest(resolve(root, "docs/cursor-plugin-logo.png")));
  const logo = readFileSync(resolve(out, manifest.logo));
  assert.equal(logo.readUInt32BE(16), logo.readUInt32BE(20), "logo must be square (1:1)");

  // Remote OAuth MCP server only: no headers, secrets or local commands.
  assert.deepEqual(JSON.parse(readFileSync(resolve(out, "mcp.json"), "utf8")), { mcpServers: { yeeflow_mcp: { url: "https://api.yeeflow.com/v1/mcp" } } });
  assert.equal(manifest.variables, undefined);

  assert.match(readFileSync(resolve(out, "LICENSE"), "utf8"), /MIT License/);
  assert.equal(readFileSync(resolve(out, "README.md"), "utf8"), readFileSync(resolve(root, "docs/cursor-public-readme.md"), "utf8"));

  const skills = readdirSync(resolve(out, "skills")).filter(s => existsSync(resolve(out, "skills", s, "SKILL.md")));
  assert.equal(skills.length, 31);
  for (const skill of skills) {
    const body = readFileSync(resolve(out, "skills", skill, "SKILL.md"), "utf8");
    assert.match(body, /^---\nname:/, skill);
    assert.match(body.split("\n---")[0], /\ndescription:/, skill + " frontmatter needs description");
    assert.match(body, /## Grok Bot and Cursor host requirements/, skill);
    assert.ok(!body.includes("## Claude host requirements"), skill);
    assert.ok(!body.includes("CLAUDE_PLUGIN_ROOT"), skill);
    assert.ok(!body.includes("~/.codex/skills"), skill);
    assert.ok(!body.includes("/Users/"), skill);
    assert.ok(!body.includes("uses docs/cursor-plugin.md and scripts/build-cursor-plugin.mjs"), skill + ": guidance names source-only paths");
  }

  // Shared references cited by bundled skills must ship in the package (1.20.2).
  for (const rel of ["docs/yeeflow-system-configuration-schema-specifications.md", "docs/studies/normalized/yap-export-shaped-application/reference-shape.normalized.json"]) {
    assert.ok(existsSync(resolve(out, rel)), "missing cited reference: " + rel);
    assert.equal(digest(resolve(out, rel)), digest(resolve(root, rel)), "cited reference drift: " + rel);
  }

  const marketplace = JSON.parse(readFileSync(resolve(root, ".cursor-plugin/marketplace.json"), "utf8"));
  assert.match(marketplace.name, /^[a-z0-9-]+$/);
  assert.ok(marketplace.owner && marketplace.owner.name);
  assert.equal(marketplace.plugins.length, 1);
  assert.equal(marketplace.plugins[0].name, manifest.name);
  assert.equal(marketplace.plugins[0].source, "dist/yeeflow-cursor-plugin");
  assert.ok(existsSync(resolve(root, marketplace.plugins[0].source, ".cursor-plugin/plugin.json")));

  for (const [file, hash] of before) assert.equal(digest(file), hash, "Other host payload modified: " + relative(root, file));

  // Bundled validators load shared data from an extracted root with a foreign CWD.
  for (const entry of [
    ["skills/yeeflow-application-generator/scripts/yeeflow-expression-utils.js", "loadExpressionReferences"],
    ["skills/yeeflow-approval-form-generator/scripts/yeeflow-expression-utils.js", "loadExpressionReferences"],
    ["skills/yeeflow-expression-generator/references/yeeflow-expression-utils.js", "loadExpressionReferences"],
    ["skills/yeeflow-application-generator/scripts/workflow-action-config-validator.js", "loadWorkflowActionReference"],
    ["skills/yeeflow-application-generator/scripts/yeeflow-control-field-schema-utils.js", "loadControlFieldSchemas"],
  ]) {
    const check = spawnSync(process.execPath, ["-e", `const assert=require('node:assert/strict'); const value=require(process.argv[1])[process.argv[2]](); assert.ok(value && Object.keys(value).length);`, resolve(out, entry[0]), entry[1]], { cwd: tmpdir(), encoding: "utf8" });
    assert.equal(check.status, 0, entry[0] + "\n" + check.stdout + check.stderr);
  }
  const result = spawnSync(process.execPath, [resolve(out, "scripts/test-skill-entrypoint-compat.mjs")], { cwd: temp, encoding: "utf8" });
  assert.equal(result.status, 0, result.stdout + result.stderr);

  console.log("CURSOR_PLUGIN_PASS: committed payload freshness; manifest and paths; remote OAuth MCP; 31 skills with Grok Bot guidance; marketplace; validator entrypoints; OpenAI and Claude files unchanged");
} finally { rmSync(temp, { recursive: true, force: true }); }
