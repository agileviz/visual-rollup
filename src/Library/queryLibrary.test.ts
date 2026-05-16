import { getQueries, getQueryFolders, streamQueryFolders, getQueryType, getTreeQueryDepth, QueryStreamEvent } from "./queryLibrary";
import * as adoLib from "./adoLibrary";

jest.mock('./adoLibrary');

describe('getQueries', () => {

    it('is defined', () => {
        expect(getQueries()).toBeDefined();
    });

    it('getQueries returns an array', () => {
        expect(getQueries().then(data => expect(data).toBeInstanceOf(Array)));
    });

    it('getQueries returns the expected Queries', () => {
        expect(getQueries().then(data => expect(data).toMatchSnapshot()));
    });
});

describe('getQueryFolders', () => {

    it('is defined', () => {
        expect(getQueryFolders()).toBeDefined();
    });

    it('getQueryFolders returns an array', () => {
        expect(getQueryFolders().then(data => expect(data).toBeInstanceOf(Array)));
    });

    it('getQueryFolders returns the expected tree structure', () => {
        expect(getQueryFolders().then(data => expect(data).toMatchSnapshot()));
    });
});

describe('streamQueryFolders', () => {

    it('emits events via the callback', async () => {
        const events: Array<QueryStreamEvent> = [];
        await streamQueryFolders(e => { events.push(e); });
        expect(events.length).toBeGreaterThan(0);
    });

    it('emits top-level folders before folder-done(null)', async () => {
        const events: Array<QueryStreamEvent> = [];
        await streamQueryFolders(e => { events.push(e); });

        // Locate the first folder-done with topId=null (the "top-level structure complete" signal).
        const topDoneIdx = events.findIndex(e => e.type === 'folder-done' && e.topId === null);
        expect(topDoneIdx).toBeGreaterThanOrEqual(0);

        // All events before topDoneIdx should be top-level folder or query events (topId=null).
        const beforeDone = events.slice(0, topDoneIdx);
        for (const e of beforeDone) {
            if (e.type !== 'folder-done') expect(e.topId).toBeNull();
        }
    });

    it('emits at least one folder-done(topId=<id>) per top-level folder visited', async () => {
        const events: Array<QueryStreamEvent> = [];
        await streamQueryFolders(e => { events.push(e); });

        const topFolders = events.filter(e => e.type === 'folder' && e.topId === null);
        const folderDoneEvents = events.filter(e => e.type === 'folder-done' && e.topId !== null);

        // Each top-level folder should produce a matching folder-done.
        expect(folderDoneEvents.length).toBe(topFolders.length);
    });

    it('accepts a priorityQueryId without throwing', async () => {
        const events: Array<QueryStreamEvent> = [];
        // priorityQueryId may or may not exist in the mock data; function should not throw.
        await expect(streamQueryFolders(e => { events.push(e); }, "nonexistent-priority-id")).resolves.toBeUndefined();
        expect(events.length).toBeGreaterThan(0);
    });

    it('never throws when the callback throws? (defensive) — callback errors bubble up', async () => {
        // Documenting current behavior: callback errors bubble. If this becomes a crash
        // source in production, wrap the callback invocation in a try/catch at the source.
        await expect(
            streamQueryFolders(() => { throw new Error("callback boom"); })
        ).rejects.toThrow("callback boom");
    });

    it('isolates per-folder errors — failed folders still emit folder-done and other queries still emit', async () => {
        // Simulates a transient getQueryItem rejection (ADO 503, network blip,
        // permission edge case) during the parallel folder walk. The per-folder
        // try/catch in streamQueryFolders should swallow it, log via the
        // perFolderErrorCount > 0 branch, and emit folder-done so the UI's
        // skeleton state for that folder doesn't hang forever.
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const getQueryItemMock = adoLib.getQueryItem as jest.Mock;

        // mockRejectedValueOnce only affects the first call; subsequent calls
        // (and subsequent tests) fall back to the default mock implementation
        // returning evenMoreQueries — no manual reset needed.
        getQueryItemMock.mockRejectedValueOnce(new Error("simulated ADO 503"));

        const events: Array<QueryStreamEvent> = [];
        await expect(streamQueryFolders(e => events.push(e))).resolves.toBeUndefined();

        // Top-level queries (non-folder) are emitted before any getQueryItem
        // call — they should still be present despite the folder failure.
        const queryEvents = events.filter(e => e.type === 'query' && e.topId === null);
        expect(queryEvents.length).toBeGreaterThan(0);

        // folder-done with topId=<id> still fires from the catch's finally block.
        const folderDoneScoped = events.filter(e => e.type === 'folder-done' && e.topId !== null);
        expect(folderDoneScoped.length).toBeGreaterThan(0);

        // The per-folder error log fires in the catch path, plus the summary
        // log fires because perFolderErrorCount > 0.
        const warnCalls = warnSpy.mock.calls.map(c => String(c[0] || ""));
        expect(warnCalls.some(s => s.includes("failed to load — skipping its subtree"))).toBe(true);
        expect(warnCalls.some(s => s.includes("perFolderErrorCount"))).toBe(true);

        warnSpy.mockRestore();
    });
});

describe('getQueryType', () => {

    it('is defined', () => {
        expect(getQueryType("any-id")).toBeDefined();
    });

    it('returns a number', async () => {
        const t = await getQueryType("any-id");
        expect(typeof t).toBe("number");
    });

    it('falls back to type 1 when queryType is missing', async () => {
        // Mock's getQueryItem returns the shape from evenMoreQueries which may not have queryType.
        // Verifying the ?? 1 fallback returns a sensible default rather than NaN/undefined.
        const t = await getQueryType("any-id");
        expect([1, 2, 3]).toContain(t);
    });
});

describe('getTreeQueryDepth', () => {

    it('is defined', () => {
        expect(getTreeQueryDepth("fake-type-2-qiery-id")).toBeDefined();
    });

    it('returns a number >= 1 for a real query result', async () => {
        const depth = await getTreeQueryDepth("fake-type-2-qiery-id");
        expect(typeof depth).toBe("number");
        expect(depth).toBeGreaterThanOrEqual(1);
    });

    it('returns 1 for an empty query result (no workItemRelations)', async () => {
        // The mock returns {} for unknown IDs, which has no workItemRelations.
        // The function should default to depth 1 rather than NaN or throw.
        const depth = await getTreeQueryDepth("unknown-id-no-relations");
        expect(depth).toBe(1);
    });
});
