#!/usr/bin/env node
// Regression test for the yeeflow-feature-configuration-guide helper in the source
// skill and both distributions, invoked directly and through a symlinked path (as
// plugin caches often are). A silent exit through a symlink shipped in 1.18.0.
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skill = "yeeflow-feature-configuration-guide";
const surfaces = [
  ["source", resolve(root, "skills/installed")],
  ["codex", resolve(root, "dist/yeeflow-app-builder-plugin/skills")],
  ["claude", resolve(root, "dist/yeeflow-claude-plugin/skills")],
].filter(([, dir]) => existsSync(join(dir, skill)));
assert.ok(surfaces.length >= 1, "feature configuration guide skill not found");

const temp = mkdtempSync(join(tmpdir(), "yeeflow-fcg-"));
const run = (script, args) => spawnSync(process.execPath, [script, ...args], { cwd: temp, encoding: "utf8" });
try {
  for (const [name, dir] of surfaces) {
    const catalog = JSON.parse(readFileSync(join(dir, skill, "references/feature-catalog.json"), "utf8"));
    assert.equal(catalog.entries.length, catalog.entry_count, `${name}: entry_count`);
    assert.equal(new Set(catalog.entries.map(e => e.id)).size, catalog.entries.length, `${name}: duplicate ids`);
    for (const e of catalog.entries) assert.ok(e.source_urls.every(u => u.startsWith("https://support.yeeflow.com/")), `${name}: ${e.id} source`);

    const link = join(temp, `${name}-link`);
    symlinkSync(dir, link, "dir");
    for (const [how, base] of [["direct", dir], ["symlink", link]]) {
      const script = join(base, skill, "scripts/knowledge.mjs");
      const search = run(script, ["search", "Lookup List", "--limit", "2"]);
      assert.equal(search.status, 0, `${name}/${how}: ${search.stderr}`);
      const parsed = JSON.parse(search.stdout || "null");
      assert.ok(parsed && parsed.results.length === 2, `${name}/${how}: search printed no results`);
      const read = run(script, ["read", parsed.results[0].id]);
      assert.equal(read.status, 0, `${name}/${how}: ${read.stderr}`);
      assert.match(read.stdout, /^# .+\n\nFeature ID: /, `${name}/${how}: read printed no entry`);
      assert.match(run(script, ["--help"]).stdout, /Usage:/, `${name}/${how}: help printed nothing`);
      const bad = run(script, ["search", "x", "--domain", "bogus"]);
      assert.equal(bad.status, 2, `${name}/${how}: invalid domain must exit 2`);
      const unknown = run(script, ["read", "NOPE-000"]);
      assert.equal(unknown.status, 2, `${name}/${how}: unknown id must exit 2`);
    }
  }
  console.log(`FEATURE_CONFIGURATION_GUIDE_PASS: ${surfaces.map(([n]) => n).join(", ")}; direct and symlinked invocation`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
