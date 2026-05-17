# Visual Rollup

Azure DevOps dashboard widget that visualizes progress on parent work items based on the states, counts, and sizes of their child work items. Driven by a shared query you already have — full control over what shows up.

![Visual Rollup widget showing stacked progress bars per parent work item (light mode).](static/visual-rollup.png)

- **Any shared query** — flat lists, direct-link queries, or tree queries; you pick the work items, the widget rolls them up.
- **Tree query display level** — for hierarchical queries, choose which level becomes the parent row: Epics with Features rolling up, or Features with PBIs rolling up.
- **Sized by Effort, Story Points, or item count** — bars work whether your team estimates or not. Mixed-sized backlogs degrade gracefully to sized-sibling averages.
- **Custom process templates** — bar colors match the state colors configured by your template, not generic defaults. Any work item type your template defines is supported.
- **`done / total` label inside every bar** — see at-a-glance how many children are completed without hovering or clicking.
- **Theme-aware** — light and dark modes track your Azure DevOps theme; no per-widget setting needed.

![Visual Rollup widget in Azure DevOps dark mode.](static/visual-rollup-dark.png)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=agileviz_visual-rollup&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=agileviz_visual-rollup)

## Install

Install from the Azure DevOps Marketplace:

**[marketplace.visualstudio.com — AgileViz.VisualRollup ↗](https://marketplace.visualstudio.com/items?itemName=AgileViz.VisualRollup)**

After installation, add the widget to any team dashboard and select a shared query.

## Documentation and support

Full documentation, configuration guide, and screenshots:
**[agileviz.com/plugins/visual-rollup/ ↗](https://agileviz.com/plugins/visual-rollup/)**

For bugs or feature requests, [open a GitHub issue](https://github.com/agileviz/visual-rollup/issues) using the appropriate template.

## About this source

This repository contains the source for the Visual Rollup VSIX published to the Marketplace by AgileViz, LLC. It's open source — MIT licensed — so customers and contributors can audit, fork, or contribute.

A few notes worth knowing if you're reading or contributing:

- The widget and configuration pane are **pure TypeScript + DOM manipulation** — no React, no chart library. The chart is built from HTML `<div>` flex containers with percentage widths. This is a deliberate choice for tiny bundle sizes and zero framework lock-in inside the Azure DevOps iframe.
- Styling uses SCSS variables from `azure-devops-ui/Core/core.scss` so light/dark mode tracks the Azure DevOps theme automatically — don't reach for `@media (prefers-color-scheme: dark)`, which follows the OS rather than ADO.
- Build output (`dist/`, `*.vsix`) and `node_modules/` are gitignored. The shipped VSIX is produced by `npm run build`.

The main source entry points live under [`src/Contribs/Widget/`](src/Contribs/Widget/) (the rendered widget) and [`src/Contribs/Config/`](src/Contribs/Config/) (the configuration pane). Shared code lives under [`src/Library/`](src/Library/).

## Building from source

```bash
npm install              # first-time install
npm test                 # Jest with coverage
npm run lint             # ESLint on src/**/*.{ts,tsx}
npm run build            # clean + production webpack build → .vsix at repo root
```

Testing changes against a real Azure DevOps organization requires installing a dev VSIX side-by-side with the production extension. The dev manifest has a different `id` and a `baseUri` pointing at `https://localhost:3000`, so a local webpack-dev-server can serve the bundle to a dev ADO org without rebuilding the VSIX between changes:

```bash
npm run build:dev        # produce a dev VSIX (separate id from production)
npm run serve            # webpack-dev-server on https://localhost:3000
```

Install the dev VSIX into an ADO org you control, then iterate against `npm run serve`.

## License, contributing, security

- **[LICENSE](LICENSE)** — MIT, with a Trademark Notice for "AgileViz" and AgileViz product names.
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — contribution guidelines.
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** — Contributor Covenant v2.1.
- **[SECURITY.md](SECURITY.md)** — responsible disclosure process. Source-code reports route through GitHub Security Advisories; hosted-service reports go through the bug bounty at [agileviz.com/security/](https://agileviz.com/security/).

---

Visual Rollup is created by **AgileViz**. The plugins each do one thing well — simplicity is a feature, not an oversight.
