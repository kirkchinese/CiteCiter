# Agent Note: Historical DSH Web version range

Date: 2026-08-22. This records the 0.4 release's Web compatibility decision, not the current supported range.

CiteCiter 0.3.2 was limited to DSH 0.1.0-rc.7. Web users on the 0.1.1 prerelease line were rejected by the old peer range. The inspected Host and Client contracts supported moving to >=0.1.1-rc.1 <0.1.1-rc.3, with rc.2 pinned for development.

The compatibility matrix checked rc.1 / Node 24 and rc.2 / Node 22.19. Source metadata and Session formats remained unchanged. An unbounded peer range was rejected because future API compatibility had no evidence.

Continue to use the public Host and Web Client services. Validate the installed artifact rather than assuming the moving master branch matches it. A passing package matrix does not establish interactive acceptance on another host or operating system.
