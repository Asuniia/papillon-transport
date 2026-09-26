# Contributing

## Setup

Node 22 (see `.nvmrc`) and pnpm (version pinned in `package.json`):

```bash
pnpm install
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm check` / `pnpm check:fix` | Biome: formatting, lint and import order |
| `pnpm build` | ESM + CJS + types into `dist/` |
| `pnpm check:types` | Are The Types Wrong on the packed tarball |
| `pnpm check:publish` | publint |
| `pnpm knip` | Unused files, exports and dependencies |

## Rules

- No comments in the code.
- No runtime dependency. Do not use `URL`, `URLSearchParams`, `AbortSignal.any` or
  `AbortSignal.timeout` in `src/` (incomplete in React Native).
- Everything MOTIS-specific stays in `src/providers/motis/`.

## Releases

Releases go through [changesets](https://github.com/changesets/changesets). Add one with every
user-facing change:

```bash
pnpm changeset
```

On `main`, the release workflow opens a "version packages" pull request; merging it publishes to
npm.
