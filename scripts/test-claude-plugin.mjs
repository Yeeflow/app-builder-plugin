#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "dist/yeeflow-app-builder-plugin");
const files = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(resolve(dir, e.name)) : [resolve(dir, e.name)]);
const digest = file => createHash("sha256").update(readFileSync(file)).digest("hex");
const protectedFiles = [...files(source), resolve(root, ".agents/plugins/marketplace.json"), resolve(root, "scripts/build-plugin-archive.mjs"), resolve(root, "scripts/plugin-host-profile.mjs")];
for (const args of [[], ["--output", "package.json"], ["--output", "dist/overwrite.zip"], ["--output", "one.zip", "--output", "two.zip"]]) {
  const bad = spawnSync(process.execPath, [resolve(root, "scripts/build-claude-plugin.mjs"), ...args], { cwd: root, encoding: "utf8" });
  assert.notEqual(bad.status, 0);
}
const before = new Map(protectedFiles.map(f => [f, digest(f)]));
// Repository installation reads the committed generated directory, not this
// freshly built ZIP. Detect a stale payload before regeneration can hide it.
const generated = resolve(root, "dist/yeeflow-claude-plugin");
assert.ok(existsSync(generated), "Build the Claude distribution before testing");
const generatedBefore = new Map(files(generated).map(f => [relative(generated, f), digest(f)]));
const temp = mkdtempSync(resolve(tmpdir(), "yeeflow-claude-test-"));
try {
  const zip = resolve(temp, "claude.zip");
  execFileSync(process.execPath, [resolve(root, "scripts/build-claude-plugin.mjs"), "--output", zip], { cwd: root, stdio: "inherit" });
  const out = resolve(temp, "extracted");
  execFileSync("unzip", ["-q", zip, "-d", out]);
  assert.ok(!existsSync(resolve(out, ".codex-plugin")));
  assert.ok(!existsSync(resolve(out, ".app.json")));
  const rebuilt = new Map(files(out).map(f => [relative(out, f), digest(f)]));
  assert.deepEqual([...rebuilt.keys()].sort(), [...generatedBefore.keys()].sort(), "CLAUDE_DISTRIBUTION_STALE: generated file inventory differs; rebuild and commit it");
  for (const [file, hash] of generatedBefore) {
    assert.equal(rebuilt.get(file), hash, "CLAUDE_DISTRIBUTION_STALE: " + file + "; rebuild and commit it");
  }
  const manifest = JSON.parse(readFileSync(resolve(out, ".claude-plugin/plugin.json")));
  assert.equal(manifest.version, "1.18.0");
  assert.equal(manifest.displayName, "Yeeflow");
  assert.equal(manifest.icon, "./assets/yeeflow-logo-only-blue.png");
  assert.equal(digest(resolve(out, manifest.icon)), digest(resolve(source, "assets/yeeflow-logo-only-blue.png")));
  assert.equal(manifest.license, "MIT");
  assert.equal(manifest.author.email, "support@yeeflow.com");
  assert.match(readFileSync(resolve(out, "LICENSE"), "utf8"), /MIT License/);
  assert.equal(readFileSync(resolve(out, "README.md"), "utf8"), readFileSync(resolve(root, "docs/claude-public-readme.md"), "utf8"));
  assert.equal(manifest.repository, "https://github.com/Yeeflow/app-builder-plugin");
  assert.equal(manifest.name, "yeeflow");
  assert.equal(manifest.mcpServers, "./.mcp.json");
  assert.deepEqual(JSON.parse(readFileSync(resolve(out, ".mcp.json"))), { mcpServers: { yeeflow_mcp: { type: "http", url: "https://api.yeeflow.com/v1/mcp" } } });
  const skills = readdirSync(resolve(out, "skills")).filter(s => existsSync(resolve(out, "skills", s, "SKILL.md")));
  assert.equal(skills.length, 28);
  for (const skill of skills) {
    const body = readFileSync(resolve(out, "skills", skill, "SKILL.md"), "utf8");
    assert.match(body, /^---\nname:/);
    assert.match(body, /## Claude host requirements/);
    assert.ok(!body.includes("~/.codex/skills"));
    assert.ok(!body.includes("/Users/"));
  }
  const marketplace = JSON.parse(readFileSync(resolve(root, ".claude-plugin/marketplace.json")));
  assert.equal(marketplace.plugins[0].source, "./dist/yeeflow-claude-plugin");
  assert.equal(marketplace.plugins[0].name, manifest.name);
  for (const [file, hash] of before) assert.equal(digest(file), hash, "OpenAI source modified: " + relative(root, file));
  const sharing = JSON.parse(readFileSync(resolve(out, "claude-shared-resources.json"), "utf8"));
  assert.equal(sharing.removedFiles, Object.keys(sharing.aliases).length);
  assert.ok(sharing.removedFiles > 0);
  for (const [alias, entry] of Object.entries(sharing.aliases)) {
    assert.ok(!existsSync(resolve(out, alias)), alias);
    assert.equal(digest(resolve(out, entry.canonical)), entry.sha256);
    assert.equal(digest(resolve(source, alias)), entry.sha256);
  }
  // Shared references and validators survive projection byte-for-byte, except the
  // two existing dependency repairs owned by applyHostProfile.
  for (const file of files(source)) {
    const rel = relative(source, file);
    if (rel.startsWith(".codex-plugin/") || rel.endsWith("/SKILL.md") || ["README.md", "skills/yeeflow-application-generator/scripts/validate-yap-package.js", "scripts/test-skill-entrypoint-compat.mjs"].includes(rel)) continue;
    if (sharing.aliases[rel]) continue;
    if (sharing.rewrites[rel]) {
      assert.equal(digest(file), sharing.rewrites[rel].beforeSha256, "Unexpected original resource: " + rel);
      assert.equal(digest(resolve(out, rel)), sharing.rewrites[rel].afterSha256);
      continue;
    }
    assert.equal(digest(resolve(out, rel)), digest(file), "Shared resource drift: " + rel);
  }
  // Load real shared data from relocated/extracted plugin roots with a foreign CWD.
  for (const entry of [
    ["skills/yeeflow-application-generator/scripts/yeeflow-expression-utils.js", "loadExpressionReferences"],
    ["skills/yeeflow-approval-form-generator/scripts/yeeflow-expression-utils.js", "loadExpressionReferences"],
    ["skills/yeeflow-expression-generator/references/yeeflow-expression-utils.js", "loadExpressionReferences"],
    ["skills/yeeflow-application-generator/scripts/workflow-action-config-validator.js", "loadWorkflowActionReference"],
    ["skills/yeeflow-application-generator/scripts/yeeflow-control-field-schema-utils.js", "loadControlFieldSchemas"],
  ]) {
    const check = spawnSync(process.execPath, ["-e", `const assert=require('node:assert/strict'); const value=require(process.argv[1])[process.argv[2]](); assert.ok(value && Object.keys(value).length); if(process.argv[2]==='loadControlFieldSchemas') assert.ok(value.hasControlReference && value.hasFieldReference);`, resolve(out, entry[0]), entry[1]], {cwd:tmpdir(), encoding:"utf8"});
    assert.equal(check.status, 0, entry[0] + "\n" + check.stdout + check.stderr);
  }
  const result = spawnSync(process.execPath, [resolve(out, "scripts/test-skill-entrypoint-compat.mjs")], { cwd: temp, encoding: "utf8" });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /guardrail tests passed/);
  console.log("CLAUDE_PLUGIN_PASS: root ZIP layout; committed payload freshness; 28 skills; shared resource parity; validator entrypoints; OpenAI files unchanged");
} finally { rmSync(temp, { recursive: true, force: true }); }
