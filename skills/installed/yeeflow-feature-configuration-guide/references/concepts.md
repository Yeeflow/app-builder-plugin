# Objects and semantics

Read this reference when the task crosses UI, data, and automation boundaries.

| Object | Responsibility | Check before configuration |
| --- | --- | --- |
| Data list | Persistent business records | Field types, record grain, permissions, uniqueness, triggers |
| Approval form | Submission and task interfaces | Variables, page types, task associations, native operations |
| Dashboard | Presentation and interactions | Sources, filters, parameters, record context |
| Public form | Public data collection | Target list, validation, submission feedback |
| Form report | Approval-data projection | Source variables, sublist grain, access, freshness |
| Data Report | Source transformation and combination | Joins, grouping, deduplication, refresh |
| Service portal | External-user access | Access model, users, exposed components and record rights |

| Similar names | Distinction |
| --- | --- |
| Table / Data Table | Control layout / querying and displaying records |
| Rich Text / Paragraph | Saved formatted input / page content |
| Image / Picture | Image field input / page image presentation |
| Switch / Toggle | Boolean field / collapsible content |
| Date Range / Date Filter | Field input / query condition |
| Lookup / Lookup List | Related-record values / mapping selected records into associated detail rows |
| Summary / detail aggregation | Source-wide measure / aggregation over the intended detail rows |
| Page action / workflow action | Page-context interaction / background process configuration |
| Business Status / workflow state | Application field / system process state |
| Connector / external integration | Path merging / calling another system |
| QR Code / scanning | Producing a code / reading its content |

Control IDs, field IDs, record IDs, display text, and business keys have different roles. Identify the actual stored value before mapping a relationship. Visibility and readonly presentation do not replace access permissions. Assigning a value does not by itself establish that it was saved.
