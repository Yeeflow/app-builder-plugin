#!/usr/bin/env node
// Search feature metadata first; load only the selected official Yeeflow feature entries.
//
//   node knowledge.mjs search "Lookup" [--domain fields] [--limit 6]
//   node knowledge.mjs read G09-034 G09-142
//
// Read-only. Reads ../references/feature-catalog.json relative to this script.
import { readFileSync, realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = resolve(SKILL_ROOT, "references/feature-catalog.json");
export const DOMAINS = ["designers", "fields", "layout", "data-display", "filters", "rules", "actions", "workflows", "lists", "reports", "portal", "applications"];

export function normalize(value) {
  return value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}_㐀-鿿]/gu, "");
}

export function loadEntries(catalogPath = CATALOG) {
  return JSON.parse(readFileSync(catalogPath, "utf8")).entries;
}

const searchText = entry => [entry.name, entry.summary, ...entry.aliases, entry.considerations || ""].join(" ");

export function search(entries, query, domain, limit) {
  const phrase = normalize(query);
  const terms = query.split(/\s+/).map(normalize).filter(Boolean);
  if (!phrase) throw new Error("Enter a control name, feature ID, or task keyword.");
  const ranked = [];
  for (const entry of entries) {
    if (domain && entry.domain !== domain) continue;
    const names = [entry.id, entry.name, ...entry.aliases].map(normalize);
    const body = normalize(searchText(entry));
    const exact = names.some(n => n === phrase);
    const partial = names.some(n => n.includes(phrase));
    const hits = terms.filter(t => body.includes(t)).length;
    if (!(exact || partial || body.includes(phrase) || (terms.length > 1 && hits === terms.length))) continue;
    ranked.push([100 * exact + 30 * partial + 10 * body.includes(phrase) + hits, entry]);
  }
  ranked.sort((a, b) => b[0] - a[0] || (a[1].id < b[1].id ? -1 : a[1].id > b[1].id ? 1 : 0));
  return {
    query,
    total_matches: ranked.length,
    results: ranked.slice(0, limit).map(([, e]) => ({ id: e.id, name: e.name, domain: e.domain, summary: e.summary, has_considerations: Boolean(e.considerations) })),
  };
}

export function render(entry) {
  const parts = [`# ${entry.name}`, "", `Feature ID: ${entry.id}  `, `Domain: ${entry.domain}`, "", entry.summary, ""];
  if (entry.considerations) parts.push("## Configuration considerations", "", entry.considerations, "");
  parts.push(entry.source_urls.length > 1 ? "## Official references" : "## Official reference", "");
  for (const url of entry.source_urls) parts.push(`[${entry.name}](${url})`);
  parts.push("", `Material date: ${entry.material_date}. Confirm current applicability when it affects the task.`, "");
  return parts.join("\n");
}

export function readEntries(entries, identifiers) {
  const byId = new Map(entries.map(e => [e.id.toUpperCase(), e]));
  const missing = identifiers.filter(i => !byId.has(i.toUpperCase()));
  if (missing.length) throw new Error("Unknown feature ID: " + missing.join(", ") + ". Run search first.");
  return [...new Set(identifiers.map(i => i.toUpperCase()))].map(i => render(byId.get(i))).join("\n\n");
}

function usage() {
  return [
    "Usage:",
    "  node knowledge.mjs search <query> [--domain <domain>] [--limit <n>]",
    "  node knowledge.mjs read <FEATURE-ID> [<FEATURE-ID> ...]",
    "Domains: " + DOMAINS.join(", "),
  ].join("\n");
}

function main(argv) {
  const [command, ...rest] = argv;
  if (!command || command === "--help" || command === "-h") { console.log(usage()); return 0; }
  const entries = loadEntries();
  if (command === "search") {
    let domain = null, limit = 6;
    const words = [];
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === "--domain") {
        domain = rest[++i];
        if (!DOMAINS.includes(domain)) throw new Error(`--domain must be one of: ${DOMAINS.join(", ")}`);
      } else if (rest[i] === "--limit") {
        limit = Number(rest[++i]);
        if (!Number.isInteger(limit) || limit < 1) throw new Error("limit must be greater than zero.");
      } else words.push(rest[i]);
    }
    if (words.length !== 1) throw new Error("search takes one quoted query.\n" + usage());
    console.log(JSON.stringify(search(entries, words[0], domain, limit), null, 2));
    return 0;
  }
  if (command === "read") {
    if (!rest.length) throw new Error("read needs at least one feature ID.\n" + usage());
    console.log(readEntries(entries, rest));
    return 0;
  }
  throw new Error(`Unknown command: ${command}\n` + usage());
}

// Plugin caches are often reached through symlinks: Node reports the real path in
// import.meta.url but keeps the invoked path in argv[1], so compare real paths.
const realOrSelf = path => { try { return realpathSync(path); } catch { return resolve(path); } };
if (process.argv[1] && realOrSelf(process.argv[1]) === realOrSelf(fileURLToPath(import.meta.url))) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 2; }
}
