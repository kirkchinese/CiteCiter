# Agent Note: Current DSH line and Desktop source-shell support

Status: implemented

## Problem

CiteCiter 0.3.2 was intentionally limited to DSH `0.1.0-rc.7`. Current DSH Web users and dataelement DSH Desktop users run the newer `0.1.1` prerelease line, so the old peer range prevented installation even though CiteCiter uses the same official Host and Web Client services on both hosts.

## Decision

CiteCiter 0.4.x supports DSH `>=0.1.1-rc.1 <0.1.1-rc.3`. Development dependencies stay fixed to rc.2, while CI verifies rc.1 with Node 24 and rc.2 with Node 22.19 before packing the plugin.

Desktop support uses the existing `dsh.client.platform: web` bundle inside dataelement's official-Web development shell. CiteCiter does not import Electron APIs, Desktop-private services, or a separate adapter. The supported Desktop statement is limited to the Linux source development shell and its pinned rc.1 Web profile; packaged macOS and Windows installers remain unverified.

The compatibility change does not alter the Remote API, Topic metadata, private Session logs, settings fields, or permission model. DSH rc.7 users stay on CiteCiter 0.3.2 rather than receiving an untested combined prerelease range.

## Alternatives considered

**Declare a broad prerelease range without a matrix.** This makes installation appear easier but can admit incompatible DSH API releases without executable evidence.

**Create a Desktop-specific adapter.** The target Desktop already embeds the official Web application, so an adapter would duplicate the existing Client and introduce host-specific dependencies without adding user-visible behavior.

**Support rc.7 and rc.1/rc.2 in one release.** This would preserve one version line but would require compatibility branches across fast-moving prerelease APIs. Keeping 0.3.2 for rc.7 provides a smaller and verifiable support policy.

## Consequences

Each 0.4.x release must keep both compatibility lanes passing. A later DSH prerelease is unsupported until its exact API line passes the same package, install, and browser checks and the peer range is updated deliberately.

Desktop documentation must name dataelement and the tested source-shell environment. It must not imply verification of other projects named DSH Desktop or packaged operating-system installers.
