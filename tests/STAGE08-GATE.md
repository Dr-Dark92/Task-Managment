# Stage 08 — Standalone Tasks Gate

Status: **PASS (observed test run)**

Regression gate: `tests/stage08-standalone-tasks-regression-test.html`

Observed PASS:
- Fresh workspace
- Standalone task has no project
- Own-group direct assignment
- Cross-group pending handoff
- Destination unassigned queue visibility
- Destination Team Leader assignment
- Assignee visibility
- Assigned-task peer privacy
- Group Team Leader retained visibility
- Creator retained visibility
- Full standalone task lifecycle
- Terminal reassignment protection

Stage 08 standalone Tasks foundation is accepted for the current phase.

Visibility model:
- Unassigned group work remains visible to members of the responsible group.
- Once assigned, ordinary peer employees do not see another employee's task.
- Assignee, responsible Team Leader/Manager, creator, and Administrator retain visibility as applicable.

Caveat: this gate validates sequential domain invariants. It does **not** prove atomic cross-client conflict resolution under simultaneous filesystem races.

Next stage: Tickets — separate ticket lifecycle and queue, not a task subtype.
