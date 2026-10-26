#!/usr/bin/env node
// Regression test for the Claude plugin directory build (scripts/build-claude-directory.mjs).
// Builds into a temporary folder and checks directory limits, manifest, skills,
// rewritten references and that bundled scripts still load.
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { MAINTAINER_SKILLS, DIRECTORY_LIMITS, LEAN_SKILLS } from "./claude-directory-profile.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const files = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]);
const temp = mkdtempSync(join(tmpdir(), "yeeflow-claude-directory-"));
const out = join(temp, "out");
const reportPath = join(temp, "report.json");
try {
  // Refuses unsafe outputs.
  for (const args of [[], ["--output", root], ["--output", join(root, "dist/x")]]) {
    const bad = spawnSync(process.execPath, [join(root, "scripts/build-claude-directory.mjs"), ...args], { cwd: root, encoding: "utf8" });
    assert.notEqual(bad.status, 0, "build must refuse: " + args.join(" "));
  }
  const run = spawnSync(process.execPath, [join(root, "scripts/build-claude-directory.mjs"), "--output", out, "--report", reportPath], { cwd: root, encoding: "utf8" });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  const all = files(out).map(f => relative(out, f).split("\\").join("/"));

  // Directory limits (https://claude.com/docs/plugins/pre-submission-checklist).
  assert.ok(all.length <= DIRECTORY_LIMITS.maxFiles, `file count ${all.length} > ${DIRECTORY_LIMITS.maxFiles}`);
  if (all.length > DIRECTORY_LIMITS.maxFiles - 40) console.warn(`CLAUDE_DIRECTORY_NEAR_LIMIT files=${all.length}`);
  for (const f of all) assert.ok(statSync(join(out, f)).size <= DIRECTORY_LIMITS.maxAnyBytes, "over 5 MiB: " + f);
  assert.deepEqual(report.after.problems, []);
  assert.deepEqual(report.after.newlyUnresolvedImports, []);
  assert.ok(!all.some(f => /(^|\/)(\.DS_Store|Thumbs\.db)$/.test(f)));

  // Manifest and marketplace.
  const manifest = JSON.parse(readFileSync(join(out, ".claude-plugin/plugin.json"), "utf8"));
  assert.equal(manifest.name, "yeeflow");
  assert.equal(manifest.repository, "https://github.com/Yeeflow/yeeflow-claude-plugin");
  assert.equal(manifest.license, "MIT");
  for (const k of ["documentationUrl", "supportUrl", "termsOfServiceUrl", "privacyPolicyUrl"]) assert.match(manifest[k] || "", /^https:\/\//, k);
  assert.ok(existsSync(join(out, "LICENSE")) && existsSync(join(out, "README.md")));
  assert.ok(existsSync(join(out, manifest.icon)));
  const market = JSON.parse(readFileSync(join(out, ".claude-plugin/marketplace.json"), "utf8"));
  assert.equal(market.plugins[0].source, "./");
  assert.deepEqual(JSON.parse(readFileSync(join(out, ".mcp.json"), "utf8")), JSON.parse(readFileSync(join(root, "dist/yeeflow-claude-plugin/.mcp.json"), "utf8")));

  // Skills: all but the maintainer-only ones, each with the directory note.
  const sourceSkills = readdirSync(join(root, "dist/yeeflow-claude-plugin/skills")).filter(s => existsSync(join(root, "dist/yeeflow-claude-plugin/skills", s, "SKILL.md")));
  const skills = readdirSync(join(out, "skills")).filter(s => existsSync(join(out, "skills", s, "SKILL.md")));
  assert.deepEqual(skills.sort(), sourceSkills.filter(s => !MAINTAINER_SKILLS.includes(s)).sort());
  for (const s of skills) {
    const body = readFileSync(join(out, "skills", s, "SKILL.md"), "utf8");
    assert.match(body, /^---\nname:/);
    assert.match(body, /## Claude host requirements\n\nIn the directory build, normalized study folders are bundled/);
  }
  assert.ok(!all.some(f => /(^|\/)test-[^/]*\.(?:m?js|cjs)$/.test(f)), "test scripts must not ship");
  assert.ok(!all.some(f => f.endsWith("agents/openai.yaml")), "Codex agent metadata must not ship");

  // Bundles and collections are well-formed and every anchor a Markdown file names exists.
  for (const f of all.filter(f => f.endsWith(".bundle.json"))) {
    const b = JSON.parse(readFileSync(join(out, f), "utf8"));
    assert.equal(b.kind, "yeeflow-normalized-study-bundle");
    assert.ok(Object.keys(b.files).length >= 2, f);
  }
  const anchors = new Map(all.filter(f => /collection-\d+\.md$/.test(f)).map(f => [f, readFileSync(join(out, f), "utf8")]));
  const bundles = new Map(all.filter(f => f.endsWith(".bundle.json")).map(f => [f, JSON.parse(readFileSync(join(out, f), "utf8")).files]));
  const locate = (from, ref, pool) => {
    const here = dirname(from);
    const skill = from.startsWith("skills/") ? from.split("/").slice(0, 2).join("/") : null;
    const cands = [join(here, ref), ref.replace(/^(\.\.?\/)+/, "").replace(/^\//, ""), skill ? join(skill, ref) : null].filter(Boolean).map(c => c.split("\\").join("/"));
    return cands.find(c => pool.has(c));
  };
  for (const f of all.filter(f => f.endsWith(".md"))) {
    const body = readFileSync(join(out, f), "utf8");
    for (const m of body.matchAll(/([A-Za-z0-9_./-]*collection-\d+\.md)#([\w-]+)/g)) {
      const target = locate(f, m[1], anchors);
      assert.ok(target, `collection missing for ${m[0]} in ${f}`);
      assert.ok(anchors.get(target).includes(`<a id="${m[2]}"></a>`), `anchor missing: ${m[0]} in ${f}`);
    }
    for (const m of body.matchAll(/([A-Za-z0-9_./-]*\.bundle\.json)#([\w.@/-]+?)(?=[`)\s,;]|$)/gm)) {
      const target = locate(f, m[1], bundles);
      assert.ok(target, `bundle missing for ${m[0]} in ${f}`);
      assert.ok(Object.hasOwn(bundles.get(target), m[2]), `bundle entry missing: ${m[0]} in ${f}`);
    }
  }

  // Every shipped script still loads (help/usage paths exercise module resolution).
  // A script that already fails to load in the source distribution is reported, not failed.
  const source = join(root, "dist/yeeflow-claude-plugin");
  const loadFails = (dir, f) => {
    const r = spawnSync(process.execPath, [f, "--help"], { cwd: dir, encoding: "utf8", timeout: 30000 });
    return /Cannot find module|ERR_MODULE_NOT_FOUND|Cannot resolve required local module/.test(r.stdout + r.stderr);
  };
  const failures = [], preexisting = [];
  for (const f of all.filter(f => /\.(?:m?js|cjs)$/.test(f) && !f.includes("/lib/"))) {
    if (!loadFails(out, f)) continue;
    (existsSync(join(source, f)) && loadFails(source, f) ? preexisting : failures).push(f);
  }
  if (preexisting.length) console.warn("CLAUDE_DIRECTORY_PREEXISTING_LOAD_FAILURES " + JSON.stringify(preexisting));
  assert.deepEqual(failures, [], "scripts failed to load");

  // Lean edition: only the connector-oriented skills, small enough for interactive validation.
  const lean = join(temp, "lean");
  const leanReport = join(temp, "lean-report.json");
  const leanRun = spawnSync(process.execPath, [join(root, "scripts/build-claude-directory.mjs"), "--output", lean, "--report", leanReport, "--edition", "lean"], { cwd: root, encoding: "utf8" });
  assert.equal(leanRun.status, 0, leanRun.stdout + leanRun.stderr);
  const leanFiles = files(lean).map(f => relative(lean, f).split("\\").join("/"));
  const leanSkills = readdirSync(join(lean, "skills")).filter(s => existsSync(join(lean, "skills", s, "SKILL.md"))).sort();
  assert.deepEqual(leanSkills, [...LEAN_SKILLS].sort());
  const leanBytes = leanFiles.reduce((n, f) => n + statSync(join(lean, f)).size, 0);
  assert.ok(leanBytes < 2 * 1024 * 1024, `lean edition is ${leanBytes} bytes; keep it under 2 MiB for interactive validation`);
  for (const s of leanSkills) {
    const body = readFileSync(join(lean, "skills", s, "SKILL.md"), "utf8");
    for (const m of body.matchAll(/\(((?:\.\.?\/)*[A-Za-z0-9_\/-]+\.md)(?:#([\w-]+))?\)/g)) {
      const target = join(lean, "skills", s, m[1]);
      assert.ok(existsSync(target), `${s}: link target missing ${m[1]}`);
      if (m[2] && /collection-\d+\.md$/.test(m[1])) assert.ok(readFileSync(target, "utf8").includes(`<a id="${m[2]}"></a>`), `${s}: anchor missing ${m[0]}`);
    }
  }
  const leanSearch = spawnSync(process.execPath, [join(lean, "skills/yeeflow-feature-configuration-guide/scripts/knowledge.mjs"), "search", "Lookup List", "--limit", "1"], { cwd: temp, encoding: "utf8" });
  assert.equal(JSON.parse(leanSearch.stdout).results.length, 1, "lean helper search");
  assert.match(readFileSync(join(lean, "README.md"), "utf8"), /directory edition/i);
  assert.ok(!existsSync(join(lean, "CLAUDE-README.md")));

  console.log("CLAUDE_DIRECTORY_TEST_PASSED " + JSON.stringify({ files: all.length, skills: skills.length, deduped: report.dedupe.removedFiles, collections: report.collect.collections, bundles: report.bundle.bundles, filesOver256KiB: report.after.oversized.length, leanFiles: leanFiles.length, leanBytes }));
} finally {
  rmSync(temp, { recursive: true, force: true });
}
