import "./Widget.scss";
import * as SDK from "azure-devops-extension-sdk";
import * as Dashboard from "azure-devops-extension-api/Dashboard";
import { getWorkItemsByQueryID, workItemHierachyEntry, workItemsByStateCategoryProposedFirst,
         workItemsByStateCategoryCompletedFirst, workItemsByStateCategoryInProgressFirst,
         workItemsByPriority, buildLegendData } from "../../Library/queryResultsLibrary";
import { getOrgAndProject } from "../../Library/adoLibrary";
import { widgetCustomSettings, sanitizeSettings } from "../../Library/widgetSettings";

interface WidgetState {
    title: string;
    size: { columnSpan: number; rowSpan: number };
    contact: string;
    queryId: string;
    queryText: string;
    queryIdPrevious: string;
    queryResults: Array<workItemHierachyEntry>;
    sort: { text: string; id: string };
    treeLevel: number;
    orgName: string;
    projectName: string;
    // Rendering mode. "loading" while fetching; "error" on fetch failure;
    // otherwise the normal unconfigured / empty / chart paths apply.
    loading: boolean;
    error: string;
}

class VisualQueryWidget implements Dashboard.IConfigurableWidget {

    private state: WidgetState = {
        title: "Visual Rollup",
        size: { columnSpan: 4, rowSpan: 2 },
        contact: "None",
        queryId: "",
        queryText: "",
        treeLevel: 1,
        orgName: "",
        projectName: "",
        queryIdPrevious: "N/A",
        queryResults: [],
        sort: { text: "Priority", id: "0" },
        loading: false,
        error: ""
    };

    private root: HTMLElement;

    // Monotonic counter incremented on every processSettings entry. Each
    // in-flight fetch captures its own id and verifies it's still the latest
    // before committing the result. Without this, a slow fetch for query A
    // can resolve AFTER a fast fetch for query B and clobber B's data with
    // A's stale results — visible to users as "I picked the right query but
    // it shows the previous query's items." Pattern carried over from
    // Throughput's Widget.tsx::processSettings.
    private fetchSeq: number = 0;

    constructor() {
        this.root = document.getElementById("root")!;
        this.root.addEventListener("click", e => {
            const row = (e.target as Element).closest<HTMLElement>("[data-url]");
            if (row?.dataset.url) window.open(row.dataset.url, "_blank");
        });
    }

    public setOrgAndProject(orgName: string, projectName: string): void {
        this.state.orgName = orgName;
        this.state.projectName = projectName;
        if (this.state.queryResults.length > 0) this.render();
    }

    private async processSettings(widgetSettings: Dashboard.WidgetSettings): Promise<void> {
        // Parse + sanitize at the persistence boundary. sanitizeSettings
        // tolerates missing/invalid/adversarial fields and returns a fully-
        // populated object with safe defaults. Distinguish "fresh install"
        // (data = "" or unparseable) from "configured but empty queryId"
        // because they render differently downstream.
        let parsed: unknown = null;
        let parseFailed = false;
        try {
            parsed = JSON.parse(widgetSettings.customSettings.data);
        } catch {
            parseFailed = true; // fresh install: data is "" — render unconfigured
        }

        // Fresh install (no saved data): render the unconfigured state.
        if (parseFailed || parsed == null) {
            Object.assign(this.state, {
                title: widgetSettings.name, size: widgetSettings.size,
                contact: this.state.contact, sort: this.state.sort, treeLevel: 1,
                queryId: "N/C"
            });
            this.render();
            return;
        }

        const settings = sanitizeSettings(parsed);
        const { queryId, queryText, contact, sort, treeLevel } = settings;

        // Configured-but-no-query state ("N/C" sentinel kept for compatibility
        // with the existing buildHTML branch that watches queryIdPrevious).
        if (!queryId) {
            Object.assign(this.state, {
                title: widgetSettings.name, size: widgetSettings.size,
                contact, sort, treeLevel, queryId: "N/C"
            });
            this.render();
            return;
        }

        if (queryId !== this.state.queryIdPrevious || treeLevel !== this.state.treeLevel) {
            Object.assign(this.state, {
                title: widgetSettings.name, size: widgetSettings.size, contact, sort, treeLevel,
                queryId, queryText,
                queryIdPrevious: queryId, queryResults: [],
                loading: true, error: ""
            });
            this.render();

            // Race guard: capture this fetch's id BEFORE the await; only
            // commit results if no newer processSettings has bumped the seq.
            const myFetchId = ++this.fetchSeq;
            try {
                const queryResults = await getWorkItemsByQueryID(queryId, treeLevel);
                if (myFetchId !== this.fetchSeq) return;
                this.state.queryResults = this.sortResults(queryResults, sort.id);
                this.state.loading = false;
                this.state.error = "";
            } catch (err) {
                if (myFetchId !== this.fetchSeq) return;
                console.error("Visual Rollup: failed to load work items", err);
                this.state.queryResults = [];
                this.state.loading = false;
                // Message is deliberately generic — ADO error messages vary and are
                // rarely useful to end users. Pointing to the support page is.
                this.state.error = "Couldn't load work items. Check that the query is accessible and try again.";
            }
            this.render();
        } else {
            Object.assign(this.state, {
                title: widgetSettings.name, size: widgetSettings.size, contact, sort, treeLevel,
                queryId, queryText,
                queryResults: this.sortResults(this.state.queryResults, sort.id)
            });
            this.render();
        }
    }

    private sortResults(results: Array<workItemHierachyEntry>, sortId: string): Array<workItemHierachyEntry> {
        const sorted = [...results];
        if (sortId === "1") return sorted.sort(workItemsByStateCategoryProposedFirst);
        if (sortId === "2") return sorted.sort(workItemsByStateCategoryInProgressFirst);
        if (sortId === "3") return sorted.sort(workItemsByStateCategoryCompletedFirst);
        return sorted.sort(workItemsByPriority);
    }

    public async preload(s: Dashboard.WidgetSettings) {
        await this.processSettings(s);
        return Dashboard.WidgetStatusHelper.Success();
    }

    public async load(s: Dashboard.WidgetSettings) {
        await this.processSettings(s);
        return Dashboard.WidgetStatusHelper.Success();
    }

    public async reload(s: Dashboard.WidgetSettings) {
        await this.processSettings(s);
        return Dashboard.WidgetStatusHelper.Success();
    }

    private render(): void {
        this.root.innerHTML = this.buildHTML();
        // After layout, any bar label that's wider than its bar is moved outside,
        // past the bar's right edge, where there's plenty of space on the track.
        requestAnimationFrame(() => this.adjustBarLabels());
    }

    private adjustBarLabels(): void {
        this.root.querySelectorAll<HTMLElement>(".vqw-row").forEach(row => {
            const bar = row.querySelector<HTMLElement>(".vqw-bar");
            const inside = row.querySelector<HTMLElement>(".vqw-bar-label-inside");
            if (!bar || !inside) return;
            if (inside.scrollWidth > bar.clientWidth - 8) {
                row.classList.add("label-outside");
            }
        });
    }

    private buildHTML(): string {
        const { title, queryIdPrevious, queryResults, loading, error } = this.state;

        let html = `<div class="vqw-widget"><h2 class="vqw-title">${this.esc(title)}</h2>`;

        if (queryIdPrevious === "N/A") {
            html += `<div class="vqw-centered-state">
                <img alt="Visual Rollup" src="../../static/icon.png" />
                <p class="vqw-centered-hint">Open this widget's configuration to select a shared query.</p>
            </div>`;
        } else if (loading) {
            html += `<div class="vqw-status vqw-loading">Loading work items…</div>`;
        } else if (error) {
            html += `<div class="vqw-status vqw-error">${this.esc(error)}</div>`;
        } else if (queryResults.length > 0) {
            html += this.buildChart(queryResults);
        } else {
            html += `<div class="vqw-centered-state">
                <img alt="Visual Rollup" src="../../static/icon.png" />
                <p class="vqw-centered-hint">The selected query returned no work items.</p>
            </div>`;
        }

        return html + `</div>`;
    }

    private buildChart(results: Array<workItemHierachyEntry>): string {
        const maxSize = results.reduce((m, r) => Math.max(m, r.childrenTotalSize), 0) || 1;
        const { orgName, projectName, contact } = this.state;

        for (const item of results) {
            item.contact = "";
            if (contact === "Assigned To" && item.assignedTo) {
                item.contact = " – " + item.assignedTo;
            } else if (contact === "Created By") {
                item.contact = " – " + item.createdBy;
            }
        }

        // Legend swatches are derived from the same stateColor data that drives
        // the bar segments below — so on custom process templates the legend
        // matches what users actually see in the chart, instead of showing the
        // ADO Agile-process defaults regardless of template.
        const legendData = buildLegendData(results);
        let html = `<div class="vqw-content">`;
        if (legendData.length > 0) {
            html += `<div class="vqw-legend">`;
            for (const item of legendData) {
                // ADO category enum uses "InProgress" (one word); display as
                // "In Progress" to match conventional UI labeling.
                const label = item.stateCategory === "InProgress" ? "In Progress" : item.stateCategory;
                html += `<span class="vqw-legend-item"><span class="vqw-swatch" style="background:${this.safeColor(item.stateColor)}"></span>${this.esc(label)}</span>`;
            }
            html += `</div>`;
        }

        for (const item of results) {
            const url = `https://dev.azure.com/${encodeURIComponent(orgName)}/${encodeURIComponent(projectName)}/_workitems/edit/${item.id}`;
            const barW = (item.childrenTotalSize / maxSize * 100).toFixed(1);

            const labelColor = item.percentComplete ? this.labelColor(item.parentStateCategories) : "";

            html += `<div class="vqw-row" data-url="${url}">
                <div class="vqw-row-header">
                    <span class="vqw-item-title">${this.esc(item.title + item.contact)}</span>
                </div>
                <div class="vqw-bar-area">
                    <div class="vqw-bar-track"><div class="vqw-bar" style="width:${barW}%">`;

            if (item.childrenTotalSize > 0) {
                for (const cat of item.parentStateCategories) {
                    if (cat.size > 0) {
                        const segW = (cat.size / item.childrenTotalSize * 100).toFixed(1);
                        html += `<div class="vqw-segment" style="width:${segW}%;background:${this.safeColor(cat.stateColor)}"></div>`;
                    }
                }
            }

            if (item.percentComplete) {
                const pct = this.esc(item.percentComplete);
                html += `<span class="vqw-bar-label-inside" style="color:${this.safeColor(labelColor, "#1e1e1e")}">${pct}</span></div></div>`;
                // Outside fallback — shown via CSS when the row has class "label-outside" (set by adjustBarLabels)
                html += `<span class="vqw-bar-label-outside" style="left:calc(${barW}% + 4px)">${pct}</span>`;
            } else {
                html += `</div></div>`;
            }

            html += `</div></div>`;
        }

        return html + `</div>`;
    }

    private labelColor(categories: Array<{stateColor: string, size: number}>): string {
        // find the rightmost visible segment's color, choose white or dark text by luminance
        let color = "#ffffff";
        for (const cat of categories) {
            if (cat.size > 0 && cat.stateColor) color = cat.stateColor;
        }
        // Defensive: if stateColor is missing or malformed, the hex parse returns NaN.
        // Fall back to dark text on an assumed light background rather than producing NaN
        // in the output HTML.
        const hex = (color || "#ffffff").replace("#", "");
        if (hex.length < 6) return "#1e1e1e";
        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;
        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return "#1e1e1e";
        return (0.299 * r + 0.587 * g + 0.114 * b) > 0.5 ? "#1e1e1e" : "#ffffff";
    }

    // HTML-escape for both element-text and attribute-value contexts. Includes
    // " and ' so it's safe when interpolated inside attributes (was previously
    // safe only for text content — using it in an attribute would have left a
    // quote-injection footgun for the next maintainer). Order matters: & first
    // so we don't double-escape the entities we add for < > " '.
    private esc(s: string): string {
        return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    // Validate that a color value is a CSS hex literal (#rgb, #rgba, #rrggbb,
    // #rrggbbaa) before interpolating into a `style` attribute. ADO normally
    // returns hex colors for state categories, but a malicious workspace
    // admin (or a future ADO API change) could deliver a string like
    // "red; } body { display:none } /*" which would break out of the style
    // value into arbitrary CSS. Defense-in-depth: if it doesn't match the
    // hex pattern, fall back to a neutral grey rather than trust the input.
    private safeColor(c: string | undefined | null, fallback: string = "#999999"): string {
        return (typeof c === "string" && /^#[0-9a-fA-F]{3,8}$/.test(c)) ? c : fallback;
    }
}

async function init(): Promise<void> {
    const widget = new VisualQueryWidget();
    try {
        SDK.init();
        await SDK.ready();
        SDK.register("visualquerywidget", widget);
        // getOrgAndProject failure is non-fatal — widget can render; click-through URLs
        // will be incomplete, but the rollup itself is still useful.
        try {
            const { orgName, projectName } = await getOrgAndProject();
            widget.setOrgAndProject(orgName, projectName);
        } catch (err) {
            console.error("Visual Rollup: failed to resolve org/project for click-through URLs", err);
        }
    } catch (err) {
        console.error("Visual Rollup: failed to initialize SDK", err);
    }
}

init();
