import { readFileSync, writeFileSync, readdirSync, rmSync, existsSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";
export const services = ["yeeflow"];
export function validateApps(value) {
  if (!value || !value.apps || Object.keys(value).some(k => k !== "apps") ||
      Object.keys(value.apps).sort().join() !== [...services].sort().join())
    throw new Error("PLUGIN_APPS_SERVICE_SET_INVALID: exactly one unified Yeeflow mapping required");
  const ids = services.map(key => {
    const app = value.apps[key];
    if (!app || Object.keys(app).some(k => !["id", "required"].includes(k)) ||
        (app.required !== undefined && app.required !== true) || typeof app.id !== "string" ||
        !/^(asdk_app_|connector_|templated_apps_)[A-Za-z0-9][A-Za-z0-9_-]*$/.test(app.id))
      throw new Error(`PLUGIN_APP_ID_INVALID: ${key}; use registered App ID, not plugin directory ID`);
    return app.id;
  });
  if (new Set(ids).size !== services.length) throw new Error("PLUGIN_APP_ID_DUPLICATE");
  return value;
}
// app/read is metadata, not evidence that a second ChatGPT user can install and
// authorize this App. This check only excludes known unsuitable publisher inputs.
export function validateManagedApp(apps, metadata) {
  validateApps(apps);
  const id = apps.apps.yeeflow.id;
  const matches = metadata?.apps?.filter(app => app.id === id) ?? [];
  if (matches.length !== 1 || metadata?.missingAppIds?.includes(id))
    throw new Error("PLUGIN_MANAGED_APP_NOT_FOUND: refresh app/read for the selected registered App");
  const app = matches[0];
  if (!["ECOSYSTEM_DIRECTORY", "DEFAULT_OAI_CATALOG"].includes(app.distributionChannel))
    throw new Error("PLUGIN_MANAGED_APP_DISTRIBUTION_UNSUITABLE: require public catalog metadata; personal, workspace-only, missing and unknown channels are rejected");
  if (/\b(test|rc|private)\b/i.test([app.name, app.description, ...(app.pluginDisplayNames ?? [])].join(" ")))
    throw new Error("PLUGIN_MANAGED_APP_TEST_DEPENDENCY: do not distribute the private RC Test App");
  return { apps: { yeeflow: { id, required: true } } };
}
export function profileOptions(argv) {
  const take = (key, fallback) => {
    const i = argv.indexOf(key);
    if (i < 0) return fallback;
    if (argv.lastIndexOf(key) !== i || !argv[i+1] || argv[i+1].startsWith("--")) throw new Error(`PLUGIN_ARGUMENT_INVALID: ${key}`);
    return argv[i+1];
  };
  const profile = take("--profile", "codex");
  if (!["codex", "chatgpt-web", "managed-marketplace", "directory"].includes(profile)) throw new Error("PLUGIN_PROFILE_INVALID");
  const appsPath = take("--apps", null), name = take("--name", "yeeflow-app-builder"), displayName = take("--display-name", null);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) throw new Error("PLUGIN_NAME_INVALID");
  if (profile === "codex" && (appsPath || argv.includes("--name") || displayName)) throw new Error("PLUGIN_WEB_OPTIONS_REQUIRE_WEB_PROFILE");
  if (profile === "chatgpt-web" && !appsPath) throw new Error("PLUGIN_WEB_APPS_REQUIRED");
  const appMetadataPath = take("--app-metadata", null);
  if (profile === "managed-marketplace" && (!appsPath || !appMetadataPath)) throw new Error("PLUGIN_MANAGED_APP_INPUTS_REQUIRED");
  if (profile === "managed-marketplace" && (argv.includes("--name") || displayName)) throw new Error("PLUGIN_MANAGED_IDENTITY_OVERRIDE_FORBIDDEN");
  if (profile !== "managed-marketplace" && appMetadataPath) throw new Error("PLUGIN_MANAGED_METADATA_REQUIRES_MANAGED_PROFILE");
  if (profile === "directory" && (appsPath || argv.includes("--name") || displayName)) throw new Error("PLUGIN_DIRECTORY_APP_OPTIONS_FORBIDDEN");
  const version = take("--version", null);
  if (version !== null && !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(version)) throw new Error("PLUGIN_VERSION_INVALID");
  return { profile, appsPath, appMetadataPath, name, displayName, version };
}
export function applyHostProfile(stageRoot, repoRoot, options, apps) {
  const manifestPath = resolve(stageRoot, ".codex-plugin/plugin.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (options.version) manifest.version = options.version;
  // The canonical validator owns the complete shared dependency graph.
  copyFileSync(resolve(repoRoot, "skills/installed/yeeflow-application-generator/scripts/validate-yap-package.js"), resolve(stageRoot, "skills/yeeflow-application-generator/scripts/validate-yap-package.js"));
  copyFileSync(resolve(repoRoot, "scripts/test-skill-entrypoint-compat.mjs"), resolve(stageRoot, "scripts/test-skill-entrypoint-compat.mjs"));
  const guidance = readFileSync(resolve(repoRoot, "docs/standards/plugin-resource-access.md"), "utf8");
  for (const skill of readdirSync(resolve(stageRoot, "skills"))) {
    const file = resolve(stageRoot, "skills", skill, "SKILL.md");
    if (!existsSync(file)) continue;
    const body = readFileSync(file, "utf8");
    const marker = "<!-- plugin-resource-access -->";
    writeFileSync(file, body.split(marker)[0].trimEnd() + "\n\n" + marker + "\n" + guidance);
  }
  if (options.profile === "codex") {
    delete manifest.apps;
    rmSync(resolve(stageRoot, ".app.json"), { force: true });
    manifest.mcpServers = "./.mcp.json";
  }
  if (["chatgpt-web", "managed-marketplace"].includes(options.profile)) {
    validateApps(apps);
    delete manifest.mcpServers;
    // Removing only the manifest field leaves default MCP autodiscovery active.
    rmSync(resolve(stageRoot, ".mcp.json"), { force: true });
    rmSync(resolve(stageRoot, "mcp.json"), { force: true });
    manifest.apps = "./.app.json";
    manifest.name = options.name;
    if (options.displayName) manifest.interface.displayName = options.displayName;
    manifest.interface.longDescription = manifest.interface.longDescription.replace("in Codex", "in ChatGPT");
    writeFileSync(resolve(stageRoot, ".app.json"), JSON.stringify(apps, null, 2) + "\n");
    if (options.profile === "managed-marketplace") {
      // Preserve the existing marketplace identity and brand. No second plugin,
      // account-specific MCP server, or private test wrapper is generated.
      manifest.name = "yeeflow-app-builder";
      manifest.interface.displayName = "Yeeflow";
      writeFileSync(resolve(stageRoot, ".app.json"), JSON.stringify({ apps: { yeeflow: { id: apps.apps.yeeflow.id, required: true } } }, null, 2) + "\n");
    }
  }
  if (options.profile === "directory") {
    // The distributed package declares one integration. The host owns each user's
    // OAuth grants and routes calls using the selected connection's credentials.
    // Never bind the public package to a developer's registered private App.
    for (const file of [".app.json", "mcp.json", "plugin.json", "hooks"]) {
      rmSync(resolve(stageRoot, file), { recursive: true, force: true });
    }
    delete manifest.apps;
    delete manifest.hooks;
    if (manifest.extensions?.["com.openai"]) {
      delete manifest.extensions["com.openai"].apps;
      delete manifest.extensions["com.openai"].hooks;
    }
    manifest.mcpServers = "./.mcp.json";
    manifest.interface.supportURL ||= "https://support.yeeflow.com/";
    manifest.interface.longDescription += " Connect your own Yeeflow account through OAuth. Additional-account management depends on the host's supported connection flow; each operation uses the selected account's permissions.";
    // The directory accepts at most three starter prompts.
    if (Array.isArray(manifest.interface.defaultPrompt)) manifest.interface.defaultPrompt = manifest.interface.defaultPrompt.slice(0, 3);
    // Keep the supported Codex compatibility layout. The generic portable MCP
    // schema does not yet model the documented OpenAI auth extension.
    writeFileSync(resolve(stageRoot, ".mcp.json"), JSON.stringify({
      mcpServers: {
        yeeflow_mcp: {
          type: "http",
          url: "https://api.yeeflow.com/v1/mcp",
          extensions: { "com.openai": { auth: { type: "oauth", client: { mode: "dcr" } } } },
        },
      },
    }, null, 2) + "\n");
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}
