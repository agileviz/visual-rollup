import { sanitizeSettings, DEFAULT_SETTINGS, VALID_CONTACTS, VALID_SORT_IDS } from "./widgetSettings";

describe("sanitizeSettings", () => {
    test("returns DEFAULT_SETTINGS for null/undefined/non-object input", () => {
        expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
        expect(sanitizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
        expect(sanitizeSettings("not an object")).toEqual(DEFAULT_SETTINGS);
        expect(sanitizeSettings(42)).toEqual(DEFAULT_SETTINGS);
        // Arrays are typeof "object" so they pass the initial guard, but
        // none of the expected keys exist on them → all fields default.
        // Result equals DEFAULT_SETTINGS (the sanitizer correctly produces
        // safe defaults for every field).
        expect(sanitizeSettings([])).toEqual(DEFAULT_SETTINGS);
    });

    test("preserves a fully-valid settings object", () => {
        const input = {
            queryId: "abc-123",
            queryText: "My Query",
            contact: "Assigned To",
            sort: { text: "Proposed, In Progress, Completed", id: "1" },
            treeLevel: 3,
        };
        expect(sanitizeSettings(input)).toEqual(input);
    });

    test("falls back to defaults for missing fields", () => {
        expect(sanitizeSettings({})).toEqual(DEFAULT_SETTINGS);
    });

    test("rejects invalid contact values, falling back to default", () => {
        const result = sanitizeSettings({ contact: "<script>alert(1)</script>" });
        expect(result.contact).toBe("None");
    });

    test("accepts every valid contact value", () => {
        for (const c of VALID_CONTACTS) {
            expect(sanitizeSettings({ contact: c }).contact).toBe(c);
        }
    });

    test("rejects invalid sort.id, falling back to default", () => {
        const result = sanitizeSettings({ sort: { id: "999", text: "Bogus" } });
        expect(result.sort.id).toBe("0");
    });

    test("accepts every valid sort.id", () => {
        for (const id of VALID_SORT_IDS) {
            expect(sanitizeSettings({ sort: { id, text: "x" } }).sort.id).toBe(id);
        }
    });

    test("preserves sort.text when sort is otherwise valid", () => {
        const result = sanitizeSettings({ sort: { id: "2", text: "In Progress, Proposed, Completed" } });
        expect(result.sort.text).toBe("In Progress, Proposed, Completed");
    });

    test("falls back when sort is missing entirely", () => {
        expect(sanitizeSettings({ sort: undefined }).sort).toEqual(DEFAULT_SETTINGS.sort);
    });

    test("falls back when sort is not an object", () => {
        expect(sanitizeSettings({ sort: "not an object" }).sort).toEqual(DEFAULT_SETTINGS.sort);
    });

    test("clamps treeLevel below MIN to 1", () => {
        expect(sanitizeSettings({ treeLevel: -5 }).treeLevel).toBe(1);
        expect(sanitizeSettings({ treeLevel: 0 }).treeLevel).toBe(1);
    });

    test("clamps treeLevel above MAX to 20", () => {
        expect(sanitizeSettings({ treeLevel: 999 }).treeLevel).toBe(20);
    });

    test("floors fractional treeLevel", () => {
        expect(sanitizeSettings({ treeLevel: 3.7 }).treeLevel).toBe(3);
    });

    test("handles non-numeric treeLevel by defaulting to 1", () => {
        expect(sanitizeSettings({ treeLevel: "not a number" }).treeLevel).toBe(1);
        expect(sanitizeSettings({ treeLevel: NaN }).treeLevel).toBe(1);
        expect(sanitizeSettings({ treeLevel: null }).treeLevel).toBe(1);
    });

    test("rejects non-string queryId/queryText, falling back to empty string", () => {
        const result = sanitizeSettings({ queryId: 42, queryText: { evil: true } });
        expect(result.queryId).toBe("");
        expect(result.queryText).toBe("");
    });

    test("never throws on adversarial input", () => {
        expect(() => sanitizeSettings({
            queryId: { toString: () => { throw new Error("boom"); } },
            sort: null,
            treeLevel: Symbol("nope"),
        })).not.toThrow();
    });
});
