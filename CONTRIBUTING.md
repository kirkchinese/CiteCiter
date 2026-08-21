# Contributing to CiteCiter

[简体中文](CONTRIBUTING.zh.md)

Thank you for helping improve CiteCiter. Bug reports, focused fixes, tests, and user-facing improvements are welcome.

## Before you start

- Use Node.js `^22.19.0 || >=24.0.0` and the pnpm version declared in `package.json`.
- Develop against DSH Web `>=0.1.0-rc.7 <0.1.0-rc.8`.
- Keep CiteCiter external to DSH. Use supported plugin services and events; do not patch DSH core or replace its Agent Loop.
- Open an issue before a large behavioral or architectural change so the scope can be agreed first.

## Set up the repository

```sh
git clone https://github.com/kirkchinese/CiteCiter.git
cd CiteCiter
pnpm install
```

The publishable package lives in `packages/citeciter/`. Its generated `lib/` output is tracked and must be rebuilt after source or build-configuration changes.

## Check your changes

Run the smallest relevant checks. Before opening a pull request that changes package behavior, run:

```sh
pnpm run typecheck
pnpm --dir packages/citeciter test
pnpm run build
git diff --check
```

Browser changes must also be exercised in a disposable `DSH_HOME` on a separate or dynamically assigned port. Never stop or reuse another person's running DSH process.

## Documentation

- Keep `README.md` and `README.zh.md` synchronized and focused on users.
- Keep package READMEs synchronized with the root READMEs and the published version.
- Public update history belongs in `docs/releases/`.
- Do not commit product interviews, design drafts, internal decision records, test reports, local screenshots, or other development-process documents.
- Do not link README files to internal files under `docs/`.

## Pull requests

- Keep each pull request focused on one change.
- Explain the user-visible problem and the resulting behavior.
- Add the smallest test that would fail without the change.
- Do not commit credentials, `.npmrc`, `.env`, temporary DSH homes, generated Sessions, screenshots, or package tarballs.
- Confirm that source Sessions remain unchanged when the change affects CiteCiter Topics.

By contributing, you agree that your contribution is licensed under the [MIT License](LICENSE).
