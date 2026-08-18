# CiteCiter v0.2 verification

This guide records reproducible checks for the current external Host+Client package. Product behavior belongs in `packages/citeciter/README.md` and `README.zh.md`; authority/lifecycle decisions belong in ADR 0001 and the implemented lifecycle note.

## Focused checks

From the repository root:

```sh
pnpm install
pnpm run typecheck
pnpm --dir packages/citeciter test
pnpm run build
```

The current focused suite covers:

- exact completed-node resolution and `anchorSeq` fork input;
- custom first questions and independent follow-up user turns;
- matched admission plus durable read-only `command/done`/preset settlement and current sandbox fold before Host preparation;
- Host lineage, completed-turn, exact UTF-16 span, and canonical fingerprint validation;
- distinct selection identity inside one assistant answer;
- durable projection recovery without a second fork;
- child-only transcript boundaries;
- rename, workspace archive filtering, and parent noninterference;
- disposal during an in-flight fork;
- Citation Context adversarial-text round trips and immutable first projection;
- strict Agent-scoped Host/Client Typert descriptors;
- safe SVG, network-free HTML, and incomplete/unsafe rich-fence fallback;
- publish manifest, Host/Client exports, and peer declarations.

`pnpm run build` compiles tracked `lib/types`, removes stale top-level bundle chunks, and emits:

- `lib/index.js` — Host package entry;
- `lib/typert.host.js` — strict Host contribution;
- `lib/typert.remote-client.js` — Client Remote contribution;
- `lib/client.js` — bundled browser face.

## Model-input comparison

The reproducible experiment is in `experiments/model-input-layering/`. It uses six synthetic cases with the same model and history boundary across:

- A: one combined user prompt;
- B: Citation injection plus genuine user question;
- C: scoped system Tutor plus persistent Citation Context plus genuine user question.

Canonical runs used `deepseek-official/deepseek-v4-pro`, answer reasoning `max`, and judge reasoning `low`. Aggregate scores were A `137/144`, B `136/144`, and C `138/144`; C led evidence discipline (`23`) and follow-up consistency (`24`). See `experiments/model-input-layering/README.md` and the accepted [`architecture/0001-model-input-layering.md`](architecture/0001-model-input-layering.md). The sanitized fixture SHA-256 is `3b3d9975e5d06d66c30efb474b11720d78dcba116d75f6453a02bc4d323e292a`.

## Disposable browser smoke

Install Chromium once, link the built package into a disposable DSH home, seed a settled source conversation, and start a separate Web instance:

```sh
pnpm --filter @kirkchinese/dsh-citeciter exec playwright install chromium
rm -rf /tmp/citeciter-dsh-home
mkdir -p /tmp/citeciter-dsh-home/profiles/node_modules/@kirkchinese
ln -sfn "$(pwd)/packages/citeciter" \
  /tmp/citeciter-dsh-home/profiles/node_modules/@kirkchinese/dsh-citeciter
node packages/citeciter/dev/seed-smoke-session.mjs \
  /tmp/citeciter-dsh-home "$(pwd)"
DSH_HOME=/tmp/citeciter-dsh-home dsh --profile web \
  --patch "$(pwd)/packages/citeciter/dev/patch.yml" --port 3907
```

In another terminal:

```sh
node packages/citeciter/dev/smoke.mjs \
  http://127.0.0.1:3907 CiteCiter \
  /tmp/citeciter-dsh-home/citeciter-smoke.json
```

The seed's rendered assistant key is `14:assistant-step1:1`; its real `anchorSeq` is `6`. The v0.2 smoke exits non-zero unless it verifies all of the following:

- exact text selection and native context-menu suppression;
- the custom first-question composer and quick questions;
- a genuine question persisted in a forked read-only Thread;
- a projected history picker and persistent launcher;
- rename, close/reopen, full-page reload recovery, and a usable settled panel width;
- a second range becoming a distinct Thread, bidirectional switching, workspace archive, and active-list filtering;
- no parent-log size or nanosecond-mtime change;
- no page or console error.

A disposable profile without provider credentials is intentional: the model turn reaches the normal provider error only after fork, a successful durable read-only command lifecycle, strict Remote preparation, persistent context, and the genuine user message have succeeded. With the fixture used for the v0.2 release check, the child header had `seedLength: 12`, the Citation snapshot appeared at seq `22`, and its envelope preserved `historyStartSeq: 12`, anchor seq `6`, exact UTF-16 range `4..28`, and a 64-character SHA-256 fingerprint. The source log revision stayed byte-for-byte and mtime-for-mtime unchanged. A fresh process recovered the renamed Thread from projection state; a second Citation was switched to and archived through the workspace archive API, after which a restart exposed only the remaining active Thread.

## Live development and HMR

`pnpm --filter @kirkchinese/dsh-citeciter dev` watches this package's declaration output and browser bundle. A running Web profile must already have its Client HMR receiver and Host file watcher active. Verify that condition before expecting automatic replacement:

```sh
node packages/citeciter/dev/hmr-smoke.mjs http://127.0.0.1:3907
```

The HMR smoke atomically changes and restores `lib/client.js`; it passes only after observing the rebuild frame, old-fiber unmount, one working replacement menu, and no browser error. Merely rebuilding the external bundle does not update an already-running Web process whose watcher is inactive. When changing DSH's own Client packages or Web shell, run `pnpm run dev:web` from the same DSH checkout; starting an unrelated Vite server does not update the DSH Web GUI.

## Publish checks

Before tagging:

```sh
git diff --check
pnpm run typecheck
pnpm --dir packages/citeciter test
pnpm run build
(cd packages/citeciter && npm pack --dry-run)
(cd packages/citeciter && npm pack)
```

Inspect the tarball and require the root entry, Client bundle, both Typert exports, all referenced hash chunks, declaration files, patch, license, and bilingual package READMEs. Reject credentials, temporary homes, screenshots, source maps not intentionally published, or stale hash chunks.
