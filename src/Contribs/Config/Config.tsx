import "./Config.scss";
import "slim-select/styles";
import SlimSelect from "slim-select";
// Aliased on import: slim-select's Option would otherwise shadow the DOM's
// global Option (HTMLOptionElement) inside this file.
import type { Option as SlimOption, Optgroup as SlimOptgroup } from "slim-select";
import * as SDK from "azure-devops-extension-sdk";
import * as Dashboard from "azure-devops-extension-api/Dashboard";
import { streamQueryFolders, getQueryType, getTreeQueryDepth } from "../../Library/queryLibrary";
import { widgetCustomSettings, sanitizeSettings } from "../../Library/widgetSettings";

export type { widgetCustomSettings };

// AgileViz content URLs. Centralized so future URL changes are a one-line edit.
// URL_LEARN points to the platform homepage today; switch to /about/ once that page ships.
const URL_LEARN   = "https://agileviz.com/";
const URL_SUPPORT = "https://agileviz.com/plugins/visual-rollup/";

// New-tab icon SVG (currentColor so it tracks the link's theme-aware color).
const ICON_EXTERNAL = `<svg class="agv-icon-external" aria-hidden="true" viewBox="0 0 16 16" width="11" height="11"><path fill="currentColor" d="M10 1h5v5h-1V2.7L7.4 9.3l-.7-.7L13.3 2H10V1zM2 3v11h11V8h1v7H1V2h7v1H2z"/></svg>`;

class VisualQueryWidgetConfig implements Dashboard.IWidgetConfiguration {

    private configContext?: Dashboard.IWidgetConfigurationContext;

    private state = {
        queryId: "",
        queryText: "",
        queryType: 1,
        treeLevel: 1,
        maxTreeLevel: 4,
        contact: "None",
        sort: { text: "Priority", id: "0" }
    };

    private querySelect!: HTMLSelectElement;
    private treeLevelWrapper!: HTMLElement;
    private treeLevelSelect!: HTMLSelectElement;
    private contactSelect!: HTMLSelectElement;
    private sortSelect!: HTMLSelectElement;
    private queryError!: HTMLElement;
    private slimQuery?: SlimSelect;

    constructor() {
        document.getElementById("root")!.innerHTML = `
            <div class="content">
                <div id="query-error" class="error-message" style="display:none">You must select a query.</div>
                <div id="query-load-error" class="error-message" style="display:none">Couldn't load the list of shared queries. Reload the page to try again.</div>
                <div class="config-field-wrapper">
                    <label class="config-label" for="query-select">Query <span class="error-indicator">*</span></label>
                    <select class="config-select query-select" id="query-select"></select>
                </div>
                <div class="config-field-wrapper" id="tree-level-wrapper" style="display:none">
                    <label class="config-label" for="tree-level-select">Display level</label>
                    <div class="config-select-wrapper">
                        <select class="config-select" id="tree-level-select">
                            <option value="1">Level 1 (top of hierarchy)</option>
                        </select>
                    </div>
                </div>
                <div class="config-field-wrapper">
                    <label class="config-label" for="contact-select">Name on work items</label>
                    <div class="config-select-wrapper">
                        <select class="config-select" id="contact-select">
                            <option value="None">None</option>
                            <option value="Assigned To">Assigned To</option>
                            <option value="Created By">Created By</option>
                        </select>
                    </div>
                </div>
                <div class="config-field-wrapper">
                    <label class="config-label" for="sort-select">Work Item Sorting</label>
                    <div class="config-select-wrapper">
                        <select class="config-select" id="sort-select">
                            <option value="0">Priority</option>
                            <option value="1">Proposed, In Progress, Completed</option>
                            <option value="2">In Progress, Proposed, Completed</option>
                            <option value="3">Completed, In Progress, Proposed</option>
                        </select>
                    </div>
                </div>

                <section class="agv-pitch">
                    <p class="agv-pitch-headline">
                        <strong>Visual Rollup shows where your work is.</strong><br>
                        <strong>AgileViz shows how it's flowing.</strong>
                    </p>
                    <p class="agv-pitch-body">
                        Cycle time by board column, WIP trends, flow efficiency, copy/paste outliers for review, and AI-assisted coaching.
                    </p>
                    <p class="agv-pitch-link-primary">
                        <a class="agv-link" href="${URL_LEARN}" target="_blank" rel="noopener noreferrer">
                            Where does your team's time go?${ICON_EXTERNAL}<span class="agv-visually-hidden"> (opens in a new tab)</span>
                        </a>
                    </p>
                    <p class="agv-pitch-link-support">
                        <a class="agv-link" href="${URL_SUPPORT}" target="_blank" rel="noopener noreferrer">
                            Need help with Visual Rollup? Get support${ICON_EXTERNAL}<span class="agv-visually-hidden"> (opens in a new tab)</span>
                        </a>
                    </p>
                </section>

            </div>`;

        this.querySelect      = document.getElementById("query-select")       as HTMLSelectElement;
        this.treeLevelWrapper = document.getElementById("tree-level-wrapper") as HTMLElement;
        this.treeLevelSelect  = document.getElementById("tree-level-select")  as HTMLSelectElement;
        this.contactSelect    = document.getElementById("contact-select")     as HTMLSelectElement;
        this.sortSelect       = document.getElementById("sort-select")        as HTMLSelectElement;
        this.queryError       = document.getElementById("query-error")        as HTMLElement;


        this.treeLevelSelect.addEventListener("change", () => {
            this.state.treeLevel = +this.treeLevelSelect.value;
            this.notify();
        });

        this.contactSelect.addEventListener("change", () => {
            this.state.contact = this.contactSelect.value;
            this.notify();
        });

        this.sortSelect.addEventListener("change", () => {
            const opt = this.sortSelect.selectedOptions[0];
            this.state.sort = { text: opt.text, id: opt.value };
            this.notify();
        });
    }

    public load(
        widgetSettings: Dashboard.WidgetSettings,
        widgetConfigurationContext: Dashboard.IWidgetConfigurationContext
    ): Promise<Dashboard.WidgetStatus> {
        this.configContext = widgetConfigurationContext;

        // Parse + sanitize at the persistence boundary. sanitizeSettings is
        // total — it tolerates fresh-install (parseFailed → null), missing
        // fields, and invalid values, returning a fully-populated object
        // backed by DEFAULT_SETTINGS. Replaces the prior `||` falsy fallback
        // chain which only caught missing/null and let invalid values
        // (e.g. treeLevel: -5) through into runtime.
        let parsed: unknown = null;
        try {
            parsed = JSON.parse(widgetSettings.customSettings.data);
        } catch { /* fresh install: data is "" */ }
        const saved = sanitizeSettings(parsed);
        this.state.queryId   = saved.queryId;
        this.state.queryText = saved.queryText;
        this.state.contact   = saved.contact;
        this.state.sort      = saved.sort;
        this.state.treeLevel = saved.treeLevel;

        this.contactSelect.value = this.state.contact;
        this.sortSelect.value    = this.state.sort.id;

        // loadQueries is async — don't await it here (load() must return quickly for
        // the dashboard SDK). Surface failures inline rather than letting them reject silently.
        this.loadQueries().catch(err => {
            console.error("Visual Rollup config: failed to load queries", err);
            const loadError = document.getElementById("query-load-error") as HTMLElement | null;
            if (loadError) loadError.style.display = "block";
        });
        return Dashboard.WidgetStatusHelper.Success();
    }

    public onSave(): Promise<Dashboard.SaveStatus> {
        if (!this.state.queryId) {
            this.queryError.style.display = "block";
            return Dashboard.WidgetConfigurationSave.Invalid();
        }
        this.queryError.style.display = "none";
        const settings: widgetCustomSettings = {
            queryId:   this.state.queryId,
            queryText: this.state.queryText,
            contact:   this.state.contact,
            sort:      this.state.sort,
            treeLevel: this.state.treeLevel
        };
        return Dashboard.WidgetConfigurationSave.Valid({ data: JSON.stringify(settings) });
    }

    private notify(): void {
        const settings: widgetCustomSettings = {
            queryId:   this.state.queryId,
            queryText: this.state.queryText,
            contact:   this.state.contact,
            sort:      this.state.sort,
            treeLevel: this.state.treeLevel
        };
        this.configContext?.notify(
            Dashboard.ConfigurationEvent.ConfigurationChange,
            Dashboard.ConfigurationEvent.Args({ data: JSON.stringify(settings) })
        );
    }

    private async loadQueries(): Promise<void> {
        type Entry =
            | { kind: 'query',  value: string, name: string, depth: number, ancestors: string[] }
            | { kind: 'folder', value: string, subFolderId: string, name: string, depth: number, ancestors: string[] };

        const topOrder: Array<string> = [];
        const groups = new Map<string, { label: string, entries: Array<Entry> }>();
        const looseOptions: Array<{ value: string, text: string, html: string }> = [];
        const expandedSubFolders = new Set<string>();
        let restored = false;
        let suppressAfterChange = false;
        const savedQueryId = this.state.queryId;

        // Loading-state flag for the dropdown placeholder. While streamQueryFolders
        // is in flight (the parallel-walk over 145 top-level folders is the
        // dominant cost — typically 2-3s warm, 4-5s cold per the timing logs),
        // the placeholder reads "Loading queries…" so users know the picker is
        // working rather than broken. Flipped to false in the finally block of
        // the streaming await so success AND error paths land on the post-load
        // text. flush() reads this on every render.
        let isLoading = true;

        const scheduleFlush = () => {
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(flush);
        };

        this.slimQuery = new SlimSelect({
            select: this.querySelect,
            settings: {
                // Initial placeholder while data is empty (before first flush()
                // sends a placeholder option in setData). Reads "Loading
                // queries…" so the picker doesn't briefly look like a finished
                // empty state during the streaming cold-start window.
                placeholderText:   "Loading queries…",
                searchPlaceholder: "Search queries",
                searchHighlight:   true,
                allowDeselect:     false,
                contentLocation:   document.body
            },
            events: {
                // Intercept clicks on sub-folder markers — toggle their expand state
                // and cancel the "selection" so the query dropdown doesn't commit.
                beforeChange: (newVal): boolean | void => {
                    if (suppressAfterChange) return;
                    if (newVal.length === 0) return;
                    const v = newVal[0].value;
                    if (v && v.startsWith("__folder__")) {
                        const folderId = v.slice("__folder__".length);
                        if (expandedSubFolders.has(folderId)) expandedSubFolders.delete(folderId);
                        else expandedSubFolders.add(folderId);
                        scheduleFlush();
                        return false;
                    }
                },
                afterChange: (newVal) => {
                    if (suppressAfterChange) return;
                    if (newVal.length === 0) return;
                    const selected = newVal[0];
                    if (!selected.value || selected.value.startsWith("__folder__")) return;
                    this.handleQuerySelected(selected.value, selected.text);
                }
            }
        });

        let scheduled = false;
        const flush = () => {
            scheduled = false;

            // Preserve which top-level groups the user has expanded during streaming.
            const userOpenedTop = new Set<string>();
            document.querySelectorAll('.ss-optgroup.ss-open .ss-optgroup-label-text').forEach(el => {
                const label = (el as HTMLElement).textContent;
                if (label) userOpenedTop.add(label);
            });

            // currentSelectedId reflects the LIVE state — `savedQueryId` was
            // captured once at loadQueries() entry and represents "what was
            // saved when config opened." During streaming, every flush()
            // rebuilds the dropdown via setData(); SlimSelect drops the
            // selected option if it isn't marked `selected` in the new data.
            // Using savedQueryId here (which stays "" for first-time-config)
            // would lose the user's just-made selection on the next flush —
            // visible as the dropdown snapping back to "Select a shared
            // query..." mid-stream while subsequent folders' contents arrive.
            const currentSelectedId = this.state.queryId;

            // Exactly what SlimSelect.setData() accepts: a mix of bare options
            // (the placeholder and any query sitting outside a folder) and
            // optgroups (one per top-level folder). Partial<> because slim-select
            // fills in the rest of each class's fields itself.
            const data: Array<Partial<SlimOption> | Partial<SlimOptgroup>> = [{
                placeholder: true,
                text: isLoading ? "Loading queries…" : "Select a shared query…"
            }];
            for (const o of looseOptions) data.push({ ...o, selected: o.value === currentSelectedId });

            for (const id of topOrder) {
                const g = groups.get(id)!;
                const containsSelected = !!currentSelectedId && g.entries.some(e => e.kind === 'query' && e.value === currentSelectedId);
                const stayOpen = containsSelected || userOpenedTop.has(g.label);

                const options = g.entries.map(e => {
                    const indent = "  ".repeat(Math.max(0, e.depth - 1));
                    // Hidden if any ancestor sub-folder is collapsed
                    const hidden = e.ancestors.some(a => !expandedSubFolders.has(a));

                    if (e.kind === 'folder') {
                        const isOpen = expandedSubFolders.has(e.subFolderId);
                        const chevron = isOpen ? "▾" : "▸";
                        return {
                            value:   e.value,
                            text:    chevron + " " + e.name,
                            html:    indent + chevron + " " + e.name,
                            display: !hidden,
                            class:   "sub-folder-marker"
                        };
                    }
                    return {
                        value:    e.value,
                        text:     e.name,
                        html:     indent + e.name,
                        selected: e.value === currentSelectedId,
                        display:  !hidden
                    };
                });

                data.push({
                    label:    g.label,
                    closable: stayOpen ? 'open' : 'close',
                    options
                });
            }

            suppressAfterChange = true;
            this.slimQuery!.setData(data);
            suppressAfterChange = false;

            if (savedQueryId && !restored) {
                const exists =
                    looseOptions.some(o => o.value === savedQueryId) ||
                    Array.from(groups.values()).some(g => g.entries.some(e => e.kind === 'query' && e.value === savedQueryId));
                if (exists) {
                    restored = true;
                    this.updateTreeLevel(savedQueryId).then(() => {
                        this.treeLevelSelect.value = String(this.state.treeLevel);
                    });
                }
            }
        };

        try {
            await streamQueryFolders(event => {
            if (event.type === 'folder-done') {
                // Flush on folder boundaries only: less DOM thrash, each top-level
                // folder's contents pop in atomically when its subtree has loaded.
                flush();
                return;
            }
            if (event.type === 'folder' && event.topId === null) {
                groups.set(event.id, { label: event.name, entries: [] });
                topOrder.push(event.id);
            } else if (event.type === 'folder') {
                const g = groups.get(event.topId!);
                if (!g) return;
                g.entries.push({
                    kind:        'folder',
                    value:       "__folder__" + event.id,
                    subFolderId: event.id,
                    name:        event.name,
                    depth:       event.depth,
                    ancestors:   event.parentChain.slice()
                });
            } else {
                if (event.topId === null) {
                    looseOptions.push({ value: event.id, text: event.name, html: event.name });
                } else {
                    const g = groups.get(event.topId);
                    if (!g) return;
                    g.entries.push({
                        kind:      'query',
                        value:     event.id,
                        name:      event.name,
                        depth:     event.depth,
                        ancestors: event.parentChain.slice()
                    });
                    if (savedQueryId && event.id === savedQueryId) {
                        for (const a of event.parentChain) expandedSubFolders.add(a);
                    }
                }
            }
        }, savedQueryId);
        } finally {
            // Loading complete (success OR error). Flip the flag and re-flush
            // so the placeholder transitions from "Loading queries…" to
            // "Select a shared query…". On the error path, the post-load text
            // is briefly visible before the caller's catch handler reveals
            // #query-load-error — that's a small inconsistency we accept to
            // keep the success path's placeholder behavior simple.
            isLoading = false;
            flush();
        }

        if (this.state.queryId && !restored) {
            this.state.queryId   = "";
            this.state.queryText = "";
        }
    }

    private async handleQuerySelected(queryId: string, queryText: string): Promise<void> {
        this.state.queryId   = queryId;
        this.state.queryText = queryText;
        this.state.treeLevel = 1;
        this.queryError.style.display = "none";
        await this.updateTreeLevel(queryId);
        this.notify();
    }

    private async updateTreeLevel(queryId: string): Promise<void> {
        const queryType    = await getQueryType(queryId);
        const maxTreeLevel = queryType === 2 ? await getTreeQueryDepth(queryId) : 4;

        this.state.queryType    = queryType;
        this.state.maxTreeLevel = maxTreeLevel;

        this.treeLevelSelect.innerHTML = "";
        const count = Math.max(1, maxTreeLevel - 1);
        for (let i = 1; i <= count; i++) {
            const opt  = document.createElement("option");
            opt.value  = String(i);
            opt.text   = i === 1 ? "Level 1 (top of hierarchy)" : `Level ${i}`;
            this.treeLevelSelect.appendChild(opt);
        }

        this.treeLevelWrapper.style.display = queryType === 2 ? "" : "none";
    }
}

async function init(): Promise<void> {
    const config = new VisualQueryWidgetConfig();
    SDK.init();
    await SDK.ready();
    SDK.register("visualquerywidget-configuration", config);

    // Resize the config iframe to fit its actual content. Observing #root
    // rather than body: the body is pinned to 100% viewport height by
    // azure-devops-ui's override.scss, so its size never changes when content
    // inside grows (e.g. the Display level wrapper appearing for tree queries).
    // #root auto-sizes to its children, so its ResizeObserver re-fires whenever
    // the field list changes shape.
    //
    // Minimum height (500px) does two things:
    //   1. Gives the query popover room to open to its full --ss-content-height
    //      (300px) below the first select without clipping.
    //   2. Leaves enough space below the last select (Work Item Sorting) that
    //      the browser's native <select> picker decides to open downward
    //      instead of upward — native pickers generally want ~150–180px below
    //      the field for a 4-option menu, counting OS chrome.
    // SDK.resize is async (cross-iframe message), so we can't react to an open
    // event and beat the browser's own render — the iframe has to be big enough
    // up-front.
    const root = document.getElementById("root")!;
    const updateSize = () => SDK.resize(400, Math.max(root.offsetHeight + 16, 500));
    new ResizeObserver(updateSize).observe(root);
    updateSize();
}

init();
