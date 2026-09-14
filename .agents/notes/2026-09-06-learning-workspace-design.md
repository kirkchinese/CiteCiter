# Learning workspace design

Status: design proposal, 2026-09-06. No production implementation or release version change in this design pass.

The user prioritized learning and understanding over evidence investigation and retained the requirement for a source conversation beside the learning panel. The proposed experience uses Explain, Board and Learning Cards as its three main views. Concept relationships are a Board view; topic navigation and advanced controls open on demand.

The proposal keeps source validation, independent Topic logs, read-only source access and the isolated host layout adapter. Board rendering in the panel shares the existing board projection. New steps, learning cards and review records require their own validated persistence and logged model inputs when consumed by the runtime.

The original design remains an untracked local draft. The accepted revision and implementation are documented in [the 2026-09-07 note](2026-09-07-learning-workspace.md). The standalone prototype is outside the repository at `E:/project/CiteCiter-UI-Design/prototype.html`; it contains synthetic examples, no model connection and only page-local state. It does not validate native Desktop integration, persistence, source rebinding or model learning quality. Validation observations are recorded with the prototype.

The earlier Verify-first product strategy is superseded for prioritization by the user's learning-first choice. Evidence investigation remains a possible later capability. Existing 0.6.0 build and installation results apply to that candidate, not to the new design.
