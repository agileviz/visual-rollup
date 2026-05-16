import { getWorkItemsByQueryID, createWorkItemBatchRequest, createWorkItemBatchRequests,
    processQueryType1, processQueryType2, processTreeQuery,
    workItemsByStateCategoryProposedFirst, workItemsByStateCategoryInProgressFirst,
    workItemHierachyEntry, buildLegendData } from "./queryResultsLibrary";
import { queryType1Results, queryType2Results, treeQueryResults } from "./queryLibrary.data";
import { WorkItemQueryResult } from "azure-devops-extension-api/WorkItemTracking";

jest.mock('./adoLibrary');

// this import does not work with Jest
//import { WorkItemExpand } as WorkItemTracking from "azure-devops-extension-api/WorkItemTracking/WorkItemTracking";
// so we hard code this:
enum WorkItemExpand {
    /**
     * Default behavior.
     */
    None = 0,
    /**
     * Relations work item expand.
     */
    Relations = 1,
    /**
     * Fields work item expand.
     */
    Fields = 2,
    /**
     * Links work item expand.
     */
    Links = 3,
    /**
     * Expands all.
     */
    All = 4
}

describe('createWorkItemBatchRequest', () => {

    let ids = [4, 6, 7, 9, 11];

    it('does not create fields list for WorkItemTracking.WorkItemExpand.Fields', () => {
        expect(createWorkItemBatchRequest(new Date(Date.UTC(1960, 10, 29, 1, 34, 0, 0)), WorkItemExpand.Fields, ids)).toMatchSnapshot();
    });

    it('creates fields list for WorkItemTracking.WorkItemExpand.None', () => {
        expect(createWorkItemBatchRequest(new Date(Date.UTC(1960, 10, 29, 1, 34, 0, 0)), WorkItemExpand.None, ids)).toMatchSnapshot();
    });

});

describe('getWorkItemsByQueryID', () => {

    it('is defined', () => {
        expect(getWorkItemsByQueryID("fake-type-1-qiery-id")).toBeDefined();
    });

    it('returns expected results for queryType = 1', () => {
        expect(getWorkItemsByQueryID("fake-type-1-qiery-id").then(data => expect(data).toMatchSnapshot()));
    });

    it('routes queryType = 3 (work items with direct links) to processQueryType2', async () => {
        // The existing processQueryType2 tests call it directly — without this
        // routing test, the queryType==3 branch in getWorkItemsByQueryID is
        // never executed.
        const data = await getWorkItemsByQueryID("fake-type-2-qiery-id");
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
    });

    it('routes queryType = 2 (tree query) to processTreeQuery', async () => {
        // Coverage for the queryType==2 branch in getWorkItemsByQueryID — without
        // an explicit routing test it would never be hit (existing fixtures only
        // exercise queryType 1 and 3).
        const data = await getWorkItemsByQueryID("fake-tree-qiery-id", 1);
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
        const ids = data.map(d => d.id);
        // treeLevel=1 should surface both top-level features
        expect(ids).toContain(100);
        expect(ids).toContain(101);
    });

    // you will also see console.log "ERROR: unknown query type encountered..."
    it('returns no results for an invalid queryType = 4', () => {
        console.log("The ERROR message about an unknown query type is expected as part of this test...");
        expect(getWorkItemsByQueryID("fake-type-4-qiery-id").then(data => expect(data.length).toEqual(0)));
    });

});

describe('processQueryType1', () => {

    it('is defined', () => {
        expect(processQueryType1(queryType1Results)).toBeDefined();
    });

    it('returns expected results', () => {
        expect(processQueryType1(queryType1Results).then(data => expect(data).toMatchSnapshot()));
    });

});

describe('processQueryType2', () => {

    it('is defined', () => {
        expect(processQueryType2(queryType2Results)).toBeDefined();
    });

    it('returns expected results', () => {
        expect(processQueryType2(queryType2Results).then(data => expect(data).toMatchSnapshot()));
    });

});

describe('processTreeQuery', () => {

    type RelationFixture = {
        rel: string | null;
        source: { id: number } | null;
        target: { id: number } | null;
    };

    // Helper: build a minimal WorkItemQueryResult with the given relations.
    // Avoids 8 lines of identical boilerplate per test.
    function buildTreeResult(workItemRelations: RelationFixture[]): WorkItemQueryResult {
        return {
            queryType: 2,
            queryResultType: 2,
            asOf: new Date("2026-05-09T12:00:00.000Z"),
            columns: [],
            workItemRelations
        } as unknown as WorkItemQueryResult;
    }

    it('returns [] for an empty tree query result', async () => {
        const data = await processTreeQuery(buildTreeResult([]), 1);
        expect(data).toEqual([]);
    });

    it('returns a single root with no children for a single-node tree', async () => {
        const data = await processTreeQuery(
            buildTreeResult([{ rel: null, source: null, target: { id: 101 } }]),
            1
        );
        expect(data).toHaveLength(1);
        expect(data[0].id).toBe(101);
        expect(data[0].wit).toBe("Feature");
        expect(data[0].state).toBe("New");
        expect(data[0].children).toEqual([]);
        expect(data[0].hasChildren).toBe(false);
        expect(data[0].percentComplete).toBe("");  // no non-removed children
    });

    it('flattens all descendants under each level-1 root when treeLevel=1', async () => {
        const data = await processTreeQuery(treeQueryResults, 1);
        // displayIds at level=1 = [100, 101]
        const ids = data.map(d => d.id).sort((a, b) => a - b);
        expect(ids).toEqual([100, 101]);

        // 100 has 5 descendants flattened: 200, 201, 300, 301, 302
        const root100 = data.find(d => d.id === 100)!;
        expect(root100.hasChildren).toBe(true);
        expect(root100.children.map(c => c.id).sort((a, b) => a - b)).toEqual([200, 201, 300, 301, 302]);
        // 3 of 5 are "Done" (Completed); 1 "New" (Proposed); 1 "Committed" (InProgress)
        expect(root100.percentComplete).toBe("3/5");

        // 101 is a leaf root
        const root101 = data.find(d => d.id === 101)!;
        expect(root101.hasChildren).toBe(false);
        expect(root101.children).toEqual([]);
    });

    it('selects mid-level items as display rows when treeLevel=2', async () => {
        const data = await processTreeQuery(treeQueryResults, 2);
        // displayIds at level=2 = [200, 201]; 101 has no children so it drops out
        const ids = data.map(d => d.id).sort((a, b) => a - b);
        expect(ids).toEqual([200, 201]);

        const row200 = data.find(d => d.id === 200)!;
        expect(row200.children.map(c => c.id).sort((a, b) => a - b)).toEqual([300, 301]);
        expect(row200.percentComplete).toBe("1/2");  // 300 Done, 301 New

        const row201 = data.find(d => d.id === 201)!;
        expect(row201.children.map(c => c.id)).toEqual([302]);
        expect(row201.percentComplete).toBe("1/1");  // 302 Done
    });

    it('dedupes parentStateCategories to one entry per category for multi-state-per-category WITs', async () => {
        // PBI WIT (per workItemTypeStatesPBI fixture) has 5 states across 4
        // unique categories: New=Proposed, Approved=Proposed, Committed=
        // InProgress, Done=Completed, Removed=Removed. The previous Set-on-
        // objects "dedup" was a no-op, producing 5 entries with duplicate
        // Proposed; the Map-based dedup collapses to 4.
        const data = await processTreeQuery(treeQueryResults, 2);
        const row200 = data.find(d => d.id === 200)!;
        expect(row200.wit).toBe("Product Backlog Item");
        expect(row200.parentStateCategories).toHaveLength(4);
        const cats = row200.parentStateCategories.map(c => c.stateCategory).sort((a, b) => a.localeCompare(b));
        expect(cats).toEqual(["Completed", "InProgress", "Proposed", "Removed"]);
        // First-encountered color wins: PBI's "New" (b2b2b2) is listed before
        // "Approved" (also b2b2b2) in the WIT's state list, so Proposed bucket
        // takes "New"'s color. (Same color in this fixture, but the contract
        // is "first wins" — important when a custom template has different
        // colors for two states in the same category.)
        const proposed = row200.parentStateCategories.find(c => c.stateCategory === "Proposed")!;
        expect(proposed.stateColor).toBe("#b2b2b2");
    });

    it('selects leaf items with empty children when treeLevel matches max depth', async () => {
        const data = await processTreeQuery(treeQueryResults, 3);
        const ids = data.map(d => d.id).sort((a, b) => a - b);
        expect(ids).toEqual([300, 301, 302]);
        for (const row of data) {
            expect(row.hasChildren).toBe(false);
            expect(row.children).toEqual([]);
        }
    });

    it('returns the deepest available level when treeLevel exceeds tree depth', async () => {
        // Fixture is 3 levels deep; treeLevel=5 should still terminate, returning
        // the deepest non-empty level (level 3) rather than [] or hanging.
        const data = await processTreeQuery(treeQueryResults, 5);
        const ids = data.map(d => d.id).sort((a, b) => a - b);
        expect(ids).toEqual([300, 301, 302]);
    });

    it('drops orphan children whose parent is missing from the field response', async () => {
        // Relations: 100 → 999 (orphan parent, no fields), 999 → 200.
        // The mock's getWorkItems filters by treeQueryFieldResults — so 999 has
        // no field row. Expectation: 100 displays with children = [200] only;
        // 999 is silently dropped by the .filter(id => fieldIdMap.has(id)) step.
        const data = await processTreeQuery(
            buildTreeResult([
                { rel: null, source: null, target: { id: 100 } },
                { rel: "System.LinkTypes.Hierarchy-Forward", source: { id: 100 }, target: { id: 999 } },
                { rel: "System.LinkTypes.Hierarchy-Forward", source: { id: 999 }, target: { id: 200 } }
            ]),
            1
        );
        expect(data).toHaveLength(1);
        expect(data[0].id).toBe(100);
        const childIds = data[0].children.map(c => c.id);
        expect(childIds).toEqual([200]);
        expect(childIds).not.toContain(999);
    });

    it('terminates without stack overflow on circular Hierarchy-Forward relations (defensive)', async () => {
        // Real ADO tree queries shouldn't cycle (parent/child is a DAG by
        // construction), but a malformed fixture or a future custom link type
        // could. The visited-set guard in getAllDescendants prevents the
        // infinite-recursion stack overflow this would otherwise produce.
        const data = await processTreeQuery(
            buildTreeResult([
                { rel: null, source: null, target: { id: 100 } },
                { rel: "System.LinkTypes.Hierarchy-Forward", source: { id: 100 }, target: { id: 200 } },
                { rel: "System.LinkTypes.Hierarchy-Forward", source: { id: 200 }, target: { id: 100 } }  // cycle
            ]),
            1
        );
        expect(data).toHaveLength(1);
        expect(data[0].id).toBe(100);
        // 200 reached as a child of 100; the cycle back to 100 is dropped by visited-set
        const childIds = data[0].children.map(c => c.id);
        expect(childIds).toEqual([200]);
    });

});

describe('createWorkItemBatchRequests', () => {

    it('is defined', () => {
        expect(createWorkItemBatchRequests(queryType2Results)).toBeDefined();
    });

    it('createWorkItemBatchRequest returns an array', () => {
        expect(createWorkItemBatchRequests(queryType2Results)).toBeInstanceOf(Object);
    });

    it('createWorkItemBatchRequest returns an array', () => {
        expect(createWorkItemBatchRequests(queryType1Results)).toBeInstanceOf(Object);
    });

    it('createWorkItemBatchRequest returns the expected results for QueryType2', () => {
        expect(createWorkItemBatchRequests(queryType2Results)).toMatchSnapshot();
    });

    it('createWorkItemBatchRequest returns the expected results for QueryType 1', () => {
        expect(createWorkItemBatchRequests(queryType1Results)).toMatchSnapshot();
    });

});

describe('buildLegendData', () => {

    // Minimal stub builder — buildLegendData only reads parentStateCategories.
    function row(parentStateCategories: Array<{stateCategory: string, stateColor: string, size: number}>): workItemHierachyEntry {
        return {
            id: 0, title: "", wit: "", createdBy: "", assignedTo: "", contact: "",
            state: "", stateCategory: "", stateColor: "", parentStateCategories,
            priority: 0, size: 0, unsized: false, percentComplete: "",
            childrenTotalSize: 0, childrenCompletedSize: 0,
            hasChildren: false, children: []
        };
    }

    it('returns [] when no row has any segments with size > 0', () => {
        // No bars rendered → no legend
        const data = buildLegendData([
            row([{stateCategory: "Completed", stateColor: "#339933", size: 0}]),
            row([])
        ]);
        expect(data).toEqual([]);
    });

    it('collects unique categories with size > 0 across all rows', () => {
        const data = buildLegendData([
            row([
                {stateCategory: "Completed", stateColor: "#339933", size: 5},
                {stateCategory: "InProgress", stateColor: "#007acc", size: 0}  // size 0, skipped
            ]),
            row([
                {stateCategory: "Proposed", stateColor: "#b2b2b2", size: 3},
                {stateCategory: "InProgress", stateColor: "#007acc", size: 2}
            ])
        ]);
        const cats = data.map(d => d.stateCategory);
        expect(cats).toEqual(["Completed", "InProgress", "Proposed"]);
    });

    it('returns categories in canonical bar order (Completed → Resolved → InProgress → Proposed → Removed)', () => {
        // Insert in scrambled order; legend should still come out canonical
        const data = buildLegendData([
            row([
                {stateCategory: "Removed",    stateColor: "#ffffff", size: 1},
                {stateCategory: "Proposed",   stateColor: "#b2b2b2", size: 1},
                {stateCategory: "Resolved",   stateColor: "#ff9d00", size: 1},
                {stateCategory: "InProgress", stateColor: "#007acc", size: 1},
                {stateCategory: "Completed",  stateColor: "#339933", size: 1}
            ])
        ]);
        expect(data.map(d => d.stateCategory)).toEqual(
            ["Completed", "Resolved", "InProgress", "Proposed", "Removed"]
        );
    });

    it('takes first-encountered color when multi-WIT queries disagree on a category color', () => {
        // Custom template: row 1's WIT uses #ff0000 for InProgress; row 2's
        // WIT uses #007acc for InProgress. First wins.
        const data = buildLegendData([
            row([{stateCategory: "InProgress", stateColor: "#ff0000", size: 1}]),
            row([{stateCategory: "InProgress", stateColor: "#007acc", size: 1}])
        ]);
        expect(data).toEqual([{stateCategory: "InProgress", stateColor: "#ff0000"}]);
    });

    it('drops categories not in the canonical list (defensive — guards against unexpected ADO data)', () => {
        // ADO's category enum is fixed, but a future API change or malformed
        // response with an unknown category should not crash buildLegendData;
        // it should silently drop the unknown category.
        const data = buildLegendData([
            row([
                {stateCategory: "Completed",   stateColor: "#339933", size: 1},
                {stateCategory: "Whatever",    stateColor: "#000000", size: 1}  // unknown
            ])
        ]);
        expect(data.map(d => d.stateCategory)).toEqual(["Completed"]);
    });

});

describe('sort comparators', () => {

    // Minimal stub — only the fields each comparator reads.
    function entry(id: number, stateCategory: string, priority: number = 0): workItemHierachyEntry {
        return {
            id, title: "", wit: "", createdBy: "", assignedTo: "", contact: "",
            state: "", stateCategory, stateColor: "", parentStateCategories: [],
            priority, size: 0, unsized: false, percentComplete: "",
            childrenTotalSize: 0, childrenCompletedSize: 0,
            hasChildren: false, children: []
        };
    }

    it('workItemsByStateCategoryProposedFirst orders Proposed → InProgress → Completed → Removed', () => {
        const items = [
            entry(1, "Removed"),
            entry(2, "Completed"),
            entry(3, "Proposed"),
            entry(4, "InProgress")
        ];
        items.sort(workItemsByStateCategoryProposedFirst);
        expect(items.map(i => i.stateCategory)).toEqual(["Proposed", "InProgress", "Completed", "Removed"]);
    });

    it('workItemsByStateCategoryProposedFirst breaks ties on priority then id', () => {
        const items = [
            entry(20, "Proposed", 5),
            entry(10, "Proposed", 5),  // same category and priority — id 10 wins
            entry(15, "Proposed", 1)   // lower priority wins overall
        ];
        items.sort(workItemsByStateCategoryProposedFirst);
        expect(items.map(i => i.id)).toEqual([15, 10, 20]);
    });

    it('workItemsByStateCategoryInProgressFirst orders InProgress → Proposed → Completed → Removed', () => {
        const items = [
            entry(1, "Removed"),
            entry(2, "Proposed"),
            entry(3, "Completed"),
            entry(4, "InProgress")
        ];
        items.sort(workItemsByStateCategoryInProgressFirst);
        expect(items.map(i => i.stateCategory)).toEqual(["InProgress", "Proposed", "Completed", "Removed"]);
    });

    it('workItemsByStateCategoryInProgressFirst breaks ties on priority then id', () => {
        const items = [
            entry(20, "InProgress", 5),
            entry(10, "InProgress", 5),
            entry(15, "InProgress", 1)
        ];
        items.sort(workItemsByStateCategoryInProgressFirst);
        expect(items.map(i => i.id)).toEqual([15, 10, 20]);
    });

});
