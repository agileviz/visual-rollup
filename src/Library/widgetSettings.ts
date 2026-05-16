// Saved widget configuration. The config pane writes this; the widget body
// reads it back via Dashboard.WidgetSettings.customSettings.data (a JSON
// string). Persistence is owned by ADO Dashboards SDK; this file owns the
// shape and the sanitization at the read boundary.

export const VALID_CONTACTS = ["None", "Assigned To", "Created By"] as const;
export type Contact = typeof VALID_CONTACTS[number];

export const VALID_SORT_IDS = ["0", "1", "2", "3"] as const;
export type SortId = typeof VALID_SORT_IDS[number];

// Interface uses loose `string` types for contact/sort.id so the existing
// Config.tsx state (which sources values from `<select>` element values, all
// of which are typed `string`) doesn't need narrowing casts at every change
// handler. Runtime validation lives in sanitizeSettings — the actual safety
// check — and the exported Contact/SortId types are available for code that
// wants to assert tightness explicitly.
export interface widgetCustomSettings {
    queryId: string;
    queryText: string;
    contact: string;
    sort: { text: string; id: string };
    treeLevel: number;
}

export const DEFAULT_SETTINGS: widgetCustomSettings = {
    queryId:   "",
    queryText: "",
    contact:   "None",
    sort:      { text: "Priority", id: "0" },
    treeLevel: 1,
};

// treeLevel is a 1-based depth into the parent/child rollup hierarchy. UI
// only ever offers the levels actually present in the selected query (set
// by Config.tsx::populateTreeLevels), so the upper bound here is a sanity
// floor that prevents a manually-tampered persisted value from escaping
// into runtime as e.g. -5 or NaN. 20 is far above any realistic ADO
// hierarchy depth (Epic → Feature → PBI → Task = 4).
const MIN_TREE_LEVEL = 1;
const MAX_TREE_LEVEL = 20;

// Persistence-boundary sanitizer. Runs on every read of saved settings (in
// both Config.tsx::load and Widget.tsx::processSettings) so corrupted or
// adversarial values from the persisted blob can't escape into runtime as
// out-of-range numerics, unexpected strings used in DOM attributes, or
// branching on enum values that no UI handler covers. Mirrors the
// "sanitize at every persistence boundary" rule from Throughput launch-prep.
//
// Returns a fully-populated settings object with safe defaults filling any
// missing or invalid field. Never throws.
export function sanitizeSettings(raw: unknown): widgetCustomSettings {
    const r = (raw && typeof raw === "object") ? raw as Record<string, unknown> : {};

    const queryId   = typeof r.queryId   === "string" ? r.queryId   : DEFAULT_SETTINGS.queryId;
    const queryText = typeof r.queryText === "string" ? r.queryText : DEFAULT_SETTINGS.queryText;

    // tsconfig.target = ES5 here, so readonly-array .includes() isn't in
    // the lib types — use indexOf >= 0 for membership checks. (See tsconfig
    // ES5→ES2020 sync in project_vr_next_revision.md memory.) Locals typed
    // as `string` (matching the loose widgetCustomSettings interface) so the
    // conditional doesn't widen to a mismatched union; the runtime indexOf
    // check is still the actual safety guarantee.
    const contact: string = (VALID_CONTACTS as readonly string[]).indexOf(r.contact as string) >= 0
        ? r.contact as string
        : DEFAULT_SETTINGS.contact;

    const rawSort = (r.sort && typeof r.sort === "object") ? r.sort as Record<string, unknown> : {};
    const sortId: string = (VALID_SORT_IDS as readonly string[]).indexOf(rawSort.id as string) >= 0
        ? rawSort.id as string
        : DEFAULT_SETTINGS.sort.id;
    const sortText = typeof rawSort.text === "string" ? rawSort.text : DEFAULT_SETTINGS.sort.text;

    // Number(Symbol(...)) throws TypeError — guard with typeof so adversarial
    // input can't crash the sanitizer. Only number/string coerce safely; all
    // other types (Symbol, object, function, undefined, null, boolean) become
    // NaN and fall back to the default.
    const tl = r.treeLevel;
    const rawTreeLevel = (typeof tl === "number" || typeof tl === "string") ? Number(tl) : NaN;
    const treeLevel = Number.isFinite(rawTreeLevel)
        ? Math.max(MIN_TREE_LEVEL, Math.min(MAX_TREE_LEVEL, Math.floor(rawTreeLevel)))
        : DEFAULT_SETTINGS.treeLevel;

    return { queryId, queryText, contact, sort: { text: sortText, id: sortId }, treeLevel };
}
