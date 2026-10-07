# Normalize bundles before their first disk write

Date: 2026-10-07. Candidate: CiteCiter 0.9.0-alpha.4. This is a build lifecycle repair, not a change to the Host Agent Loop or runtime permissions.

The complete build twice failed in postbuild:bundle when normalize-bundle.mjs reopened lib/client.js with writeFile. Node reported UNKNOWN / errno -4094 on open. The same normalization succeeded when invoked independently later. Two minimal repeated bundle loops reproduced the failure on iterations 3 and 9. Immediately after one failure, an ordinary write-capable FileMode.Open succeeded, while FileMode.Truncate failed with Windows error 1224: a user-mapped region prevented truncation. The artifact was not read-only; this evidence does not identify the process that mapped it and does not justify attributing the issue to an antivirus product.

The previous workflow generated every output, then reopened final JavaScript files to strip trailing whitespace. The fix performs the same normalization in a generateBundle hook before the bundler's initial write, shared by Host and Client configurations. The redundant postbuild lifecycle and normalize-bundle.mjs are removed. There are no added sleeps, retries, system setting changes or ignored build errors.

The new bundle path completed 20 consecutive runs. Its six JavaScript output files matched the hashes produced by the old successful normalization, and all were free of trailing whitespace. The build configuration passed a strict type check. The final root build, package prepack build and git diff --check subsequently completed successfully. Temporary checks were inline; no test script or artificial model provider was retained. Native runtime acceptance remains separately recorded in docs/validation/2026-10-07-official-desktop.md.
