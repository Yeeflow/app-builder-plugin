# Yeeflow App Builder 1.20.2

Validator and packaging patch for all host packages (Codex, Claude, Grok Bot/Cursor). Previous version: 1.20.1. New version: 1.20.2. Plugin identities, all 31 skills, the unified OAuth MCP connection and the direct-MCP transport are unchanged. No business service, OAuth grant or store listing is changed.

Status: **1.20.2 release**. Host install evidence and remaining gaps are recorded below.

## Changed bundled skills

- `yeeflow-application-generator`, `yeeflow-approval-form-generator`, `yeeflow-expression-generator`: shared expression validator (`yeeflow-expression-utils.js`).
- `yeeflow-data-list-generator`, `yeeflow-package-validator`, `yeeflow-application-generator`: cited references now ship in the package (no skill text change).
- Grok Bot/Cursor package only: the host-requirements section of every skill now links to the source-repository publishing guide instead of naming source-only paths.

## Fixes

1. **Expression validator copy drift.** A 2026-09-11 change taught two copies of `yeeflow-expression-utils.js` to accept list-valued variable tokens, but the application-generator, approval-form-generator and `scripts/` copies kept rejecting `valueType: "list"` with `EXPRESSION_VARIABLE_BAD_VALUETYPE`. All copies are now identical, so the same expression gets the same verdict in every skill.
2. **Conflicting `dateDiff` rules.** Every correct `dateDiff(date1, date2, "day", …)` was flagged `EXPRESSION_FUNCTION_PRIMITIVE_PARAM`, although another rule requires the raw unit string. The primitive-param warning is now skipped only where the function knowledge base uses a primitive (`dateDiff` unit, `datePicker` flag). Wrapped or unknown units, 3-parameter calls and other primitives still warn.
3. **Missing cited references.** `docs/yeeflow-system-configuration-schema-specifications.md` (cited as a hard rule by the data-list generator and package validator) and `docs/studies/normalized/yap-export-shaped-application/reference-shape.normalized.json` (cited as "the bundled sanitized reference" by the application generator) were in the source repository but in no package. Both now ship in all host packages.

## Validation

- Plugin-host compatibility CI suites, including `test:expression-validator-parity` (copy parity and behaviour) and `test:cursor-plugin` (now also checks the two cited references and the guidance links).
- Existing expression regression and smoke tests.
- Release archives: Codex and directory profiles with `checksums.json`; Grok Bot/Cursor ZIP with SHA-256.

Not verified: Designer and live runtime behaviour of `dateDiff` and list-valued expressions; full live business workflows.

## Install smoke

- **Cursor:** Local 1.20.2 install loaded 31 skills and the plugin MCP; authenticated `current_user_get` and `workspace_list` succeeded. The installed expression validator accepted a four-parameter `dateDiff` without the primitive-parameter warning. Both newly bundled references were present.
- **Claude:** A privately uploaded 1.20.2 package was enabled and showed 31 skills and one connector. Repository marketplace sync and OAuth calls through this candidate were not verified.
- **Codex:** A local isolated marketplace installation was enabled as 1.20.2 and contained 31 skills. The existing marketplace name prevented a separate Git-ref installation; OAuth and live calls through the candidate were not verified. The temporary test installation was removed afterward.

Designer and live runtime behavior remain unverified. The Grok Bot marketplace plugin installation was not tested.

## Known limitations

- The Grok Bot marketplace plugin has not been installed (not listed); all 31 skills have not been verified in Grok Bot. See the Grok Bot validation records in `docs/`.
- Packaged `scripts/test-*.mjs` files are source-repository maintainer tests; many fail outside the full repository and are not plugin evidence. Excluding them from the Claude/Cursor packages is deferred.
- Three referenced study documents that contain local paths (`docs/studies/collection-kanban-actions*.md`, `docs/studies/data-list-print-page-dynamic-sub-list.md`) remain source-only.
