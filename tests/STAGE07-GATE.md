# Stage 07 — Projects Gate

Status: **PASS (observed test run)**

Regression gate: `tests/stage07-projects-regression-test.html`

Observed PASS:
- Fresh workspace
- Multi-group project
- Project access for group member
- Project access isolation
- Same-group assignment
- Cross-group Team Leader handoff
- Wrong Team Leader acceptance rejection
- Destination Team Leader acceptance
- Cross-group member assignment rejection
- Active-task group removal protection
- Project completion blocked with active tasks
- Project completion after terminal tasks
- Task creation blocked in completed project
- Completed-task reassignment blocked
- Timeline persistence

Stage 07 project foundation is accepted for the current phase.

Caveat: this regression gate validates sequential domain invariants. It does **not** prove atomic cross-client conflict resolution or deterministic convergence under every simultaneous filesystem race.

Next stage: standalone Tasks — single responsible group, using the validated task lifecycle/handoff engine without requiring a Project.
