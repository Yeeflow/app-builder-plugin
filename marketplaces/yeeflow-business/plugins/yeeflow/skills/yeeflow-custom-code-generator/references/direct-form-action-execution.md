# Direct Form Action execution from Custom Code

## Contract and evidence

Product-team contract supplied on 2026-10-06 for `codeInContext`:

```ts
/** Execute an action by id, or by its unique name. String references prefer id. */
executeAction: (action: string | { id?: string; name?: string }) => Promise<void>;
```

This is a host API, not an MCP tool or a plugin-installed runtime implementation. Generate direct calls only for a host exposing this API. The runtime argument is called `context` in the existing `render(context, fieldsValues, readonly)` examples; bind the actual CodeInContext instance there. Do not invent a global `codeInContext` or a `context.codeInContext` property. Verify the host context has `executeAction` before invoking it. This rule does not change the `render` versus action-step `execute` entrypoints.

## Reference selection

Prefer `await context.executeAction({ id: actionId })` for generated applications. Allocate or read the real action ID, define the action in the owning form/page, and keep the reference updated during cloning/remapping. `{ name: actionName }` requires a unique name in the target host scope. String references resolve by ID first, then unique name. For an intentional name call, use the explicit name object to avoid collisions with IDs. Generate exactly one nonempty id or name; behavior for both/neither is unspecified. Do not fabricate IDs, assume cross-form lookup, or assume action names remain stable after rename.

```ts
// Inside a user event handler with the actual host context in scope:
if (typeof context.executeAction !== 'function') {
  throw new Error('This page requires direct Form Action support.');
}
await context.executeAction({ id: configuredActionId });
// Or, when the unique name is intentional:
await context.executeAction({ name: 'Open selected record' });
```

## Three supported generation patterns

1. Button: use an asynchronous handler, disable repeated clicks while pending, catch and present failures, and release the busy lock in `finally`. Preserve readonly and explicit confirmation requirements for mutations. Never call actions from render.
2. Value change: compare the meaningful previous and next values; do not fire on initial render or on unrelated changes. Track action-induced updates to prevent cycles; debounce when appropriate and serialize operations. Do not use a general rerender or an unguarded effect as the trigger. User-triggered saves/deletes must not silently become automatic writes.
3. Custom collection row: capture the clicked row identity, write it into a declared writable host variable, then invoke the action that reads that variable. Use a single shared busy lock/queue across rows when they share the same variable; per-row locks are insufficient. Do not assume native Collection current-row context is established by clicking a custom React row.

The API takes one action reference only. It has no record payload, variables argument, cancellation token, or business return value. Do not emit `executeAction(action, { recordId })`, infer outputs from Promise<void>, or invent an action parameter schema. Use declared host fields/temp variables for inputs and outputs, with existing surface-specific writable-target rules. `await` on a setter returning void does not prove the action sees the new value: use verified host propagation/readback before execution. If the host offers no proven ordering mechanism, mark row-context integration unverified rather than adding a guessed sleep.

Use `examples/form-action-dispatch.mjs` as a portable orchestration helper; it receives an adapter named `prepareContext` supplied by the generated component. That adapter is not a Yeeflow API. Its contract is to complete only after the target host can read the intended variables. It must reject on failed write/readback. The helper rejects overlapping calls instead of overwriting shared row context. Catch its rejection in the UI. Keep busy state and error text visible as appropriate. Use existing React 15.6 / Ant Design 2.13 conventions.

## Planning, generation, and validation

Record owning surface, action ID or unique name, action definition, event trigger, readonly behavior, variable mapping, confirmation requirements, concurrency policy, value-change loop guard, and refresh/readback needs in the app plan. The Dashboard Communication and Native Integration section must include these mappings. Generate the native action and declared variables together with the Custom Code; an action call alone does not create its target action. Revalidate IDs after any clone/remap. The helper's shape checks are not action-definition closure validation: compare every generated action reference with the actual owning form/page actions.

On hosts with this API, direct execution is preferred over hidden buttons and CSS-ID DOM clicks. Preserve old button-based behavior only for an existing, verified legacy host or an explicit compatibility requirement; never silently fall back to a DOM click after direct execution fails, because a partial action may already have executed. Native buttons remain appropriate visible UI when requested. Do not remove a button until its old callers and accessibility behavior have been accounted for.

For Form Action Custom Code steps, do not generate self-invocation or indirect action cycles. Support for nested execution and its completion semantics must be verified before emitting nested actions. A control's readonly value and local checks improve UX; host permissions remain authoritative.

## Required runtime acceptance (not yet proven by unit tests)

Test Dashboard, data-list custom form, and approval form separately before claiming each supported. Include ID, unique-name and string-ID-precedence calls; missing action and duplicate-name errors; old host API absence; rejected action; double-clicks across two rows; variable visibility; initial render; action-induced value changes; readonly/permission denial; selected-record editor opening; and result refresh/readback. Establish whether Promise completion means dispatch, action-chain completion, or dialog closure. A resolved Promise does not by itself prove a saved record, completed workflow, or rendered editor. Product contract plus mocked tests is not tenant runtime proof.
