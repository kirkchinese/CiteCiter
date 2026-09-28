# Prerelease-aware latest updates

The user requested making the RC2-compatible prerelease the default installation. Before changing tags, the published alpha.1 manifest reproduced registry-version-invalid and failed the RPC response schema. Both assumed latest always selected a stable version; stripping the installed prerelease suffix also lost ordering information.

The user selected a separate 0.9.0-alpha.2 release instead of knowingly breaking the update checker in alpha.1. Package-version validation and comparison now live in a pure module using npm semver, accepting only canonical exact versions. Host and RPC checks share it; the legacy stable-only comparator keeps its existing contract. Networking, cache ownership, cancellation, permissions and session behavior are unchanged. latest and next should select alpha.2 while GitHub remains a prerelease; older hosts must pin 0.8.2.

Reproduction and regression use actual published npm manifests and inline checks, not artificial model providers. No temporary test files or credentials belong in Git. Validation and publication results are recorded in docs/validation/2026-09-28-alpha2-update.md.

Publication is complete: npm latest and next select alpha.2 and GitHub remains a prerelease. npm initially accepted the upload with HTTP 202; a duplicate attempt during processing returned E409, then the exact archive became publicly available without another upload or version bump. Public download hashes match the accepted local artifact, and the installed Web RPC reports alpha.2 as both installed and latest with no update available. The maintainer performed the npm operations rejected by automatic approval review; the agent did not route them through another tool.
