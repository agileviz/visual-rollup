import * as SDK from "azure-devops-extension-sdk";

import { QueryHierarchyItem, WorkItemTrackingRestClient, QueryExpand,
        WorkItemQueryResult, WorkItemBatchGetRequest, WorkItem, WorkItemStateColor } from "azure-devops-extension-api/WorkItemTracking";

import { getClient, IProjectInfo, IProjectPageService, CommonServiceIds } from 'azure-devops-extension-api/Common';

// Typed as always-defined rather than `| undefined`: every exported entrypoint
// awaits ensureProject() before touching these, and ensureProject() throws
// rather than leaving `project` unset. Modelling the optional case here would
// only push non-null assertions out to every call site.
let projectInfoService : IProjectPageService;
let project : IProjectInfo;
let workItemTrackingRestClient : WorkItemTrackingRestClient;

// sessionStorage-backed cache for the folder-tree API calls so reopening the
// widget config in the same browser session reuses the previously-fetched tree
// instead of paying the full walk each time. 5-minute TTL keeps the data fresh
// enough that a user who just created a new query will see it after a brief wait.
const CACHE_PREFIX = "vqw-cache-";
const CACHE_TTL_MS = 5 * 60 * 1000;

function cacheGet<T>(key: string): T | null {
    try {
        const raw = sessionStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL_MS) {
            sessionStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
        return data as T;
    } catch { return null; }
}

function cacheSet<T>(key: string, data: T): void {
    try {
        sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ts: Date.now(), data }));
    } catch { /* quota exceeded or privacy mode — silently skip */ }
}

async function ensureProject(): Promise<void> {
    if (project && workItemTrackingRestClient) return;
    projectInfoService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    const fetchedProject = await projectInfoService.getProject();
    if (typeof fetchedProject === "undefined") {
        throw new Error("Project is undefined");
    }
    project = fetchedProject;
    workItemTrackingRestClient = getClient(WorkItemTrackingRestClient);
}

// get the organization and project names for building work item URLs
export async function getOrgAndProject(): Promise<{orgName: string, projectName: string}> {
    const orgName = SDK.getHost().name;
    const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    const project = await projectService.getProject();
    return { orgName, projectName: project?.name || "" };
}

// get the root queries and their children from ADO
export async function getRootQueries() : Promise<Array<QueryHierarchyItem>> {
    try {
        await ensureProject();
    } catch {
        console.error("getRootQueries: project is undefined");
        return [];
    }

    const cacheKey = `roots-${project.id}`;
    const cached = cacheGet<Array<QueryHierarchyItem>>(cacheKey);
    if (cached) return cached;

    // QueryExpand: None, Wiql, Clauses, All, Minimal.
    //
    // Depth=1 (was 2): fetch ONLY the top-level folder names in this initial
    // blocking call, not their children. In projects with many top-level
    // folders (observed: 145), depth=2 forces ADO to serialize every folder's
    // immediate contents into one big response, which dominates first-paint
    // time. With depth=1 the user sees folder placeholders almost immediately;
    // streamQueryFolders() then fires per-folder getQueryItem() calls in
    // parallel (Promise.all in queryLibrary.ts) to fill in the contents. Each
    // of those getQueryItem() calls uses depth=2 — the max ADO allows; higher
    // returns 400 "depth outside permissible range: 0 to 2" (see comment in
    // getQueryItem below). For trees deeper than 3 levels, walkSubtree's
    // recursive lazy-fetch fallback kicks in to reach the leaves.
    const queries = await workItemTrackingRestClient.getQueries(project.id, QueryExpand.None, 1, false);
    cacheSet(cacheKey, queries);
    return queries as Array<QueryHierarchyItem>;
}

// get a query and it's children from ADO, to build complete tree
//
// The type parameter was previously *named* QueryHierarchyItem, which shadowed
// the imported interface of the same name and made this function return whatever
// the caller asked for, unchecked — which is why call sites pass <any>. Renamed
// to T and defaulted to the real QueryHierarchyItem so the shadowing is gone
// without changing any call site. The `as T` is the remaining seam: callers can
// still name a type the payload was never checked against. Dropping the generic
// entirely (and the <any> at the four call sites in queryLibrary.ts) is the real
// fix and belongs with the wider no-explicit-any pass.
export async function getQueryItem<T = QueryHierarchyItem>(queryID :string) : Promise<T> {
    await ensureProject();

    const cacheKey = `item-${project.id}-${queryID}`;
    const cached = cacheGet<T>(cacheKey);
    if (cached) return cached;

    // Depth=2 is the MAXIMUM ADO accepts for this parameter (TF400898 / "depth
    // outside permissible range: 0 to 2" if you try higher). Empirically
    // verified 2026-05-09 — depth=4 returned a 400. So this is the deepest
    // single-fetch we can do per folder; trees deeper than (root depth=1) +
    // (per-folder depth=2) = 3 levels need walkSubtree's recursive lazy-fetch
    // fallback to reach the leaves.
    const item = await workItemTrackingRestClient.getQuery(project.id, queryID, QueryExpand.None, 2, false);
    cacheSet(cacheKey, item);
    return item as T;
}

// get query results (data) given query ID
export async function getQueryResults (id : string) : Promise<WorkItemQueryResult> {

    workItemTrackingRestClient = getClient(WorkItemTrackingRestClient);

    // todo: other parameters needed? function queryById(id: string, project?: string, team?: string, timePrecision?: boolean, top?: number);
    return workItemTrackingRestClient.queryById(id);
}

const WORK_ITEM_BATCH_LIMIT = 200;

// Fetch work items in batches of 200 (ADO API limit per request), in parallel.
export async function getWorkItems (workItemRequest: WorkItemBatchGetRequest) : Promise<Array<WorkItem>> {
    workItemTrackingRestClient = getClient(WorkItemTrackingRestClient);
    const ids = workItemRequest.ids;

    // ADO's workItemsBatch endpoint rejects empty id arrays with 400 Bad Request.
    // Short-circuit so a query that returns no results doesn't crash the widget.
    if (ids.length === 0) return [];

    if (ids.length <= WORK_ITEM_BATCH_LIMIT) {
        return workItemTrackingRestClient.getWorkItemsBatch(workItemRequest);
    }

    const chunks: Array<Promise<Array<WorkItem>>> = [];
    for (let i = 0; i < ids.length; i += WORK_ITEM_BATCH_LIMIT) {
        chunks.push(workItemTrackingRestClient.getWorkItemsBatch({
            ...workItemRequest,
            ids: ids.slice(i, i + WORK_ITEM_BATCH_LIMIT)
        }));
    }
    const results = await Promise.all(chunks);
    return ([] as Array<WorkItem>).concat(...results);
}

// get definition of a single work item type's states (small payload, includes each state's name, category, and color)
export async function getWorkItemTypeStates (wit : string) : Promise<Array<WorkItemStateColor>> {

    const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    let project = await projectService.getProject();
    if (typeof project === "undefined") project = {name: "", id: ""};
    const workItemTrackingRestClient = getClient(WorkItemTrackingRestClient);

    return workItemTrackingRestClient.getWorkItemTypeStates(project.id, wit);
}

