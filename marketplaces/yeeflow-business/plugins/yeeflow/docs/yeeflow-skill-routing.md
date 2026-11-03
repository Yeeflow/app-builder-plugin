# Yeeflow Skill Routing

Use this routing note when choosing the top-level Yeeflow skill for a task.

## Learning Orchestrator

Use `yeeflow-feature-learning-orchestrator` when the task is about learning Yeeflow platform behavior from evidence:

- studying new Yeeflow exports
- learning controls, workflow actions, dashboards, expressions, form actions, or runtime behavior
- comparing generated output against manual fixes
- creating focused proof apps for unknown behavior
- updating reusable docs, validators, and generator skills

The learning orchestrator should not own real business app generation from requirements.

## Application Builder

Use `yeeflow-application-builder` when the task is about building a real Yeeflow application from requirements:

- business requirements or SOPs
- process documents
- screenshots or form mockups
- workflow requirements
- sample exports used as references
- requests to build, implement, create, generate, test, or output a `.yap`

The builder acts as the business solution architect. It studies the requirement, designs the app, chooses a safe v1 scope, coordinates the app/list/form/dashboard/expression generators, validates locally, runtime-tests when requested, documents the result, and outputs the final `.yap`.

If the builder discovers an unproven Yeeflow capability that materially affects the app, pause that feature and route the learning portion through `yeeflow-feature-learning-orchestrator`.

## Document and staged-workflow orchestration

| User task | Primary specialist | Lower-level support when needed |
| --- | --- | --- |
| Real task progress, phases, task-specific Toggle defaults, editable demo separation | `yeeflow-workflow-stage-ui` | Approval Form, Expression, Runtime Test |
| Single uploaded file OCR, MD5/type cache, automatic reuse, manual retry | `yeeflow-attachment-ocr-orchestrator` | Custom Code/Service, Data List, Expression, Runtime Test |
| Latest document reuse, metadata edits vs renewal/reupload, approval archive writeback | `yeeflow-document-archive-lifecycle` | Data List, Approval Form, Dashboard, Runtime Test |

These specialists support an authorized application change; they do not imply publication, OCR activation, broader access or data deletion. An ordinary styling edit still belongs to its existing generator. Load only the specialist and references needed for the actual request. See [project patterns](standards/document-workflow-project-patterns.md) for shared practices and proof boundaries.
