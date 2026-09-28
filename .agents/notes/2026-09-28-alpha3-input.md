# Synchronous composer edits with silent draft persistence

The user reported flashing save status and broken Chinese/Latin input, with digits still usable. The installed alpha.2 reproduced an IME sequence n → ni → 你 as nni你. The same sequence in DSH's native input produced 你. Direct ASCII abcXYZ123 worked, so this is a composition/state regression rather than a font or storage encoding failure.

The alpha.1 durable-draft refactor replaced synchronous React state in CitePanel with a controller. Its mutate function unconditionally awaited ensure, including already loaded drafts. That microtask delayed the controlled value notification until after React restored the old DOM value, terminating composition. The alpha.2 version-check fix did not introduce or alter this path.

Keep mutations of ready drafts synchronous, while preserving asynchronous initial loading and debounced persistence. A single-variable installed probe confirmed that this change alone restores n → ni → 你 across autosave pauses. Remove only the transient saving text; retain conflict, error, missing-file and pending-send notices. Do not duplicate the controller state in React or mask the bug by disabling persistence.

Validation must use actual browser composition events, including pauses, replacement and cancellation; fill/paste-only checks missed the regression. Keep documented reproduction steps instead of temporary scripts or artificial model providers, following the user's repository policy. Host input, CAS storage, permissions and manual submission remain unchanged. Results and publication limits are recorded in docs/validation/2026-09-28-alpha3-input.md.

Released as 0.9.0-alpha.3 after PR #12 and both Windows/Ubuntu CI runs passed. npm latest and next and the GitHub prerelease resolve to this version. Public archive hashes match the package installed in both profiles. Web input, two real model submissions and host-restart recovery passed; native Desktop UI control was unavailable and is explicitly not counted as a new native-window pass.
