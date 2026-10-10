# Claude shared resource optimization

Date: 2026-10-10. Candidate: Yeeflow / yeeflow / 1.17.1-rc.1.

## Implemented

The Claude builder now invokes scripts/claude-shared-resources.mjs. It compares SHA-256 before removing ten reviewed skill-local mirrors of six shared ordinary JSON resources: control configuration, field configuration, expression functions, expression operators, expression knowledge base, and workflow action configuration. Canonical files stay in their existing package-root or scripts locations. Distinct workflow references with different content are not merged.

No blobs, encoded archives, symlinks, remote downloads or resource materialization are introduced. Executable entrypoints retain their paths. A content mismatch aborts the staged build. Generated claude-shared-resources.json records every removed alias, canonical path, byte length, SHA-256 and rewritten reference hash. Scripts with adjacent reference defaults are rewritten to paths relative to their own installed location; skill/reference documentation points to plugin-root resources. No Codex payload is changed.

## Measurements

Before: 1,870 files after MIT addition, 34,404,402 bytes. After: 1,861 files, 32,990,372 bytes. Ten files removed, one audit map added. Shared original bytes removed: 1,414,030; net package savings: 1,414,030 minus map/reference changes. Sixteen non-image files remain above 256 KiB, down from eighteen. Candidate ZIP: 6,706,219 bytes in this build (ZIP byte identity is not claimed, since timestamps are not normalized).

The initial all-file duplicate survey found only 118 redundant files totaling 2,923,175 bytes. Therefore deduplication alone cannot bring this package under 512 files: even removing every initial duplicate would leave well over 1,700 files. The Microsoft package's repeated per-flow archives do not exist in this Claude layout; its compression ratio is not a realistic target here. Remaining executable copies, fixtures and study records are retained because path identity and relative imports can matter. No claim is made that all remaining duplicates are necessary or impossible to optimize.

Dedicated repository staging output: artifacts/claude/public-repository-1.17.1-rc.1-shared. It contains 1,863 files including marketplace metadata and .gitignore, 32,990,691 bytes. The prior MIT and pre-MIT staging outputs remain preserved; use this shared-resource candidate for subsequent work.

## Validation performed

- scripts/test-claude-plugin.mjs passed: checked-in distribution equals fresh rebuild; root ZIP layout; 27 skills; MIT/name/contact; deleted aliases match canonical/source SHA-256; rewritten original/output hashes; all other shared file parity; OpenAI protected files unchanged.
- Extracted package loaders for all three skill expression helpers, workflow action reference and control/field schemas succeed with a foreign temporary CWD.
- Existing test-skill-entrypoint-compat guardrails passed from the extracted plugin.
- git diff --check passed.

These checks establish local package/resource integrity. They do not establish all business workflows, Claude client runtime behavior, directory approval, or the resolution of the session-dependent MCP timestamp validation discrepancy.

## Publication next steps

The package still exceeds the 512-file and 256-KiB reviewer-hold thresholds. Keep that distinction from hard repository-size blockers. A dedicated distribution repository addresses the original development repository's size; it has not yet been created remotely. Portal Validate/security review and candidate installation tests remain necessary. Do not cut referenced resources just to satisfy a numeric threshold. Any later thin hosted-MCP edition requires explicit capability scoping and separate validation.
