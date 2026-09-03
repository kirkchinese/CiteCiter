# Agent Note: Web update notices

Status: implemented

## Problem

CiteCiter releases require users to notice a new npm version, run the profile plugin command, and restart DSH Web. DSH 0.1.1-rc.2 exposes no authenticated runtime package-update API, active Profile identity, restart supervisor, or hot activation for a changed bundle. Giving the ordinary browser Remote permission to run `dsh plugin` would mutate an unidentified Profile from an unauthenticated transport and could leave the running Host on code that differs from disk.

## Decision

The Host performs a bounded, read-only check against the fixed npm `latest` endpoint for `@kirkchinese/dsh-citeciter`. It reads the installed package manifest, accepts stable `MAJOR.MINOR.PATCH` versions only, rejects malformed or prerelease values, and reports whether the registry version is newer. The check has a fixed timeout and response-size limit, sends no credentials, coalesces concurrent checks, releases rejected response bodies, caches successful results, and returns stable failure codes without registry content.

The update operation is a separate Typert Remote method rather than a Topic command. It creates no Session event, enters no Topic runtime, and never installs a package, exits the application, or claims that a version is active. The Web client checks after its settings become available and checks again when the page becomes visible after the daily interval. Automatic failures remain out of the global UI and reach only diagnostics.

An available version renders as a non-modal `shell.overlay` card with exactly three initial actions. `更新` exposes and attempts to copy the standard Web Profile command, then says that the command must run in a terminal and DSH Web must restart. `下次一定` suppresses that version for the current tab session. `不再提示` disables all update notices in CiteCiter settings; a browser that cannot access Host settings uses origin-scoped browser storage. The CiteCiter settings page owns the control that enables notices again.

## Alternatives considered

**Install and restart from the CiteCiter Remote.** DSH rc.2 does not publish the active Profile name or a privileged authenticated update service, and its launcher has no restart supervisor. A package updating itself inside the live Host also leaves loaded code and installed files at different versions. CiteCiter therefore keeps the Remote read-only.

**Treat GitHub Releases as a second version authority.** npm `latest` already identifies the version that `dsh plugin` can install. A second mutable source can lead or lag npm without improving the update decision, so the notification uses one authority and renders no remote release HTML.

**Use a transient Toast or a modal.** The three actions require persistent interaction, while an update is not urgent enough to block the workspace. The frame-wide overlay provides a stable notification without changing conversation, details, or Topic layout.

**Persist “下次一定” as a time-based preference.** The phrase means the next browser session here. Per-version session storage survives a reload without turning a temporary dismissal into a multi-day policy.

## Consequences

Users receive a low-interruption Web notice and a copyable exact package version without granting the plugin package-management authority. The default command names the standard `web` Profile; users of a custom Web Profile replace that name before running it. The notice compares package versions rather than asserting DSH compatibility, so users check the newer release's host requirement before installing. A successful manual install takes effect only after DSH Web restarts.

The release that first contains this checker cannot notify installations that still run an older build without it. Those users require one manual upgrade; later stable npm releases can be discovered by the included checker. Desktop installation and supervision remain outside this decision.
