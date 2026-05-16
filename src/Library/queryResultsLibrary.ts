import { getQueryResults, getWorkItems, getWorkItemTypeStates } from "./adoLibrary";
import { WorkItem, WorkItemBatchGetRequest, WorkItemQueryResult, WorkItemStateColor } from "azure-devops-extension-api/WorkItemTracking";

// this import does not work with Jest
//import { WorkItemExpand } as WorkItemTracking from "azure-devops-extension-api/WorkItemTracking/WorkItemTracking";
// so we hard code this:
enum WorkItemExpand {
    None = 0,
    Relations = 1,
    Fields = 2,
    Links = 3,
    All = 4
}

// returns an array with each entry a set of parent/children work items
export async function getWorkItemsByQueryID (queryID: string, treeLevel: number = 1) : Promise<Array<workItemHierachyEntry>> {

    let queryResults = await getQueryResults(queryID);

    if (queryResults.queryType == 1) {
        return processQueryType1(queryResults);
    } else if (queryResults.queryType == 3) {
        return processQueryType2(queryResults);
    } else if (queryResults.queryType == 2) {
        return processTreeQuery(queryResults, treeLevel);
    } else {
        console.error('getWorkItemsByQueryID: unsupported query type', queryResults.queryType);
        return [];
    }
}

// creates a batch request given parent/child query results
// todo: create multiple batch requests if more than 200 IDs
export function createWorkItemBatchRequests (queryResults : WorkItemQueryResult) : Array<WorkItemBatchGetRequest> {

    let ids : Array<number> = [];

    // for queryType 2, we get IDs for parents and children
    if (queryResults.queryType === 3) {
        for (let i in queryResults.workItemRelations) {
            if (queryResults.workItemRelations[i].rel === "System.LinkTypes.Hierarchy-Forward") {
                if (queryResults.workItemRelations[i].source !== null) {
                    ids.push(queryResults.workItemRelations[i].source.id);
                }
                if (queryResults.workItemRelations[i].target !== null) {
                    ids.push(queryResults.workItemRelations[i].target.id);
                }
            }
        }
        // remove duplicate ids
        ids = Array.from(new Set(ids));
    } else if (queryResults.queryType === 1) {
        ids = queryResults.workItems.map( wi => wi.id);
    }

    let batchRequestWorkItemRelations : WorkItemBatchGetRequest = {
        $expand: 1,
        asOf: queryResults.asOf,
        fields: [],
        errorPolicy: 2,
        ids: ids
    };

    let fields = [
        "System.Id",
        "System.WorkItemType",
        "System.Title",
        "System.State",
        "Microsoft.VSTS.Common.BacklogPriority",
        "Microsoft.VSTS.Scheduling.Effort",
        "Microsoft.VSTS.Scheduling.StoryPoints"
      ];

    let batchRequestWorkItemFields : WorkItemBatchGetRequest = {
        $expand: 0,
        asOf: queryResults.asOf,
        fields: fields,
        errorPolicy: 2,
        ids: ids
    };

    let batchRequests : Array<WorkItemBatchGetRequest> = [batchRequestWorkItemRelations, batchRequestWorkItemFields]

    return batchRequests;
}

// WorkItemExpand cannot be used with fields in the work item batch request!
export function createWorkItemBatchRequest(asOf : Date, expand : number, ids : Array<number>) : WorkItemBatchGetRequest {

    let fields : Array<string> = [];

    if (expand == WorkItemExpand.None) {
         fields = [
            "System.WorkItemType",
            "System.Title",
            "System.State",
            "System.CreatedBy",
            "System.AssignedTo",
            "Microsoft.VSTS.Common.BacklogPriority",
            "Microsoft.VSTS.Scheduling.Effort",
            "Microsoft.VSTS.Scheduling.StoryPoints"
        ];
    }

    let workItemBatchRequest : WorkItemBatchGetRequest = {
        $expand: expand,
        asOf: asOf,
        fields: fields,
        errorPolicy: 2,
        ids: ids
    };
    return workItemBatchRequest;
}

export interface stateCategoryColorSize { stateCategory: string, stateColor: string, size: number };

export interface workItemHierachyEntry { id: number, title: string, wit: string, createdBy: string, assignedTo: string, contact: string,
    state: string, stateCategory: string, stateColor: string, parentStateCategories: Array<stateCategoryColorSize>, priority: number,
    size: number, unsized: boolean, percentComplete: string, childrenTotalSize: number, childrenCompletedSize: number,
    hasChildren: boolean, children: Array<workItemHierachyEntry>};

interface newWorkItemHierarchyEntryChildren {id: number, children: Array<newWorkItemHierarchyEntryChildren>};

export function newWorkItemHierarchyEntry (id: number, fields: any) : workItemHierachyEntry {
    return {id: id,
            title: fields['System.Title'] || "",
            wit: fields['System.WorkItemType'] || "",
            // Both CreatedBy and AssignedTo can be undefined in practice: service-account
            // items, deleted-user references, or field-permission filtering. Match the
            // same defensive pattern on both.
            createdBy: typeof fields['System.CreatedBy'] != 'undefined' ? fields['System.CreatedBy'].displayName || "" : "",
            assignedTo: typeof fields['System.AssignedTo'] != 'undefined' ? fields['System.AssignedTo'].displayName || "" : "",
            contact: "",
            state: fields['System.State'] || "",
            stateCategory: "",
            stateColor: "",
            parentStateCategories: [],
            percentComplete: "",
            childrenTotalSize: 0,
            childrenCompletedSize: 0,
            priority: fields['Microsoft.VSTS.Common.BacklogPriority'] || 8888888888,
            size: fields['Microsoft.VSTS.Scheduling.Effort'] ||
                    fields['Microsoft.VSTS.Scheduling.StoryPoints'] ||
                    (fields['System.WorkItemType'] == "Task" ? 1 : 0),
            unsized:  typeof(fields['Microsoft.VSTS.Scheduling.Effort']) == 'undefined' &&
                      typeof(fields['Microsoft.VSTS.Scheduling.StoryPoints']) == 'undefined' &&
                      fields['System.WorkItemType'] != "Task",
            hasChildren: false,
            children: [] };
}

// Shared enrichment: fetches state colors and populates state categories, averages, and percent complete.
async function enrichWorkItemTree (
    workItemTree: Array<workItemHierachyEntry>,
    uniqueWorkItemTypes: Array<string>
) : Promise<Array<workItemHierachyEntry>> {

    const workItemStateColorCategories: Array<Array<WorkItemStateColor>> = await Promise.all(
        uniqueWorkItemTypes.map(wit => getWorkItemTypeStates(wit))
    );

    witAverages(uniqueWorkItemTypes, workItemTree);

    for (let parent of workItemTree) {

        let categoryColor = witCategoryColor(parent.wit, parent.state);
        parent.stateCategory = categoryColor.stateCategory;
        parent.stateColor = categoryColor.stateColor;

        // Defensive: parent.wit should always be in uniqueWorkItemTypes by construction,
        // but guard against any edge case where it isn't (malformed ADO response).
        const witIdx = uniqueWorkItemTypes.indexOf(parent.wit);
        if (witIdx === -1) continue;
        // Dedupe state categories to one entry per category. The previous
        // `Array.from(new Set(objectLiterals))` was a footgun — Set compares by
        // reference, every .map iteration creates a fresh object, so nothing
        // ever deduped. Multi-state-per-category WITs (e.g., Scrum PBI's "New"
        // + "Approved" both → Proposed) produced one entry per state, which
        // happened to render correctly only because the size accumulator wrote
        // to the first matching position and bar/legend code filtered size-zero
        // entries. A Bug-parent WIT with a Resolved state silently mis-colored
        // bars because Resolved (indexOf=-1) sorted to position 0 and shifted
        // every other category off its assumed array index.
        //
        // Map keyed by category, first encountered color wins — matches ADO's
        // state-list ordering (typically workflow order, so "New" wins over
        // "Approved" for Proposed; that's the canonical starting color).
        let parentStateCategories = workItemStateColorCategories[witIdx] || [];
        const categoryColorMap = new Map<string, string>();
        for (const item of parentStateCategories as Array<any>) {
            if (!categoryColorMap.has(item.category)) {
                categoryColorMap.set(item.category, "#" + item.color);
            }
        }
        parent.parentStateCategories = Array.from(categoryColorMap.entries())
            .map(([stateCategory, stateColor]) => ({ stateCategory, stateColor, size: 0 }))
            .sort(stateCategoriesByCategory);

        let completedCount = 0;
        let nonRemovedCount = 0;
        for (let child of parent.children) {
            let cc = witCategoryColor(child.wit, child.state);
            child.stateCategory = cc.stateCategory;
            child.stateColor = cc.stateColor;

            if (child.state != "Removed") {
                nonRemovedCount++;
                // Find-by-name bucket lookup — robust to dedup changing array
                // length and to any category sort order. If a child's category
                // isn't represented in the parent's WIT (malformed/unexpected
                // state), the lookup just returns undefined and the size
                // contribution is skipped rather than landing in the wrong bucket.
                const bucket = parent.parentStateCategories.find(c => c.stateCategory === child.stateCategory);
                if (bucket) {
                    bucket.size += child.size;
                }
                parent.childrenTotalSize += child.size;
                if (child.stateCategory == "Completed") {
                    parent.childrenCompletedSize += child.size;
                    completedCount++;
                }
            }
        }
        parent.children.sort(workItemsByStateCategoryCompletedFirst);
        if (nonRemovedCount > 0) {
            parent.percentComplete = `${completedCount}/${nonRemovedCount}`;
        }
    }

    return workItemTree.sort(workItemsByPriority);

    function witCategoryColor (wit: string, state: string) : {stateCategory: string, stateColor: string } {
        let categoryColor = {stateCategory: "Removed", stateColor: ""};
        const witIdx = uniqueWorkItemTypes.indexOf(wit);
        if (witIdx === -1) return categoryColor;
        let thisWorkItemsStateCategories = workItemStateColorCategories[witIdx];
        if (!thisWorkItemsStateCategories) return categoryColor;
        let thisWorkItemsCurrentStateCategory = thisWorkItemsStateCategories.find(s => s.name === state);
        if (thisWorkItemsCurrentStateCategory != null) {
            categoryColor.stateCategory = thisWorkItemsCurrentStateCategory?.category,
            categoryColor.stateColor = thisWorkItemsCurrentStateCategory?.color
        }
        return categoryColor;
    }
}

export async function processQueryType1 (queryResults: WorkItemQueryResult) : Promise<Array<workItemHierachyEntry>> {

    // get IDs from query results
    let ids = queryResults.workItems.map( wi => wi.id);
    let relatedWorkItemBatchRequest = createWorkItemBatchRequest (queryResults.asOf, WorkItemExpand.Relations, ids);

    // get work items related (linked) to those IDs
    let relatedWorkItemResults : Array<WorkItem> = await getWorkItems(relatedWorkItemBatchRequest);

    // add all child IDs to ids
    for (let topWI of relatedWorkItemResults) {
        if (typeof topWI.relations != 'undefined') {
            for (let link of topWI.relations) {
                if (link.attributes.name === "Child") {
                    let childId = link.url.match(/\d+$/);
                    if (childId !== null) {
                        ids.push(+childId);
                    }
                }
            }
        }
    }

    // batch request for work item fields
    let workItemFieldsBatchRequest = createWorkItemBatchRequest (queryResults.asOf, WorkItemExpand.None, ids);

    // get work item fields for all IDs
    let workItemFieldsResults : Array<WorkItem> = await getWorkItems(workItemFieldsBatchRequest);

    // make a map to quickly find each id in the fields query array
    let fieldIdMap = new Map();
    for (let ndx in workItemFieldsResults) {
        fieldIdMap.set(workItemFieldsResults[ndx].id, ndx);
    }

    let workItemTree : Array<workItemHierachyEntry> = [];
    let workItemTypes : Array<string> = [];

    for (let topWI of relatedWorkItemResults) {

        workItemTypes.push(topWI.fields['System.WorkItemType']);
        let children : Array<number> = [];

        if (typeof topWI.relations != 'undefined') {
            for (let link of topWI.relations) {
                if (link.attributes.name === "Child") {
                    let childId = link.url.match(/\d+$/);
                    if (childId !== null) {
                        children.push(+childId[0]);
                        ids.push(+childId);
                    }
                }
            }
        }

        // Defensive: a batch request with errorPolicy=2 ("Omit") can return fewer items
        // than requested — permissions mid-query, deleted items, partial server response.
        // Skip any top-level or child id that didn't come back.
        const topNdx = fieldIdMap.get(topWI.id);
        if (topNdx === undefined) continue;

        let workItemEnrty = newWorkItemHierarchyEntry(topWI.id, workItemFieldsResults[topNdx].fields);
        workItemEnrty.children = children
            .filter(id => fieldIdMap.get(id) !== undefined)
            .map(id => newWorkItemHierarchyEntry(id, workItemFieldsResults[fieldIdMap.get(id)].fields));
        workItemEnrty.hasChildren = workItemEnrty.children.length > 0;
        for (let child of workItemEnrty.children) {
            workItemTypes.push(child.wit);
        }
        workItemTree.push(workItemEnrty);
    }

    let uniqueWorkItemTypes = Array.from(new Set(workItemTypes.map((wit) => wit)));
    return enrichWorkItemTree(workItemTree, uniqueWorkItemTypes);
}

// Process a "Work Items with Direct Links" query (queryType 2).
// The parent-child tree is already encoded in workItemRelations — no extra ADO round-trip needed.
export async function processQueryType2 (queryResults: WorkItemQueryResult) : Promise<Array<workItemHierachyEntry>> {

    const parentIds: Array<number> = [];
    const parentChildMap = new Map<number, Array<number>>();
    const allIds = new Set<number>();

    for (const relation of queryResults.workItemRelations) {
        if (relation.rel === null && relation.source === null) {
            // Top-level item (parent)
            if (relation.target === null) continue;
            const id = relation.target.id;
            parentIds.push(id);
            allIds.add(id);
            if (!parentChildMap.has(id)) parentChildMap.set(id, []);
        } else if (relation.rel === "System.LinkTypes.Hierarchy-Forward") {
            // Parent → child link
            if (relation.source === null || relation.target === null) continue;
            const parentId = relation.source.id;
            const childId = relation.target.id;
            allIds.add(parentId);
            allIds.add(childId);
            if (!parentChildMap.has(parentId)) parentChildMap.set(parentId, []);
            parentChildMap.get(parentId)!.push(childId);
        }
    }

    // One batch request for all fields — no relations expand needed since the tree is already known
    const fieldsRequest = createWorkItemBatchRequest(queryResults.asOf, WorkItemExpand.None, Array.from(allIds));
    const fieldResults: Array<WorkItem> = await getWorkItems(fieldsRequest);

    const fieldIdMap = new Map<number, number>();
    for (let i = 0; i < fieldResults.length; i++) {
        fieldIdMap.set(fieldResults[i].id, i);
    }

    const workItemTree: Array<workItemHierachyEntry> = [];
    const workItemTypes: Array<string> = [];

    for (const parentId of parentIds) {
        const ndx = fieldIdMap.get(parentId);
        if (ndx === undefined) continue;

        const entry = newWorkItemHierarchyEntry(parentId, fieldResults[ndx].fields);
        workItemTypes.push(entry.wit);

        const childIds = parentChildMap.get(parentId) || [];
        entry.children = childIds
            .filter(id => fieldIdMap.has(id))
            .map(id => {
                const child = newWorkItemHierarchyEntry(id, fieldResults[fieldIdMap.get(id)!].fields);
                workItemTypes.push(child.wit);
                return child;
            });
        entry.hasChildren = entry.children.length > 0;
        workItemTree.push(entry);
    }

    const uniqueWorkItemTypes = Array.from(new Set(workItemTypes));
    return enrichWorkItemTree(workItemTree, uniqueWorkItemTypes);
}

// Process a "Tree of Work Items" query (queryType 2 in ADO SDK).
// Builds the full tree from workItemRelations, selects items at treeLevel as the display rows,
// then flattens all their descendants into children for the completion bar.
export async function processTreeQuery(queryResults: WorkItemQueryResult, treeLevel: number): Promise<Array<workItemHierachyEntry>> {

    const rootIds: Array<number> = [];
    const childrenMap = new Map<number, Array<number>>();
    const allIds = new Set<number>();

    for (const relation of queryResults.workItemRelations) {
        if (relation.source === null) {
            if (relation.target === null) continue;
            rootIds.push(relation.target.id);
            allIds.add(relation.target.id);
        } else if (relation.rel === "System.LinkTypes.Hierarchy-Forward") {
            if (relation.target === null) continue;
            const parentId = relation.source.id;
            const childId = relation.target.id;
            allIds.add(parentId);
            allIds.add(childId);
            if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
            childrenMap.get(parentId)!.push(childId);
        }
    }

    function getItemsAtLevel(ids: Array<number>, current: number, target: number): Array<number> {
        if (current === target) return ids;
        const next: Array<number> = [];
        for (const id of ids) next.push(...(childrenMap.get(id) || []));
        if (next.length === 0) return ids;
        return getItemsAtLevel(next, current + 1, target);
    }

    // Visited-set guard against cyclic Hierarchy-Forward links. Real ADO
    // tree queries shouldn't cycle (the parent/child link is structurally a
    // DAG), but a malformed fixture or future custom link wiring would
    // stack-overflow this helper without it.
    function getAllDescendants(id: number, visited: Set<number> = new Set()): Array<number> {
        if (visited.has(id)) return [];
        visited.add(id);
        const children = childrenMap.get(id) || [];
        const result: Array<number> = [];
        for (const child of children) {
            if (visited.has(child)) continue;
            result.push(child);
            result.push(...getAllDescendants(child, visited));
        }
        return result;
    }

    const displayIds = getItemsAtLevel(rootIds, 1, treeLevel);
    const fieldsRequest = createWorkItemBatchRequest(queryResults.asOf, WorkItemExpand.None, Array.from(allIds));
    const fieldResults: Array<WorkItem> = await getWorkItems(fieldsRequest);

    const fieldIdMap = new Map<number, number>();
    for (let i = 0; i < fieldResults.length; i++) fieldIdMap.set(fieldResults[i].id, i);

    const workItemTree: Array<workItemHierachyEntry> = [];
    const workItemTypes: Array<string> = [];

    for (const parentId of displayIds) {
        const ndx = fieldIdMap.get(parentId);
        if (ndx === undefined) continue;

        const entry = newWorkItemHierarchyEntry(parentId, fieldResults[ndx].fields);
        workItemTypes.push(entry.wit);

        entry.children = getAllDescendants(parentId)
            .filter(id => fieldIdMap.has(id))
            .map(id => {
                const child = newWorkItemHierarchyEntry(id, fieldResults[fieldIdMap.get(id)!].fields);
                workItemTypes.push(child.wit);
                return child;
            });
        entry.hasChildren = entry.children.length > 0;
        workItemTree.push(entry);
    }

    const uniqueWorkItemTypes = Array.from(new Set(workItemTypes));
    return enrichWorkItemTree(workItemTree, uniqueWorkItemTypes);
}

// work item categories — Resolved sits between Completed and InProgress
// (workflow-wise: Active → Resolved → Closed; visually we keep "done" things
// near the start so the bar reads completed-first). Bug WITs in the default
// Agile process have Resolved states; without listing it here, Resolved
// segments would sort to position 0 (indexOf=-1) and render at the visual
// start of the bar, ahead of Completed.
const stateCategoriesCompletedFirst = ["Completed", "Resolved", "InProgress", "Proposed", "Removed"];
const stateCategoriesProposedFirst = ["Proposed", "InProgress", "Completed", "Removed"];
const stateCategoriesInProgressFirst = ["InProgress", "Proposed", "Completed", "Removed"];

// sort state categories by state category name
function stateCategoriesByCategory (first: stateCategoryColorSize, second: stateCategoryColorSize) {
    return stateCategoriesCompletedFirst.indexOf(first.stateCategory) - stateCategoriesCompletedFirst.indexOf(second.stateCategory);
}

// Builds legend data for the rendered bars: one swatch per category that
// actually appears in any row's bar segments (size > 0). Color is the
// first-encountered stateColor for that category — matches what bars display
// when a multi-WIT query has WITs that disagree on a category color (rare in
// practice; same-process-template WITs share colors). Returns categories in
// canonical bar-segment order (Completed first), filtered to those present.
//
// The hardcoded Agile-process colors that used to live in Widget.tsx had no
// correspondence to anything actually rendered on custom process templates;
// custom-template states can be any color and the legend was always the
// Agile-process defaults regardless.
export function buildLegendData(results: Array<workItemHierachyEntry>): Array<{stateCategory: string, stateColor: string}> {
    const seen = new Map<string, string>();
    for (const parent of results) {
        for (const cat of parent.parentStateCategories) {
            if (cat.size > 0 && !seen.has(cat.stateCategory)) {
                seen.set(cat.stateCategory, cat.stateColor);
            }
        }
    }
    return stateCategoriesCompletedFirst
        .filter(c => seen.has(c))
        .map(c => ({ stateCategory: c, stateColor: seen.get(c)! }));
}

// sort work items by state category, Completed first
export function workItemsByStateCategoryCompletedFirst (first : workItemHierachyEntry, second: workItemHierachyEntry) {
    return stateCategoriesCompletedFirst.indexOf(first.stateCategory) - stateCategoriesCompletedFirst.indexOf(second.stateCategory);
}

// sort work items by state category, Proposed first
export function workItemsByStateCategoryProposedFirst (first : workItemHierachyEntry, second: workItemHierachyEntry) {
    return stateCategoriesProposedFirst.indexOf(first.stateCategory) - stateCategoriesProposedFirst.indexOf(second.stateCategory) ||
            first.priority - second.priority || first.id - second.id;
}

// sort work items by state category, InProgress first
export function workItemsByStateCategoryInProgressFirst (first : workItemHierachyEntry, second: workItemHierachyEntry) {
    return stateCategoriesInProgressFirst.indexOf(first.stateCategory) - stateCategoriesInProgressFirst.indexOf(second.stateCategory) ||
            first.priority - second.priority || first.id - second.id;
}

// sort work items by backlog priority, then id (ADO priority sort method)
export function workItemsByPriority (first : workItemHierachyEntry, second: workItemHierachyEntry) {
    return first.priority - second.priority || first.id - second.id;
}

interface WitSizeAverage {wit: string, count: number, unsized: number, sizedTotal: number, average: number};

// calculates average size for each work item type for use with unsized items
function witAverages (uniqueWorkItemTypes: Array<string>, workItemTree: Array<workItemHierachyEntry>) {
    let witSizeAverages: Array<WitSizeAverage> = uniqueWorkItemTypes.map(wit => { return {wit: wit, count: 0, unsized: 0, sizedTotal: 0, average: 0 };})

    for (let parent of workItemTree) {
        processWorkItem (witSizeAverages[uniqueWorkItemTypes.indexOf(parent.wit)], parent);

        for (let child of parent.children) {
            processWorkItem (witSizeAverages[uniqueWorkItemTypes.indexOf(child.wit)], child);
        }
    }

    for (let ndx in witSizeAverages) {
        let sizedCount = witSizeAverages[ndx].count - witSizeAverages[ndx].unsized;
        if (sizedCount > 0) {
            witSizeAverages[ndx].average = witSizeAverages[ndx].sizedTotal / sizedCount;
        } else {
            witSizeAverages[ndx].average = 1;
        }
    }

    for (let parentNdx in workItemTree) {
        for (let childNdx in workItemTree[parentNdx].children) {
            if (workItemTree[parentNdx].children[childNdx].unsized) {
                let witNdx = uniqueWorkItemTypes.indexOf(workItemTree[parentNdx].children[childNdx].wit);
                workItemTree[parentNdx].children[childNdx].size = witSizeAverages[witNdx].average;
            }
        }
    }
    return;
}

function processWorkItem (witSizeAverage: WitSizeAverage, thisWorkItemHierachyEntry: workItemHierachyEntry) {
    witSizeAverage.count++;
    if (thisWorkItemHierachyEntry.unsized) {
        witSizeAverage.unsized += 1;
    } else {
        witSizeAverage.sizedTotal += thisWorkItemHierachyEntry.size;
    }
}
