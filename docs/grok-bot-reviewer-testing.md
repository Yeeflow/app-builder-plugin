# Yeeflow plugin: reviewer testing instructions (Grok Bot / Cursor)

Plugin: `yeeflow` · Version: 1.20.1 · Publisher: Yeeflow (support@yeeflow.com)
Components: 31 skills, 1 remote MCP server (`yeeflow_mcp`, `https://api.yeeflow.com/v1/mcp`, Streamable HTTP, OAuth).
The plugin bundles no credentials, no hooks and no local MCP server.

> Publisher checklist before submitting: choose the reviewer account option in section 1, replace every `[ ]` placeholder, and send any password through the channel the reviewer asks for. Never commit it here. Include the "Publisher testing so far" paragraph below, kept in line with [the validation record](grok-bot-cursor-validation-2026-10-28.md).

**Publisher testing so far (include in the submission):**

```text
Publisher testing before listing: The released 1.20.1 package was installed as a Cursor local plugin. Cursor loaded the plugin, 31 skills and its own yeeflow_mcp connection; plugin OAuth completed; current_user_get, get_profile and workspace_list succeeded through the plugin connection; skills were invoked in safe dry-run mode (no live writes). In Grok Bot, the same MCP server was connected as a custom MCP server with OAuth and read calls succeeded. We could not install the unlisted plugin in Grok Bot from an individual account, so Grok Bot plugin installation and skill loading are untested by us. Full live business workflows were not run.
```

---

## Short version (paste into the "Testing Instructions" field)

```text
Yeeflow is a low-code business application platform. The plugin adds 31 skills and one hosted MCP server (https://api.yeeflow.com/v1/mcp, OAuth; no API key).

Option A test account: a dedicated reviewer account in a sandbox tenant: [REVIEWER EMAIL]. Password: [PROVIDED SEPARATELY]. The account can only reach the "Grok Review Sandbox" workspace. For a reviewer-created trial instead, use the separate Option B instructions below.

1. Install the Yeeflow plugin, choose Authenticate, sign in with the reviewer account and approve access.
2. New chat: "Use Yeeflow to show my current user profile." Expect the reviewer's name and email.
3. "Use Yeeflow to list my workspaces." Expect "Grok Review Sandbox".
4. "List the applications in the Grok Review Sandbox workspace." Expect "Asset Management (Sample)".
5. "Use the Yeeflow application builder skill to plan a simple visitor registration app. Do not create anything yet." Expect a plan of lists, forms and workflow with no write tool calls.
6. "Which Yeeflow control should I use for a dependent dropdown, and how do I configure it?" Expect an answer based on Yeeflow Help Center references.
7. Optional write test: "Create a data list called Review Test in the sandbox workspace." The bot should describe the change and ask for confirmation before writing.

All writes require explicit user confirmation. Support: support@yeeflow.com.
```

**Option B short version (reviewer-created trial):**

```text
Yeeflow is a low-code business application platform. The plugin adds 31 skills and one hosted MCP server (https://api.yeeflow.com/v1/mcp, OAuth; no API key).

Create a free Yeeflow trial at https://www.yeeflow.com, verify your email, and finish creating an organization. The trial starts without sample data; see https://support.yeeflow.com/en/articles/8656028-signing-up-for-new-yeeflow-account.

1. Install the Yeeflow plugin, choose Authenticate, sign in with the trial account and approve access.
2. In a new chat, ask: "Use Yeeflow to show my current user profile." Expect your account name and email.
3. Ask: "Use Yeeflow to list my workspaces." Expect the workspaces available to the trial account.
4. Ask: "Use the Yeeflow application builder skill to plan a simple visitor registration app. Do not create anything yet." Expect a plan with no write tool calls.
5. Ask: "Which Yeeflow control should I use for a dependent dropdown, and how do I configure it?" Expect an answer based on Yeeflow Help Center references.

If testing writes, obtain the account owner's explicit confirmation first; permissions and available operations depend on the trial account. Support: support@yeeflow.com.
```

---

## Full instructions

### 1. Test account and data

| Item | Value |
|---|---|
| Reviewer account | `[reviewer email]` |
| Password | `[delivered separately]` |
| Tenant | `[sandbox tenant URL]` |
| Workspace | `Grok Review Sandbox` (the only workspace this account can see) |
| Sample data | Application `Asset Management (Sample)` with a few records and one approval form |
| Account scope | Workspace member in the sandbox only. No admin rights, no production data. |

**Option B (no publisher-provided account):** reviewers create a free Yeeflow organization at https://www.yeeflow.com ("Get Started"; see [Signing up for a new Yeeflow account](https://support.yeeflow.com/en/articles/8656028-signing-up-for-new-yeeflow-account)). There is no sample data, so skip 3.3–3.4 and 4.4, and use an available workspace in 3.2. Section 5 is optional and depends on the trial account's permissions; substitute that workspace name and obtain confirmation before writing.

### 2. Install and connect

1. In Grok Bot, open **Connect apps** (or Cursor → Plugins) and search for **Yeeflow**. Choose **Add**.
2. Open the installed plugin. Confirm it shows **31 skills** and **1 connector** (`yeeflow_mcp`).
3. Choose **Authenticate**. A Yeeflow sign-in page opens in the browser.
4. Sign in with the reviewer account and approve the requested access.
5. Confirm the plugin no longer shows **Needs auth**.
6. Start a **new** conversation for the tests below; a chat opened before install may not see the plugin.

### 3. Read-only checks (MCP)

| # | Prompt | Expected result |
|---|---|---|
| 3.1 | `Use Yeeflow to show my current user profile.` | Reviewer's display name and email. |
| 3.2 | `Use Yeeflow to list my workspaces.` | `Grok Review Sandbox`. No other workspaces. |
| 3.3 | `List the applications in the Grok Review Sandbox workspace.` | `Asset Management (Sample)`. |
| 3.4 | `Show the lists in Asset Management (Sample) and the fields of the Assets list.` | List names plus field names and types. |
| 3.5 | `Show my pending Yeeflow workflow tasks.` | A task list or an empty result. Empty is a pass. |

### 4. Skill checks (no writes)

| # | Prompt | Expected result |
|---|---|---|
| 4.1 | `Use the Yeeflow application builder skill to plan a simple visitor registration app. Do not create anything yet.` | A structured plan (data lists, forms, approval workflow, permissions). No create/update tool calls. |
| 4.2 | `Which Yeeflow control should I use for a dependent dropdown, and how do I configure it?` | A configuration answer based on Yeeflow Help Center references. |
| 4.3 | `Write a Yeeflow expression that adds 30 days to the Request Date field.` | An expression using Yeeflow date functions. |
| 4.4 | `Inspect Asset Management (Sample) read-only and list anything that looks misconfigured.` | A read-only review. No writes. |

### 5. Optional write check (confirmation gate)

| # | Prompt | Expected result |
|---|---|---|
| 5.1 | `Create a data list called Review Test with a Title field in the Grok Review Sandbox workspace.` | The bot describes the change and **asks for confirmation** before any write. |
| 5.2 | Reply `Yes, create it.` | The list appears in the sandbox workspace. |
| 5.3 | `Delete the Review Test list.` | The bot asks for confirmation again before deleting. |

Section 5 is optional. Authentication never grants more than the signed-in account already has in Yeeflow.

### 6. Known limitations

- Some generator and validator skills run bundled Node.js scripts on the Bot's computer. If Node is not available there, the skill reports that validation did not run; that is expected, not a failure.
- Complete runtime acceptance of a generated application (approvals, reports, dashboards) is outside this review.
- Only the hosted MCP connection is used. The plugin does not call REST APIs with API keys.

### 7. Data handling

Tool arguments contain only the business data or configuration needed for the requested action, and results return to the conversation. Access is governed by the signed-in Yeeflow account.
Privacy policy: https://www.yeeflow.com/privacy · Support: support@yeeflow.com
