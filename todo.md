# Todo

## In progress

- [ ] Push commit `e9ea4e3` to `origin/main`
  - local commit is done (39 files, prerequisites section + settings + credits)
  - blocked: no SSH key and `GH_TOKEN` is invalid — export a valid token or add an SSH key

## Cleanup

- [ ] Add `.pnpm-store/` to `.gitignore`
  - created by `vp install` (pnpm v11 store dir); should not be tracked

## Verification

- [ ] Run full quality gate: `vp run ready` (check → validate → build → test)
  - notable: `vp install` was rerun on Linux after a macOS-only install
  - validate needs ziglings sources if not present
