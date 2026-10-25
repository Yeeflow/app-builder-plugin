# Sources and applicability

The catalog entries in `feature-catalog.json` are concise English paraphrases of official Yeeflow Help Center material collected on 2026-10-15. Each entry links to its authoritative article. The archive was reused; not every article was fetched live again and no tenant execution was performed. Recheck the linked article or target environment when versions, availability, timing, concurrency, permissions, or limits materially affect the answer.

The catalog contains official product knowledge and configuration practices. It does not contain tenant business rules, product source code, internal implementation observations, or identifiers copied from a project.

| Resource | Use | Link |
| --- | --- | --- |
| Help Center | Control and configuration details | [Help Center](https://support.yeeflow.com/en/) |
| University | Configuration demonstrations | [University](https://www.yeeflow.com/university) |
| Blog | Product and business scenarios | [Blog](https://www.yeeflow.com/blog) |
| Webinars | Product and solution sessions | [Webinars](https://www.yeeflow.com/webinars) |
| Product updates | Changes and release information | [Product updates](https://www.yeeflow.com/news) |
| Developer | Official API and integration contracts | [Developer](https://www.yeeflow.com/developers/api) |
| Community | Discussion and contextual experience | [Community](https://community.yeeflow.com/) |

A configuration example is not a default business policy. A query result policy, refresh requirement, identifier convention, field restriction, or enabled integration must come from the current task and actual environment. Use official extension features only when they belong to the authorized scope.

## Relationship to the other skills in this plugin

This skill is the feature-level guide. The build lifecycle, dependency handling, secret-safe operation, and evidence levels in [Application implementation](application-implementation.md) are aligned with the plugin's specialist skills: `yeeflow-application-builder`, `yeeflow-mcp-incremental-application-builder`, `yeeflow-package-validator`, and `yeeflow-runtime-test-orchestrator`. Help Center articles remain the source for individual feature explanations; current MCP schemas and target readback determine executable contracts.

Generation, package validation, runtime testing, and validators live in those specialist skills and the plugin's shared `scripts/` and `docs/`. Load the specialist skill when the task needs it rather than re-implementing its rules here. Do not import project examples, internal payload recipes, template-specific defaults, or release procedures into an ordinary feature configuration task.
