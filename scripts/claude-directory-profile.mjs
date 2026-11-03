// Directory profile for the public Claude plugin directory listing.
//
// Input: a staged copy of dist/yeeflow-claude-plugin (never the checked-in
// directory itself). Output: the same folder, reduced to what the shipped
// skills reference, so it fits the directory's review limits
// (https://claude.com/docs/plugins/pre-submission-checklist):
//   - at most 512 files, readable text, no symlinks
//   - every relative require/import still resolves
//
// Steps, each recorded in the returned report:
//   1. prune    maintainer-only skills, Codex agent metadata, test scripts
//   2. dedupe   byte-identical copies -> one canonical file, references rewritten
//   3. bundle   docs/studies/normalized/<topic>/ folders -> <topic>.bundle.json
//   4. closure  keep only files reachable from the skills and manifest
//   5. verify   module resolution and directory limits
import { readFileSync, writeFileSync, readdirSync, rmSync, statSync, existsSync } from "node:fs";
import { join, relative, posix } from "node:path";
import { createHash } from "node:crypto";

export const DIRECTORY_LIMITS = { maxFiles: 512, maxTextBytes: 256 * 1024, maxAnyBytes: 5 * 1024 * 1024 };
export const MAINTAINER_SKILLS = ["yeeflow-plugin-release-manager", "yeeflow-feature-learning-orchestrator"];
// Release, packaging and test material for maintainers. Not shipped, and never followed as a reference.
export const MAINTAINER_PATHS = [
  /^CHANGELOG\.md$/,
  /^docs\/releases\//,
  /^docs\/training\//,
  /^fixtures\//,
  /^execution\//,
  /(^|\/)distribution-files\.json$/,
  /^scripts\/(?:prepare-plugin-|build-plugin-|normalize-plugin-|plugin-host-profile|release-|publish-)/,
];

const sha = b => createHash("sha256").update(b).digest("hex");
const toPosix = p => p.split("\\").join("/");
const CODE = /\.(?:js|mjs|cjs)$/;
const TEXT = /\.(?:md|js|mjs|cjs|json|ya?ml|txt|ts|py|fixture|base64|svg)$/;
const IMAGE = /\.(?:png|jpe?g|gif|webp)$/;
// Folders that are hubs: a bare reference to one of them is navigation, not "ship all of it".
const HUB_DIRS = new Set(["", ".", "docs", "scripts", "skills", "core", "tools", "schemas", "assets", "fixtures", "execution",
  "docs/studies", "docs/studies/normalized", "docs/reference", "docs/standards", "docs/templates", "docs/training", "scripts/lib"]);

function walk(root, dir = root) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const full = join(dir, e.name);
    if (e.name === ".git") return [];
    return e.isDirectory() ? walk(root, full) : [toPosix(relative(root, full))];
  }).sort();
}
const read = (root, rel) => readFileSync(join(root, rel), "utf8");

// ---------- reference extraction ----------
const SPEC_PATTERNS = [
  /require\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g,
  /\bfrom\s*["'](\.{1,2}\/[^"']+)["']/g,
  /\bimport\s*\(?\s*["'](\.{1,2}\/[^"']+)["']/g,
  /new URL\(\s*["'](\.{1,2}\/[^"']+)["']\s*,\s*import\.meta\.url/g,
];
const DIRNAME_JOIN = /path\.(?:join|resolve)\(\s*__dirname\s*,((?:\s*["'][^"']+["']\s*,?)+)\)/g;
const EXTS = ["", ".js", ".mjs", ".cjs", ".json", "/index.js", "/index.mjs"];

function resolveSpec(fileSet, fromRel, spec) {
  const base = posix.normalize(posix.join(posix.dirname(fromRel), spec));
  for (const ext of EXTS) if (fileSet.has(base + ext)) return base + ext;
  return null;
}

/** Relative module/data specifiers in a code file: [{spec, target, kind}] */
export function codeSpecifiers(fileSet, rel, body) {
  const out = [];
  for (const re of SPEC_PATTERNS) for (const m of body.matchAll(re)) out.push({ spec: m[1], target: resolveSpec(fileSet, rel, m[1]), kind: "module" });
  for (const m of body.matchAll(DIRNAME_JOIN)) {
    const parts = [...m[1].matchAll(/["']([^"']+)["']/g)].map(x => x[1]);
    const spec = "./" + parts.join("/");
    out.push({ spec, target: resolveSpec(fileSet, rel, spec), kind: "dirname" });
  }
  return out;
}

const PATH_TOKEN = /(?:\$\{CLAUDE_PLUGIN_ROOT\}\/|<plugin-root>\/)?[A-Za-z0-9_@.-]+(?:\/[A-Za-z0-9_@.-]+)*\/?/g;

/** Every plugin file a text file points at (paths, bare names, folders). Over-includes by design. */
function textRefs(index, rel, body) {
  const { fileSet, byName, dirFiles } = index;
  const hits = new Set();
  const here = posix.dirname(rel);
  const skillRoot = rel.startsWith("skills/") ? rel.split("/").slice(0, 2).join("/") : null;
  for (const raw of body.match(PATH_TOKEN) || []) {
    let tok = raw.replace(/^(\$\{CLAUDE_PLUGIN_ROOT\}|<plugin-root>)\//, "").replace(/^\.\//, "").replace(/[.,:;]+$/, "");
    if (!tok || tok.length < 3) continue;
    const isDirTok = tok.endsWith("/");
    tok = tok.replace(/\/+$/, "");
    const cands = [posix.normalize(posix.join(here, tok)), posix.normalize(tok)];
    if (skillRoot) cands.push(posix.normalize(posix.join(skillRoot, tok)));
    let found = false;
    for (const c of cands) {
      if (fileSet.has(c)) { hits.add(c); found = true; break; }
      for (const ext of [".js", ".mjs", ".cjs"]) if (CODE.test(rel) && fileSet.has(c + ext)) { hits.add(c + ext); found = true; }
      if (found) break;
      if (dirFiles.has(c) && !HUB_DIRS.has(c) && (isDirTok || c.split("/").length >= 3)) {
        for (const f of dirFiles.get(c)) hits.add(f);
        found = true; break;
      }
    }
    if (found) continue;
    if (tok.includes("/")) {
      // Paths quoted from another root, e.g. "plugins/x/docs/a.md": match by suffix.
      const suffixHits = index.all.filter(f => f.endsWith("/" + tok));
      if (suffixHits.length && suffixHits.length <= 3) suffixHits.forEach(f => hits.add(f));
    } else if (/\.[a-z0-9]+$/i.test(tok)) {
      const named = byName.get(tok) || [];
      if (named.length && named.length <= 4) named.forEach(f => hits.add(f));
    }
  }
  return hits;
}

function buildIndex(root) {
  const all = walk(root);
  const fileSet = new Set(all);
  const byName = new Map();
  const dirFiles = new Map();
  for (const f of all) {
    const n = posix.basename(f);
    byName.set(n, [...(byName.get(n) || []), f]);
    const parts = f.split("/");
    for (let i = 1; i < parts.length; i++) {
      const d = parts.slice(0, i).join("/");
      dirFiles.set(d, [...(dirFiles.get(d) || []), f]);
    }
  }
  return { all, fileSet, byName, dirFiles };
}

// ---------- 1. prune ----------
function prune(root, report, dropSkills) {
  const removed = [];
  for (const skill of dropSkills) {
    const dir = join(root, "skills", skill);
    if (!existsSync(dir)) throw new Error("DIRECTORY_PROFILE_SKILL_MISSING: " + skill);
    removed.push(...walk(root, dir));
    rmSync(dir, { recursive: true });
  }
  for (const f of walk(root)) {
    const name = posix.basename(f);
    const isTest = /^test-.*\.(?:m?js|cjs)$/.test(name) || /\.test\.(?:m?js|cjs)$/.test(name);
    const isCodexAgent = /^skills\/[^/]+\/agents\/openai\.yaml$/.test(f);
    const isMaintainer = MAINTAINER_PATHS.some(re => re.test(f));
    if (isTest || isCodexAgent || isMaintainer) { rmSync(join(root, f)); removed.push(f); }
  }
  report.prune = { removedFiles: removed.length, droppedSkills: dropSkills };
}

// ---------- 2. dedupe ----------
function canonicalRank(f) {
  if (f.startsWith("scripts/")) return 0;          // shared script library
  if (!f.includes("/")) return 1;                  // plugin root
  if (f.startsWith("docs/")) return 2;
  return 3 + f.split("/").length;                  // skill-local copies last
}

function dedupe(root, report) {
  const index = buildIndex(root);
  const groups = new Map();
  for (const f of index.all) {
    if (!/\.(?:js|mjs|cjs|json|md)$/.test(f)) continue;
    if (/(^|\/)(SKILL|README)\.md$/.test(f) || f.startsWith(".claude-plugin/") || f === ".mcp.json") continue;
    const h = sha(readFileSync(join(root, f)));
    groups.set(h, [...(groups.get(h) || []), f]);
  }
  const alias = new Map(); // removed path -> canonical path
  for (const files of groups.values()) {
    if (files.length < 2) continue;
    // Different extensions are different module types; only merge same-extension copies.
    const byExt = new Map();
    for (const f of files) byExt.set(posix.extname(f), [...(byExt.get(posix.extname(f)) || []), f]);
    for (const same of byExt.values()) {
      if (same.length < 2) continue;
      const [canonical, ...rest] = [...same].sort((a, b) => canonicalRank(a) - canonicalRank(b) || a.localeCompare(b));
      for (const r of rest) alias.set(r, canonical);
    }
  }
  // A duplicate's own relative imports must still resolve from the canonical folder.
  for (const [dup, canonical] of [...alias]) {
    if (!CODE.test(dup)) continue;
    const body = read(root, canonical);
    const unresolved = codeSpecifiers(index.fileSet, canonical, body).filter(s => !s.target);
    if (unresolved.length) alias.delete(dup);
  }
  // Code can also reach a file through literals the rewriter cannot see (candidate lists,
  // path.join(repoRoot, "x.js"), spawned child scripts). Keep any copy such a literal still names.
  let plan, kept = 0;
  for (;;) {
    plan = rewriteAliases(root, index, alias);
    const stuck = danglingLiteralTargets(root, index, alias, plan);
    if (!stuck.size) break;
    for (const d of stuck) { alias.delete(d); kept++; }
  }
  for (const [rel, body] of plan) writeFileSync(join(root, rel), body);
  const rewrites = plan.size;
  for (const dup of alias.keys()) rmSync(join(root, dup));
  let savedBytes = 0;
  for (const [dup, canonical] of alias) savedBytes += statSync(join(root, canonical)).size;
  report.dedupe = { removedFiles: alias.size, keptForLiteralReferences: kept, savedBytes, rewrittenFiles: rewrites, aliases: Object.fromEntries([...alias].sort()) };
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function rewriteAliases(root, index, alias) {
  const plan = new Map();
  for (const rel of index.all) {
    if (alias.has(rel) || !/\.(?:md|js|mjs|cjs|json)$/.test(rel)) continue;
    const original = read(root, rel);
    let body = original;
    if (CODE.test(rel)) {
      for (const s of codeSpecifiers(index.fileSet, rel, original)) {
        if (!s.target || !alias.has(s.target)) continue;
        let next = posix.relative(posix.dirname(rel), alias.get(s.target));
        if (!next.startsWith(".")) next = "./" + next;
        // Keep the author's extension style for extensionless requires.
        if (!/\.[a-z]+$/i.test(posix.basename(s.spec))) next = next.replace(/\.(?:js|cjs|mjs)$/, "");
        if (s.kind === "module") {
          body = body.replace(new RegExp(`(["'])${escapeRe(s.spec)}\\1`, "g"), `$1${next}$1`);
        } else {
          const segs = next.split("/").map(x => JSON.stringify(x)).join(", ");
          const old = s.spec.replace(/^\.\//, "").split("/").map(escapeRe).join(`["']\\s*,\\s*["']`);
          body = body.replace(new RegExp(`(path\\.(?:join|resolve)\\(\\s*__dirname\\s*,\\s*)["']${old}["']`, "g"), `$1${segs}`);
        }
      }
    }
    // Full plugin-relative paths in any text. Root-level duplicates have no folder, so a bare
    // name is ambiguous; those are only rewritten through module specifiers and same-folder forms.
    for (const [dup, canonical] of alias) {
      if (!dup.includes("/") || !body.includes(dup)) continue;
      body = body.replace(new RegExp("(?:(?<![\\w.@/-])|(?<=<plugin-root>/)|(?<=\\{CLAUDE_PLUGIN_ROOT\\}/))" + escapeRe(dup) + "(?![\\w-])", "g"), canonical);
    }
    if (rel.endsWith(".md")) {
      body = rewriteRelativeTokens(body, rel, p => alias.get(p) || null);
      const here = posix.dirname(rel);
      const skillRoot = rel.startsWith("skills/") ? rel.split("/").slice(0, 2).join("/") : null;
      for (const [dup, canonical] of alias) {
        // Skill-local short paths (`scripts/x.js`, `references/y.md`, `x.js`) that point at this copy.
        const localForms = new Set();
        if (skillRoot && dup.startsWith(skillRoot + "/")) {
          const inSkill = dup.slice(skillRoot.length + 1);
          localForms.add(inSkill);
          if (posix.dirname(dup) === here) localForms.add(posix.basename(dup));
        } else if (posix.dirname(dup) === here) localForms.add(posix.basename(dup));
        for (const form of localForms) {
          body = body.replace(new RegExp("`(?:\\./)?" + escapeRe(form) + "`", "g"), "`<plugin-root>/" + canonical + "`");
          body = body.replace(new RegExp("(node\\s+)(?:\\./)?" + escapeRe(form) + "(?=[\\s`])", "g"), "$1<plugin-root>/" + canonical);
        }
        body = body.replace(/\]\(([^)\s]+)\)/g, (m, link) => {
          if (link.includes("://") || link.startsWith("#")) return m;
          const [p, anchor] = link.split("#");
          return posix.normalize(posix.join(here, p)) === dup
            ? "](" + posix.relative(here, canonical) + (anchor ? "#" + anchor : "") + ")" : m;
        });
      }
    }
    if (body !== original) plan.set(rel, body);
  }
  return plan;
}

const PATH_LITERAL = /["'`]((?:\.{0,2}\/)?[A-Za-z0-9_@.-]+(?:\/[A-Za-z0-9_@.-]+)*\.(?:js|mjs|cjs|json|md))["'`]/g;

function danglingLiteralTargets(root, index, alias, plan) {
  const stuck = new Set();
  for (const rel of index.all) {
    if (alias.has(rel) || !CODE.test(rel)) continue;
    const body = plan.get(rel) ?? read(root, rel);
    const here = posix.dirname(rel);
    for (const m of body.matchAll(PATH_LITERAL)) {
      const lit = m[1];
      for (const c of [posix.join(here, lit), posix.normalize(lit.replace(/^\.\//, "")), posix.join(here, "..", lit), posix.join(here, "../..", lit)]) {
        const n = posix.normalize(c);
        if (alias.has(n)) stuck.add(n);
      }
    }
  }
  return stuck;
}

// ---------- 3. bundle normalized study folders ----------
function bundleStudies(root, report) {
  const base = "docs/studies/normalized";
  if (!existsSync(join(root, base))) { report.bundle = { bundles: 0, removedFiles: 0 }; return; }
  const topics = readdirSync(join(root, base), { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort();
  const map = new Map(); // old file -> bundle path
  const dirMap = new Map();
  let removed = 0;
  for (const topic of topics) {
    const dir = `${base}/${topic}`;
    const files = walk(root, join(root, dir)).filter(f => f.endsWith(".json"));
    const others = walk(root, join(root, dir)).filter(f => !f.endsWith(".json"));
    if (files.length < 2 || others.length) continue;
    const bundlePath = `${base}/${topic}.bundle.json`;
    if (existsSync(join(root, bundlePath))) throw new Error("DIRECTORY_PROFILE_BUNDLE_EXISTS: " + bundlePath);
    const entries = {};
    for (const f of files) entries[f.slice(dir.length + 1)] = JSON.parse(read(root, f));
    const bundle = { schemaVersion: 1, kind: "yeeflow-normalized-study-bundle", source: dir + "/", note: "Each key is the original file name inside " + dir + "/.", files: entries };
    writeFileSync(join(root, bundlePath), JSON.stringify(bundle) + "\n");
    for (const f of files) { map.set(f, bundlePath); rmSync(join(root, f)); removed++; }
    rmSync(join(root, dir), { recursive: true, force: true });
    dirMap.set(dir, bundlePath);
  }
  let rewritten = 0;
  for (const rel of walk(root)) {
    if (!rel.endsWith(".md")) continue; // code only writes to these folders (--normalized-dir output)
    const original = read(root, rel);
    let body = original;
    // A file inside a bundled folder becomes "<topic>.bundle.json#<file>": the key under "files".
    for (const [f, b] of map) {
      const dir = b.replace(/\.bundle\.json$/, "");
      if (body.includes(f)) body = body.split(f).join(b + "#" + f.slice(dir.length + 1));
    }
    body = rewriteRelativeTokens(body, rel, p => map.has(p) ? map.get(p) + "#" + p.slice(map.get(p).replace(/\.bundle\.json$/, "").length + 1) : null);
    for (const [d, b] of dirMap) body = body.replace(new RegExp(escapeRe(d) + "/?(?![\\w.#-])", "g"), b);
    if (body !== original) { writeFileSync(join(root, rel), body); rewritten++; }
  }
  report.bundle = { bundles: dirMap.size, removedFiles: removed, addedFiles: dirMap.size, rewrittenFiles: rewritten, folders: Object.fromEntries(dirMap) };
}

// ---------- 5. collect shared Markdown into a few large files ----------
// Only plugin-level knowledge folders. Skill-local references stay where their SKILL.md expects them.
export const COLLECTION_FOLDERS = ["docs", "docs/studies", "docs/standards"];
const COLLECTION_BUDGET = 220 * 1024;

function collectMarkdown(root, report) {
  const moved = new Map(); // old path -> { collection, anchor }
  const created = [];
  // Markdown that code opens by path keeps its own file.
  const codeRead = new Set();
  const allNow = walk(root);
  const allSet = new Set(allNow);
  for (const rel of allNow.filter(f => CODE.test(f))) {
    const here = posix.dirname(rel);
    const skillRoot = rel.startsWith("skills/") ? rel.split("/").slice(0, 2).join("/") : null;
    for (const m of read(root, rel).matchAll(PATH_LITERAL)) {
      if (!m[1].endsWith(".md")) continue;
      const cands = [posix.join(here, m[1]), posix.normalize(m[1]), posix.join(here, "..", m[1])];
      if (skillRoot) cands.push(posix.join(skillRoot, m[1]));
      for (const c of cands) if (allSet.has(posix.normalize(c))) codeRead.add(posix.normalize(c));
    }
    // Folder + name joins, e.g. path.join(skillDir, "references", name): keep the whole folder.
    for (const m of read(root, rel).matchAll(/["'`](references|docs\/[A-Za-z0-9_\/-]+)["'`]/g)) {
      for (const c of [posix.join(here, m[1]), posix.join(here, "..", m[1]), skillRoot ? posix.join(skillRoot, m[1]) : m[1], m[1]]) {
        const dir = posix.normalize(c);
        for (const f of allNow) if (f.startsWith(dir + "/") && f.endsWith(".md") && !f.slice(dir.length + 1).includes("/")) codeRead.add(f);
      }
    }
  }
  const skillRefFolders = readdirSync(join(root, "skills")).map(sk => `skills/${sk}/references`).filter(f => existsSync(join(root, f)));
  for (const folder of [...COLLECTION_FOLDERS, ...skillRefFolders]) {
    if (!existsSync(join(root, folder))) continue;
    const files = readdirSync(join(root, folder), { withFileTypes: true })
      .filter(e => e.isFile() && e.name.endsWith(".md") && !/^collection-\d+\.md$/.test(e.name))
      .map(e => `${folder}/${e.name}`).filter(f => !codeRead.has(f)).sort();
    if (files.length < 2) continue;
    const chunks = [];
    let current = [], size = 0;
    for (const f of files) {
      const bytes = statSync(join(root, f)).size + 200;
      if (bytes > COLLECTION_BUDGET) continue; // a large document keeps its own file
      if (current.length && size + bytes > COLLECTION_BUDGET) { chunks.push(current); current = []; size = 0; }
      current.push(f); size += bytes;
    }
    if (current.length) chunks.push(current);
    chunks.forEach((chunk, i) => {
      if (chunk.length < 2) return;
      const collection = `${folder}/collection-${String(i + 1).padStart(2, "0")}.md`;
      const toc = chunk.map(f => `- [${posix.basename(f)}](#${anchorOf(f)})`).join("\n");
      const parts = chunk.map(f => {
        moved.set(f, { collection, anchor: anchorOf(f) });
        return `<a id="${anchorOf(f)}"></a>\n\n<!-- source: ${f} -->\n\n${read(root, f).trim()}\n`;
      });
      const header = `# ${folder} collection ${i + 1}\n\nThis file combines ${chunk.length} documents from \`${folder}/\` for the Claude directory build. A reference to \`${folder}/<name>.md\` is the section that starts at the anchor \`#<name>\` below.\n\n${toc}\n\n---\n\n`;
      writeFileSync(join(root, collection), header + parts.join("\n---\n\n"));
      created.push(collection);
    });
  }
  for (const f of moved.keys()) rmSync(join(root, f));
  // Rewrite references in every remaining text file.
  const all = walk(root);
  const byBase = new Map();
  for (const [f, v] of moved) byBase.set(posix.basename(f), [...(byBase.get(posix.basename(f)) || []), [f, v]]);
  let rewritten = 0;
  for (const rel of all) {
    if (!rel.endsWith(".md")) continue; // code and data keep their literal paths
    const original = read(root, rel);
    let body = original;
    const here = posix.dirname(rel);
    for (const [f, { collection, anchor }] of moved) {
      if (!body.includes(posix.basename(f))) continue;
      // Full paths, optionally prefixed, optionally with an existing #fragment (dropped: headings were renumbered).
      body = body.replace(new RegExp("(?:(?<![\\w.@/-])|(?<=<plugin-root>/)|(?<=\\{CLAUDE_PLUGIN_ROOT\\}/))" + escapeRe(f) + "(?:#[\\w-]+)?(?![\\w.-])", "g"), `${collection}#${anchor}`);
    }
    // Skill-relative forms ("references/x.md") inside the same skill.
    if (rel.startsWith("skills/")) {
      const skillRoot = rel.split("/").slice(0, 2).join("/") + "/";
      for (const [f, { collection, anchor }] of moved) {
        if (!f.startsWith(skillRoot)) continue;
        const local = f.slice(skillRoot.length);
        body = body.replace(new RegExp("(?<![\\w.@/-])(?:\\./)?" + escapeRe(local) + "(?:#[\\w-]+)?(?![\\w.-])", "g"), `${collection.slice(skillRoot.length)}#${anchor}`);
      }
    }
    if (rel.endsWith(".md")) {
      body = rewriteRelativeTokens(body, rel, p => moved.has(p) ? moved.get(p).collection + "#" + moved.get(p).anchor : null);
      body = body.replace(/\]\(([^)\s]+)\)/g, (m, link) => {
        if (link.includes("://") || link.startsWith("#") || link.includes("collection-")) return m;
        const [p] = link.split("#");
        const target = moved.get(posix.normalize(posix.join(here, p)));
        return target ? `](${posix.relative(here, target.collection) || posix.basename(target.collection)}#${target.anchor})` : m;
      });
      // Bare names in backticks that identify exactly one collected document.
      body = body.replace(/`([A-Za-z0-9_.-]+\.md)`/g, (m, name) => {
        const hits = byBase.get(name);
        return hits && hits.length === 1 ? "`" + hits[0][1].collection + "#" + hits[0][1].anchor + "`" : m;
      });
    }
    if (body !== original) { writeFileSync(join(root, rel), body); rewritten++; }
  }
  report.collect = { keptForCodeReads: codeRead.size, collections: created.length, removedFiles: moved.size, addedFiles: created.length, rewrittenFiles: rewritten, map: Object.fromEntries([...moved].map(([k, v]) => [k, v.collection + "#" + v.anchor])) };
}

// ---------- 6. compact large JSON data ----------
// Pretty-printed data over the text limit is held for a reviewer either way; compact
// encoding keeps the same parsed value while cutting download and scan time.
function compactLargeJson(root, report) {
  const changed = [];
  for (const rel of walk(root)) {
    if (!rel.endsWith(".json") || rel.startsWith(".claude-plugin/")) continue;
    const before = statSync(join(root, rel)).size;
    if (before <= DIRECTORY_LIMITS.maxTextBytes) continue;
    const text = read(root, rel);
    const value = JSON.parse(text);
    const compact = JSON.stringify(value) + "\n";
    if (JSON.stringify(JSON.parse(compact)) !== JSON.stringify(value)) throw new Error("DIRECTORY_PROFILE_JSON_ROUNDTRIP: " + rel);
    // Integers beyond 2^53 would be rounded by JSON.parse; keep those files byte-for-byte.
    if (/[-:\[,\s]\d{16,}(?=[,\]}\s])/.test(text)) continue;
    writeFileSync(join(root, rel), compact);
    changed.push({ file: rel, before, after: Buffer.byteLength(compact) });
  }
  report.compact = { files: changed.length, savedBytes: changed.reduce((n, c) => n + c.before - c.after, 0), changed };
}

// Rewrite relative path tokens ("../../docs/a.md", "./x.js") in Markdown whose target moved.
// mapFn(pluginPath) -> new plugin path (may carry "#fragment") or null.
const REL_TOKEN = /(?<![\w@/-])((?:\.\.?\/)+[A-Za-z0-9_@.-]+(?:\/[A-Za-z0-9_@.-]+)*\.(?:md|json|mjs|cjs|js))(#[\w-]+)?(?![\w-])/g;
export function rewriteRelativeTokens(body, rel, mapFn) {
  const here = posix.dirname(rel);
  return body.replace(REL_TOKEN, (m, tok, frag) => {
    const target = mapFn(posix.normalize(posix.join(here, tok)));
    if (!target) return m;
    const [p, newFrag] = target.split("#");
    let next = posix.relative(here, p);
    if (!next.startsWith(".")) next = "./" + next;
    return next + (newFrag ? "#" + newFrag : frag || "");
  });
}

function anchorOf(f) { return posix.basename(f, ".md").toLowerCase().replace(/[^a-z0-9-]+/g, "-"); }

// ---------- lean edition ----------
// Skills that work through the live connector without the bundled generator/validator stack.
export const LEAN_SKILLS = [
  "yeeflow-feature-configuration-guide",
  "yeeflow-mcp-incremental-application-builder",
  "yeeflow-workflow-stage-ui",
  "yeeflow-attachment-ocr-orchestrator",
  "yeeflow-document-archive-lifecycle",
  "yeeflow-data-report-generator",
  "yeeflow-knowledge-source-operator",
  "yeeflow-agent-prompt-designer",
  "yeeflow-copilot-instruction-designer",
  "yeeflow-ai-agent-template-builder",
  "yeeflow-copilot-template-builder",
  "yeeflow-agent-import-export-operator",
  "yeeflow-copilot-import-export-operator",
  "yeeflow-ai-agent-ui-operator",
];
export const LEAN_BUDGET_BYTES = 400 * 1024; // per-skill dependency budget in the lean edition
export const FULL_PLUGIN_URL = "https://github.com/Yeeflow/app-builder-plugin";
// Shared paths that belong to the generator/validator stack, not the lean edition.
const HEAVY_SHARED = /^(?:scripts|core|schemas|tools|docs\/(?:standards|reference|templates|studies|training|releases))\//;

/** Every file reachable from the given seeds (same rules as the closure step), without deleting anything. */
export function referenceClosure(root, seeds) {
  const index = buildIndex(root);
  const keep = new Set(seeds.filter(s => index.fileSet.has(s)));
  const queue = [...keep];
  while (queue.length) {
    const rel = queue.pop();
    if (!TEXT.test(rel) || IMAGE.test(rel)) continue;
    const body = read(root, rel);
    const refs = textRefs(index, rel, body);
    if (CODE.test(rel)) for (const s of codeSpecifiers(index.fileSet, rel, body)) if (s.target) refs.add(s.target);
    for (const r of refs) if (!keep.has(r)) { keep.add(r); queue.push(r); }
  }
  return keep;
}

const skillFiles = (root, skill) => walk(root).filter(f => f.startsWith(`skills/${skill}/`));
const bytesOf = (root, files) => [...files].reduce((n, f) => n + statSync(join(root, f)).size, 0);

/**
 * Keep only LEAN_SKILLS. In a kept skill whose dependency footprint exceeds the budget,
 * turn links to the heavy shared stack into "full Yeeflow plugin only" mentions, keeping
 * the surrounding rules, and add a short edition note. Source skills are never modified.
 */
export function applyLeanEdition(root, report) {
  const present = readdirSync(join(root, "skills")).filter(s => existsSync(join(root, "skills", s, "SKILL.md")));
  const missing = LEAN_SKILLS.filter(s => !present.includes(s));
  if (missing.length) throw new Error("LEAN_SKILL_MISSING: " + missing.join(", "));
  const dropped = present.filter(s => !LEAN_SKILLS.includes(s));
  for (const s of dropped) rmSync(join(root, "skills", s), { recursive: true });
  const rewritten = {};
  const index = buildIndex(root);
  for (const skill of LEAN_SKILLS) {
    const before = bytesOf(root, referenceClosure(root, skillFiles(root, skill)));
    if (before <= LEAN_BUDGET_BYTES) continue;
    const file = `skills/${skill}/SKILL.md`;
    let body = read(root, file);
    const replaced = new Set();
    body = body.replace(/`((?:<plugin-root>\/)?[A-Za-z0-9_@.\/-]+?)(#[\w-]+)?`/g, (m, path, frag) => {
      const p = path.replace(/^<plugin-root>\//, "");
      const target = index.fileSet.has(p) ? p : null;
      if (!target || !HEAVY_SHARED.test(target)) return m;
      replaced.add(target);
      // Name without extension: still recognizable, but no longer resolves to a bundled file.
      return "`" + posix.basename(p).replace(/\.[a-z0-9]+$/i, "") + "` (full Yeeflow plugin only)";
    });
    const note = `> **Directory edition:** dashboard layout templates, golden references and local package validators are bundled only in the full Yeeflow plugin (${FULL_PLUGIN_URL}). In this edition, build through the live MCP contracts (component and resource contracts, read-back after each save) and tell the user which template or validator checks were not run.\n\n`;
    body = body.replace(/^(---\n[\s\S]*?\n---\n)/, `$1\n${note}`);
    writeFileSync(join(root, file), body);
    const after = bytesOf(root, referenceClosure(root, skillFiles(root, skill)));
    rewritten[skill] = { replacedLinks: [...replaced].sort(), bytesBefore: before, bytesAfter: after };
    if (after > LEAN_BUDGET_BYTES) throw new Error(`LEAN_BUDGET_EXCEEDED: ${skill} still needs ${after} bytes`);
  }
  // Skills that point at specialists absent from this edition get one clarifying note.
  const absentMentions = {};
  for (const skill of LEAN_SKILLS) {
    const file = `skills/${skill}/SKILL.md`;
    const body = read(root, file);
    const mentioned = dropped.filter(d => new RegExp("(?<![\\w-])" + escapeRe(d) + "(?![\\w-])").test(body));
    if (!mentioned.length) continue;
    absentMentions[skill] = mentioned;
    const note = `> **Directory edition:** ${mentioned.map(m => "`" + m + "`").join(", ")} ${mentioned.length > 1 ? "are" : "is"} part of the full Yeeflow plugin (${FULL_PLUGIN_URL}) and not installed with this edition. When a task needs ${mentioned.length > 1 ? "one of them" : "it"}, continue with the live MCP tools and this skill's guidance, or tell the user that the full plugin provides that specialist.\n\n`;
    const withNote = body.match(/^---\n[\s\S]*?\n---\n\n> \*\*Directory edition:\*\*/)
      ? body.replace(/^(---\n[\s\S]*?\n---\n\n> \*\*Directory edition:\*\*[^\n]*\n\n)/, `$1${note}`)
      : body.replace(/^(---\n[\s\S]*?\n---\n)/, `$1\n${note}`);
    writeFileSync(join(root, file), withNote);
  }
  report.lean = { skills: LEAN_SKILLS.length, droppedSkills: dropped, rewritten, absentMentions, budgetBytes: LEAN_BUDGET_BYTES };
}

// ---------- 4. closure ----------
function closure(root, report, seedsExtra) {
  const index = buildIndex(root);
  const manifest = JSON.parse(read(root, ".claude-plugin/plugin.json"));
  const seeds = index.all.filter(f => f.startsWith("skills/") || f.startsWith(".claude-plugin/"));
  for (const s of [".mcp.json", "README.md", "LICENSE", "CLAUDE-README.md", (manifest.icon || "").replace(/^\.\//, ""), ...seedsExtra])
    if (s && index.fileSet.has(s)) seeds.push(s);
  const keep = new Set(seeds);
  const parent = {};
  const queue = [...seeds];
  while (queue.length) {
    const rel = queue.pop();
    if (!TEXT.test(rel) || IMAGE.test(rel)) continue;
    const body = read(root, rel);
    const refs = textRefs(index, rel, body);
    if (CODE.test(rel)) for (const s of codeSpecifiers(index.fileSet, rel, body)) if (s.target) refs.add(s.target);
    for (const r of refs) if (!keep.has(r)) { keep.add(r); parent[r] = rel; queue.push(r); }
  }
  const dropped = index.all.filter(f => !keep.has(f));
  for (const f of dropped) rmSync(join(root, f));
  pruneEmptyDirs(root);
  report.closure = { kept: keep.size, removedFiles: dropped.length, reachedFrom: parent };
}

function pruneEmptyDirs(root, dir = root) {
  for (const e of readdirSync(dir, { withFileTypes: true })) if (e.isDirectory()) pruneEmptyDirs(root, join(dir, e.name));
  if (dir !== root && readdirSync(dir).length === 0) rmSync(dir, { recursive: true });
}

// ---------- 5. verify ----------
export function verifyDirectoryProfile(root) {
  const index = buildIndex(root);
  const problems = [];
  const unresolvedImports = [];
  for (const rel of index.all.filter(f => CODE.test(f))) {
    for (const s of codeSpecifiers(index.fileSet, rel, read(root, rel))) {
      if (s.kind === "module" && !s.target) unresolvedImports.push(rel + " -> " + s.spec);
    }
  }
  const oversized = [];
  for (const rel of index.all) {
    const size = statSync(join(root, rel)).size;
    if (size > DIRECTORY_LIMITS.maxAnyBytes) problems.push("FILE_OVER_5MIB " + rel);
    if (!IMAGE.test(rel) && size > DIRECTORY_LIMITS.maxTextBytes) oversized.push({ file: rel, bytes: size });
    if (/(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini)$/.test(rel) || rel.includes("__MACOSX")) problems.push("SYSTEM_FILE " + rel);
    if (/[:]|[. ]$/.test(posix.basename(rel))) problems.push("UNPORTABLE_NAME " + rel);
  }
  if (index.all.length > DIRECTORY_LIMITS.maxFiles) problems.push(`FILE_COUNT ${index.all.length} > ${DIRECTORY_LIMITS.maxFiles}`);
  const skills = readdirSync(join(root, "skills")).filter(s => existsSync(join(root, "skills", s, "SKILL.md")));
  return { files: index.all.length, bytes: index.all.reduce((n, f) => n + statSync(join(root, f)).size, 0), skills: skills.length, unresolvedImports, oversized, problems };
}

/** Baseline of imports that were already unresolved before the profile ran. */
export function unresolvedImportSet(root) {
  const index = buildIndex(root);
  const out = new Set();
  for (const rel of index.all.filter(f => CODE.test(f)))
    for (const s of codeSpecifiers(index.fileSet, rel, read(root, rel))) if (s.kind === "module" && !s.target) out.add(rel + " -> " + s.spec);
  return out;
}

export function applyDirectoryProfile(root, { dropSkills = MAINTAINER_SKILLS, extraSeeds = [], edition = "full" } = {}) {
  const report = { schemaVersion: 1, profile: "claude-directory", edition, before: { files: walk(root).length } };
  const baseline = unresolvedImportSet(root);
  if (edition === "lean") {
    applyLeanEdition(root, report);
    dropSkills = dropSkills.filter(s => existsSync(join(root, "skills", s)));
  } else if (edition !== "full") throw new Error("Unknown edition: " + edition);
  prune(root, report, dropSkills);
  dedupe(root, report);
  bundleStudies(root, report);
  closure(root, report, extraSeeds);
  collectMarkdown(root, report);
  compactLargeJson(root, report);
  const verify = verifyDirectoryProfile(root);
  // Only imports broken by this profile count; pre-existing optional requires are reported separately.
  const after = unresolvedImportSet(root);
  verify.newlyUnresolvedImports = [...after].filter(x => !baseline.has(x));
  verify.preexistingUnresolvedImports = [...baseline].length;
  report.after = verify;
  return report;
}
