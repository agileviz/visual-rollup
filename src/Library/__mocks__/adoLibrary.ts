import { QueryHierarchyItem, WorkItemQueryResult, WorkItemBatchGetRequest, WorkItem, WorkItemStateColor } from "azure-devops-extension-api/WorkItemTracking";

import { rawRootQueries, evenMoreQueries,
    workItemTypeStatesFeature, workItemTypeStatesPBI, queryType1Results,
    queryType2Results, queryType4Results, relatedQueryType1Results, fieldsBatchRequestResults,
    treeQueryResults, treeQueryFieldResults } from "../queryLibrary.data";

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


// get the root queries and their children from ADO
export async function getRootQueries() : Promise<Array<QueryHierarchyItem>> {
    return (rawRootQueries as Array<QueryHierarchyItem>);
}

// Wrapped in jest.fn so individual tests can override behavior per-call
// (e.g., mockRejectedValueOnce to exercise streamQueryFolders' per-folder
// error-isolation catch path). Default implementation matches the original
// auto-mock — returns evenMoreQueries for every queryID.
export const getQueryItem = jest.fn(async <T>(_queryID: string): Promise<T> => {
    return evenMoreQueries as T;
});

// get query results (data) given query ID
export async function getQueryResults (id : string) : Promise<WorkItemQueryResult> {
    if (id === "fake-type-1-qiery-id") {
        return queryType1Results;
    } else if (id === "fake-type-2-qiery-id") {
        return queryType2Results;
    } else if (id === "fake-type-4-qiery-id") {
        return queryType4Results;
    } else if (id === "fake-tree-qiery-id") {
        return treeQueryResults;
    }
    return {} as WorkItemQueryResult;
}

// Tree-fixture id sentinel: tree-query work items use IDs ≥100 (existing
// queryType1/queryType2 fixtures use 1–9). When a getWorkItems batch contains
// any tree-fixture id, route to treeQueryFieldResults — and filter to the
// requested subset, so tests modeling missing parents (orphan child branches)
// naturally see fewer fields than relations referenced.
const treeFixtureIdSet = new Set<number>(treeQueryFieldResults.map(wi => wi.id));

// get a batch of up to 200 work items given work item IDs
export async function getWorkItems (workItemRequest: WorkItemBatchGetRequest, project?: string) : Promise<Array<WorkItem>> {

    // Empty-ids early return — keeps the empty-tree test quiet (no
    // "new data needed for adoLibrary mock?" warning) and matches what
    // a real ADO batch endpoint would do for an empty id list.
    if (workItemRequest.ids.length === 0) {
        return [];
    }

    if (workItemRequest.$expand === WorkItemExpand.Relations &&
        workItemRequest.fields.length == 0 && workItemRequest.ids.length == 2) {
            return relatedQueryType1Results;
    }

    if (workItemRequest.$expand === WorkItemExpand.None && workItemRequest.fields.length > 0) {
        // Tree-fixture path — covers all processTreeQuery tests, including
        // orphan-parent variants whose relations include ids absent from
        // treeQueryFieldResults (those fall out of the filter naturally).
        if (workItemRequest.ids.some(id => treeFixtureIdSet.has(id))) {
            const requested = new Set<number>(workItemRequest.ids);
            return treeQueryFieldResults.filter(wi => requested.has(wi.id));
        }
        if (workItemRequest.ids.length == 9) {
            return fieldsBatchRequestResults;
        }
    }
    // return empty string for cases we don't know about
    console.log ('getWorkItems: returning [], new data needed for adoLibrary mock?');
    return [];
}

// get definition of a single work item type's states (small payload, includes each state's name, category, and color)
export async function getWorkItemTypeStates (wit : string) : Promise<Array<WorkItemStateColor>> {
    if (wit == "Feature") {
        return workItemTypeStatesFeature as Array<WorkItemStateColor>
    }
    if (wit == "Product Backlog Item") {
        return workItemTypeStatesPBI as Array<WorkItemStateColor>
    }
    return workItemTypeStatesPBI as Array<WorkItemStateColor>
}

