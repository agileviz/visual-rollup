# CLAUDE.md — Visual Rollup

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Project overview

**Visual Rollup** is an Azure DevOps dashboard widget that renders stacked horizontal bar charts of child work-item state counts grouped by parent work item, driven by a user-configured shared query. Published to the Visual Studio Marketplace as **`AgileViz.VisualRollup`**.

Pure TypeScript + DOM — no React, no chart library, no `azure-devops-ui` component imports in the widget bundles. The chart is built from HTML `<div>` flex containers with percentage widths. This is a deliberate choice for tiny bundle sizes and zero framework lock-in inside the ADO iframe.

## Commands

```bash
npm install                    # one-time dependency install
npm test                       # Jest with coverage
npm run test-watch             # Jest --watchAll with coverage
npm run lint                   # ESLint over src/**/*.{ts,tsx}
npm run serve                  # webpack-dev-server on https://localhost:3000 (install the dev VSIX in ADO to test)
npm run build                  # production webpack + tfx VSIX package
npm run build:dev              # dev VSIX (side-by-side install during development)
npm run publish-extension      # publish to ADO Marketplace (needs $ADO_PUBLISH_TOKEN)
npm run publish-extension-dev  # publish the private dev extension
```

Build artifacts (`dist/`, `*.vsix`, `coverage/`) are gitignored. `tfx --rev-version` bumps the version on each publish; `npm run sync-version` (called from `postbuild` via `package.json`) keeps `extension.json` and `package.json` in lockstep.

## Repository layout

```
src/
├── Contribs/
│   ├── Config/   # Widget configuration pane (Config.html / Config.tsx / Config.scss / Config.json)
│   └── Widget/   # Dashboard widget itself (Widget.html / Widget.tsx / Widget.scss / Widget.json)
├── ContribsDev/  # DEV-only contributions used by the dev extension
└── Library/      # Shared pure-ish modules — adoLibrary, queryLibrary, queryResultsLibrary, widgetSettings
```

Each contribution is an AMD entry point. The `*.json` files in `src/Contribs/*/` are the per-contribution manifest fragments — they're glob-matched by `tfx extension create` against the top-level `extension.json` to produce the VSIX.

## Architecture

Data flow inside the widget: load settings → resolve project/team via SDK → fetch the chosen shared query's tree of work items → flatten into parent/child rows → render stacked bars by state category, sized by Effort / Story Points / count.

Key files in `src/Library/`:

- **`adoLibrary.ts`** — thin wrappers over `azure-devops-extension-api/*` clients (`WorkItemTrackingRestClient`, `IProjectPageService`). Each entrypoint stands alone (no implicit ordering contract — every function calls `ensureProject()` itself).
- **`queryLibrary.ts`** — query-tree discovery. Top-level call uses `getQueries({ depth: 1 })` (NOT depth=2; see "ADO platform quirks" below) and then walks subtrees in parallel with per-folder error isolation so one failed `getQueryItem` doesn't reject the whole `Promise.all`. Console-time logging is kept for ongoing perf characterization.
- **`queryResultsLibrary.ts`** — runs the chosen query, normalizes flat vs. tree results, builds the parent/child enrichment used by the widget. Includes `buildLegendData()` (unique state categories + colors across rows; first-encountered color wins when multi-WIT queries disagree). Visited-set guard in `getAllDescendants` defends against malformed-link DAG cycles.
- **`widgetSettings.ts`** — `sanitizeSettings()` is the persistence-boundary validator: handles missing/invalid/adversarial inputs (older schemas, manual REST edits of dashboard JSON, partial migrations). Out-of-range values fall back to `DEFAULT_SETTINGS` rather than clamping — a saved-100 is more likely a corrupted value than user intent.

Key files in `src/Contribs/`:

- **`Widget/Widget.tsx`** — render loop. Uses a `fetchSeq` monotonic token to guard against rapid config changes letting a slow fetch clobber a newer one (capture id before `await`, only commit state if it still matches). `esc()` escapes `<>&"'` for HTML interpolation; `safeColor()` validates `/^#[0-9a-fA-F]{3,8}$/` before interpolating into `style` attributes (closes the latent XSS vector where ADO-supplied stateColor could break out of `style="background:..."`).
- **`Config/Config.tsx`** — config pane. `flush()` uses live `this.state.queryId` for the `selected` flag, not a captured snapshot, so dropdown re-renders during streaming don't lose the user's pending selection.

## Testing — AMD stub pattern (important)

`azure-devops-extension-sdk` and `azure-devops-extension-api/*` are **AMD-only** (top-level `define(...)`) and crash under Jest's Node runtime. The workaround is an empty stub mapped in via `jest.config.js`:

```js
// jest.config.js
moduleNameMapper: {
  '^azure-devops-extension-sdk$': '<rootDir>/src/Library/__mocks__/ado-sdk-stub.ts',
  '^azure-devops-extension-api(/.*)?$': '<rootDir>/src/Library/__mocks__/ado-sdk-stub.ts',
}
```

The stub re-exports empty placeholders so imports stay quiet. Per-file coverage thresholds live in `jest.config.js` — they're a regression gate, not a target. When you add tests, raise the floor; don't lower it.

## ADO platform quirks that affect this plugin

- **`getQueries` / `getQuery` `$depth` caps at 2.** Server returns HTTP 400 above 2. Also, `depth=2` on the root call is a **perf regression** vs. `depth=1` because the implicit subtree fetches inside the server response are not parallelized — they're sequential. Use `depth=1` and walk subtrees yourself in parallel.
- **Native config translation.** Plugins should honor ADO-native widget config: area paths with `includeChildren`, iteration paths, work-item types, backlog levels — not invent parallel config knobs. VR's "tree query display level" setting is the only non-native knob because tree-query display has no ADO-native equivalent.
- **AMD modules everywhere.** See AMD-stub pattern above. Same trap will bite any new test file that imports SDK or API modules.
- **Dev-server PNA header.** Chrome blocks loopback iframes loaded into ADO unless the dev server sets `Access-Control-Allow-Private-Network: true`. Already wired in `webpack.config.js` — don't strip it.
- **Contribution IDs use dots, not slashes.** `extension.json` and per-contribution manifests are sensitive to this; slash form silently fails to register.
- **Manifest visibility has two axes.** `galleryFlags` controls maturity (Preview / Trusted), and top-level `"public": true` controls discoverability in marketplace search. Both need to be right at publish time.
- **`SDK.resize()` behaves differently per host** (widget vs. config drawer vs. dialog vs. panel). Combine it with a `ResizeObserver` on the widget root for reliable iframe-height sync.
- **Native `<select>` ignores CSS borders without `appearance: none` + a custom SVG chevron.** Config pane uses this pattern.
- **`IExtensionDataManager.getValue()` is cached** and `deleteDocument()` does NOT bust the cache. To reset, write `DEFAULT` via `setValue` then `deleteDocument`.

## Defensive coding rules

- **Don't embed HTTP response body text into `throw new Error()`.** SonarCloud S5696 (stored XSS via DOM render path) flags it. Also don't fall back to `console.error(body)` — S5145 (log injection) flags that too. Drop the body; the status code in the throw is sufficient. Size-bounding (`body.slice(0, 300)`) is the wrong defense shape for XSS.
- **Validate values against an expected pattern before interpolating into `style="..."`.** CSS grammar breakouts are real; quote-escape alone doesn't help. `safeColor()` is the local pattern.
- **Streaming UIs: read live state INSIDE the render closure**, not a snapshot captured at function entry. The dropdown bug fix is the canonical example.

## Quality Gate workflow

SonarCloud is configured at `sonarcloud.io/project/overview?id=agileviz_visual-rollup`. The Quality Gate badge in `README.md` reflects the current `main` scan.

When publishing a new version:

1. Land the change on `main`, wait for SonarCloud rescan, verify all four ratings (Security / Security Review / Reliability / Maintainability) stay A and Quality Gate is **Passed**.
2. Only then `npm run publish-extension`. The 10-minute wait beats the 30-minute re-publish cycle if a finding shows up post-publish.
3. SonarCloud's **first scan on a fresh repo** can show "Quality Gate Not computed" because there's no baseline. A second small commit triggers the computation.

## Product stance

This plugin has **no roadmap**. It does one thing well: parent-rollup of child-work-item state. Feature requests get honest pushback if they expand scope.

For bugs or feature requests, open a [GitHub issue](https://github.com/agileviz/visual-rollup/issues) using the appropriate template. Security issues: see `SECURITY.md`.
