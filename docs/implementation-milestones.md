# CiteCiter v0.3 release gates

This guide defines the smallest reproducible gate set for the v0.3 external Host+Client package. Product behavior belongs in the bilingual package README; architecture and ownership decisions belong in ADR 0002. A gate is complete only when it is rerun against the exact candidate tarball.

## Implemented surface

The v0.3 tree contains:

- a committed-`assistant/message` Citation boundary that does not require `turn/end`;
- strict Host validation of the source Session, UTF-16 range, surrounding text, and SHA-256 fingerprint;
- one private standard DSH Session per Topic, with a private numeric navigation index;
- a Topic-scoped Tutor, durable untrusted Citation context, bounded `read_source_session`, read-only sandbox, and optional standard `read` tool;
- Observer as the default and a closed-turn Exact Fork seed as the advanced path;
- DSH title generation, source-model inheritance, independent model selection, multi-turn continuation, stop, rename, archive/restore, and confirmed Host deletion;
- a selection question popover, persistent launcher, resizable learning dock, private Topic rail, and native DSH settings section.

The formal unit suite currently covers citation validation, source evidence formatting and byte limits, reasoning filtering, Topic request/settings schemas, Citation input rendering, strict Typert descriptors, Client event isolation, rich-content safety, and the publish manifest. Runtime persistence and assembled UI behavior are release-smoke responsibilities rather than claims inferred from those unit tests.

## Static and focused checks

Run once from the repository root after the final source edit:

```sh
pnpm run typecheck
pnpm --dir packages/citeciter test
pnpm run build
git diff --check -- \
  docs/architecture/0002-observer-learning-companion.zh.md \
  docs/implementation-milestones.md \
  docs/releases/v0.3.0.md \
  packages/citeciter
```

The build must remove stale declarations and stale hash chunks before emitting the Host entry, Client bundle, both Typert entries, referenced chunks, and declarations under `packages/citeciter/lib/`.

## Candidate tarball

Pack the exact candidate into a disposable directory:

```sh
CITECITER_PACK_DIR="$(mktemp -d /tmp/citeciter-pack.XXXXXX)"
(cd packages/citeciter && npm pack --json --pack-destination "$CITECITER_PACK_DIR")
tar -tf "$CITECITER_PACK_DIR"/kirkchinese-dsh-citeciter-0.3.0.tgz
```

Require `package.json`, `LICENSE`, both package READMEs, `cordis.patch.yml`, the Host and Client entries, both Typert entries, every referenced JavaScript chunk, and declaration files. Reject source files, tests, dev fixtures, scripts, source maps, nested tarballs, screenshots, temporary homes, and credentials.

## Fresh install

Use a new DSH home; never reuse or stop the user's server on port `3080`:

```sh
CITECITER_INSTALL_HOME="$(mktemp -d /tmp/citeciter-install.XXXXXX)"
DSH_HOME="$CITECITER_INSTALL_HOME" \
  dsh plugin --profile web add \
  "$CITECITER_PACK_DIR/kirkchinese-dsh-citeciter-0.3.0.tgz"
DSH_HOME="$CITECITER_INSTALL_HOME" dsh plugin --profile web list --depth 0
```

The profile dependency, lock resolution, and installed manifest must all report `@kirkchinese/dsh-citeciter@0.3.0`. Start this disposable profile on `--port 0`; a clean Host and Client load with no duplicate CiteCiter bundle is required.

## Upgrade from v0.2.1

Create a second disposable home, install `0.2.1`, then add the exact v0.3 tarball through the same `dsh plugin --profile web add` command. Do not perform this gate against the user's real profile.

The upgraded profile must contain one installed CiteCiter `0.3.0` dependency and start successfully. Existing v0.2 child Sessions remain ordinary DSH Sessions; v0.3 neither rewrites nor imports them. New Topics must use `$DSH_HOME/citeciter/`, and the ordinary source logs must remain readable and unchanged.

## Keyless assembled Web smoke

Seed the open-turn fixture in the disposable home, then start a separate DSH process with the deterministic fixture provider and a dynamically assigned port:

```sh
node packages/citeciter/dev/seed-smoke-session.mjs \
  "$CITECITER_INSTALL_HOME" "$(pwd)"
mkdir -p "$CITECITER_INSTALL_HOME/profiles/node_modules/@kirkchinese"
ln -s "$(pwd)/packages/citeciter" \
  "$CITECITER_INSTALL_HOME/profiles/node_modules/@kirkchinese/dsh-citeciter"
DSH_HOME="$CITECITER_INSTALL_HOME" DSH_TELEMETRY_DISABLED=1 \
  dsh --profile web \
  --patch "$(pwd)/packages/citeciter/dev/fixture.patch.yml" --port 0
```

Use the printed URL in another terminal:

```sh
node packages/citeciter/dev/smoke.mjs \
  "<printed-url>" CiteCiter \
  "$CITECITER_INSTALL_HOME/citeciter-smoke.json" \
  "/tmp/citeciter-v03-smoke.png"
```

The smoke must prove all of the following:

- a committed assistant model call is cited while its enclosing source turn remains open;
- the native context menu is suppressed and Observer is the default;
- the first Topic calls `read_source_session`, streams the deterministic answer, and receives the DSH-generated title;
- the dock reserves a usable third column while the source programming conversation remains visible;
- rename, close, launcher, full-page reload, Topic recovery, and a genuine second question work;
- the same source model call can create a second independent Topic;
- archive removes the Topic from the default rail and it remains available for restore;
- no Topic title appears in the ordinary DSH Session tree;
- the source log size and nanosecond mtime remain unchanged;
- no page or console error occurs.

The screenshot is diagnostic output and must stay under `/tmp`; it is not a repository artifact.

## Visual browser check

After the automated smoke, inspect the same disposable process with the in-app browser skill. Verify the real DSH programming shell at desktop and narrow widths: source selection and popover placement, left navigation plus central coding conversation retention, dock resizing and fallback overlay, Topic switching and follow-up composition, settings controls, focus labels, and visible error states. Stop only the disposable DSH process created for this gate.

## Release decision

Do not publish when any static, package, fresh-install, upgrade, assembled-smoke, or visual gate is missing or failing. Record the exact commands and candidate version in the release handoff; do not convert a planned gate into a passed claim.
