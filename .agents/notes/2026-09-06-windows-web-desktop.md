# CiteCiter 0.6: Windows, Web and Desktop

## Decision

Target npm DSH 0.1.2-rc.1 (`a66e4702047846cdaa10c66c9d3df3951f5ea70d`) and Desktop 2.0.5 (`423406fe225442995902015cb6f10eed670ff115`). Do not mix alpha master APIs with release packages. Source was synchronized to CiteCiter 0.5.0 before migration.

Public slots register the selection menu, panel, settings and board workspace. DSH has no public right-dock allocation API in this baseline. Preserve the requested parallel workflow through an isolated, disposable grid adapter: append a column while leaving at least 480 CSS pixels for conversation and retaining native details; allocate a bottom row when readable columns do not fit. Measurement accounts for CSS viewport changes caused by zoom. Unknown frames show a compact compatibility message. Close/dispose restores owned attributes and variables.

## Runtime ownership

The private Topic context owns session projection and read-only sandbox policy. Policy changes occur in an injected scope. Filesystem and subprocess providers remain host-supplied; learning tools do not add write access. Agent-scoped user-question requests return to the correct Topic. React receives DSH snapshot selector hooks and separate business callbacks.

Host and Client compile separately because services such as `sessions` have different owners and methods. Client conversations use session bindings and activated chat projections. Update commands read Desktop's current profile from its public Host service, not a fictional Client service.

Logical headers use `isSeeded`; history slicing uses `inheritedEventCount`, not the start of the current runtime. rc.1 still stores physical version-0 `seedLength`. A reader test checks inherited history and unchanged artifact bytes. This does not promise acceptance of every older event or future format.

## Evidence and limits

Focused tests cover inherited history, physical JSONL, geometry and profile-safe update commands. A real keyless DSH fixture exercises source generation, Observer, Exact Fork, source reading and board application; it compares a committed transcript and verifies that source events stay unchanged. The runner also accepts a tarball. Windows Web checks cover 55% at 1920 pixels, clamping at 1280, a bottom row at 768, filesystem tools and interactive questions.

The sizing adapter remains version-specific. Do not claim Linux/macOS, DSH alpha, native display-scale changes or Desktop modes without completed UI checks are verified. Real provider behavior needs separate real-API checks. Detailed local measurements belong in the external development guide; release validation status belongs in the release note.

Release CI pins DSH 0.1.2-rc.1 and uses the frozen lockfile on Linux / Node 22.19 and Windows / Node 24. It validates source and packed application snapshots instead of rewriting the dependency manifest to an obsolete host version. These checks do not substitute for platform UI validation.
