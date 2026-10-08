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
const temp = mkdtempSync(resolve(tmpdir(), "yeeflow-claude-test-"));
try {
  const zip = resolve(temp, "claude.zip");
  execFileSync(process.execPath, [resolve(root, "scripts/build-claude-plugin.mjs"), "--output", zip], { cwd: root, stdio: "inherit" });
  const out = resolve(temp, "extracted");
  execFileSync("unzip", ["-q", zip, "-d", out]);
  assert.ok(!existsSync(resolve(out, ".codex-plugin")));
  assert.ok(!existsSync(resolve(out, ".app.json")));
  const manifest = JSON.parse(readFileSync(resolve(out, ".claude-plugin/plugin.json")));
  assert.equal(manifest.version, JSON.parse(readFileSync(resolve(source, ".codex-plugin/plugin.json"))).version);
  assert.equal(manifest.name, "yeeflow-app-builder");
  assert.equal(manifest.mcpServers, "./.mcp.json");
  assert.deepEqual(JSON.parse(readFileSync(resolve(out, ".mcp.json"))), { mcpServers: { yeeflow_mcp: { type: "http", url: "https://api.yeeflow.com/v1/mcp" } } });
  const skills = readdirSync(resolve(out, "skills")).filter(s => existsSync(resolve(out, "skills", s, "SKILL.md")));
  assert.equal(skills.length, 27);
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
  // Shared references and validators survive projection byte-for-byte, except the
  // two existing dependency repairs owned by applyHostProfile.
  for (const file of files(source)) {
    const rel = relative(source, file);
    if (rel.startsWith(".codex-plugin/") || rel.endsWith("/SKILL.md") || ["skills/yeeflow-application-generator/scripts/validate-yap-package.js", "scripts/test-skill-entrypoint-compat.mjs"].includes(rel)) continue;
    assert.equal(digest(resolve(out, rel)), digest(file), "Shared resource drift: " + rel);
  }
  const result = spawnSync(process.execPath, [resolve(out, "scripts/test-skill-entrypoint-compat.mjs")], { cwd: temp, encoding: "utf8" });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /guardrail tests passed/);
  console.log("CLAUDE_PLUGIN_PASS: root ZIP layout; 27 skills; shared resource parity; validator entrypoints; OpenAI files unchanged");
} finally { rmSync(temp, { recursive: true, force: true }); }
