# Native task-driven progress

## Evidence and portability

The observed native workflow Designer exposed Context → Task Context → a real task → ID / Outcome. Copying the configured control through the native UI revealed these token arrays:

```json
[
  {"exprType":"task","key":"TaskID","id":"<existing-task-node-guid>","type":"expr","name":"<task-label>:ID"}
]
```

```json
[
  {"exprType":"task","key":"Outcome","id":"<existing-task-node-guid>","type":"expr","name":"<task-label>:Outcome"}
]
```

Resolve `id` to a real node in the target definition; never allocate a replacement for that node just to bind the UI. These are not ordinary workflow-variable tokens. Verify the current native Designer/export if the host schema differs. Retrieve configuration through supported MCP or native UI; do not inspect hidden React state or use browser network access as a substitute.

For the observed sequential workflow, a nonempty task ID plus empty Outcome identified a pending task. The instance status token used `exprType: application` / `id: ApplicationStatus`. The tested target mapped completed/rejected/withdrawn to `2`/`3`/`5`; resolve those codes for each target rather than making them global assumptions. Task context from an earlier page was able to show the later active task. Multiple assignees, returns and concurrent context refresh need their own runtime proof.

## Steps bar pattern

- `type: steps-bar`, `attrs.source: "9"`, real MCP-issued GUID keys in `steps-options`.
- `attrs.layout: "2"` is Basic chevron; `attrs["text-posi"]: "3"` puts labels above.
- `attrs["current-step"]` is `{value:null, variable:<native token array>}`; its calculated result must equal a configured option value.
- Match current, past and ahead colors to the application's theme. Use locally scoped CSS if the native style panel cannot express the requirement. Observed rendered classes were `.basic-chevron-current`, `.basic-chevron-past`, `.basic-chevron-ahead` and `.basic-chevron-box`; inspect the target DOM before depending on them.
- A completed phase may use an explicit terminal option such as “Preparation complete”. Label it as phase completion rather than implying another approval task was added.

Keep the wrapper `max-width:100%; overflow-x:auto` with a content minimum width appropriate to the label count. Verify page width equals viewport width and wrapper scroll width exceeds wrapper width only where intended. Restore temporary viewport overrides after testing.

## Implementation boundaries

Page-specific defaults are appropriate when the workflow already selects a different native form for each task. They do not automatically reinitialize an already open page when the backend advances. Test reopen/refresh behavior and avoid presenting a stale open browser tab as live streaming progress.

Do not write a “current stage” business variable from page load simply to display progress: reading a historical page could then mutate the process. If native context is unavailable, choose a verified read-only query or an explicitly planned backend state producer, and document that dependency.
