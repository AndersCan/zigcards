---
zigcards: patch
---

Upgrade @mantaq/core and @mantaq/sugar to 0.1.0 (events are now { type, payload } — fixes the payload/id collision; throwing handlers now enter an error state instead of corrupting the actor). App fixes: render the __error state with a Restart button; silence deliberate-drop warnings with explicit no-op handlers; hide the gear during the grading fly-out; deterministic review timestamps; typed settings return target; clear stale lastGrade; version + validation for persisted data; mantaq test-harness coverage test; leaked-timer assertions; gitignore/repo hygiene; CI uses a frozen install.
