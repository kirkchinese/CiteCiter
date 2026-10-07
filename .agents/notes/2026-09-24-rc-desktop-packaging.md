# RC Web baseline and connector replacement

Historical scope: compile the 0.9 candidate against resolved DSH 0.1.7-rc.1 packages and install upstream dsh-codex-connect 0.1.0-alpha.4.46 in the main Web profile. Retire the active connector patch; earlier alpha patch records are historical, not current installation guidance.

Typecheck, full build, packing, main Web installation and git diff --check passed. The Web with the upstream connector generated and displayed a real PNG on the first attempt. This does not establish all image or host combinations. See [Web RC1 validation](../../docs/validation/2026-09-24-rc.md) for observations and limits.

Keep runtime modules resolved from the actual host and preserve CLI symbolic-link identity. Module adapters do not grant permission to patch the Agent Loop or rewrite native session storage. Current supported host baselines are defined in AGENTS.md.
