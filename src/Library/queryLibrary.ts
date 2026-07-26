import { getRootQueries, getQueryItem, getQueryResults } from "./adoLibrary";

// Type-only import: jest.config.js maps azure-devops-extension-api/* to an
// empty AMD stub, so a value import here would resolve to nothing under Jest.
// `import type` is erased at compile time and never reaches the module graph.
import type { QueryHierarchyItem } from "azure-devops-extension-api/WorkItemTracking";

export interface queryListEntry { text: string, id: string };
export interface queryItem { id: string, name: string };
export interface queryFolder { id: string, name: string, children: Array<queryFolder | queryItem> };

function compare(a: queryListEntry, b: queryListEntry): number {
    if (a.text < b.text) return -1;
    if (a.text > b.text) return 1;
    return 0;
}

// Locale-aware, case-insensitive sort by .name. Used to alphabetize queries
// and folders within each level of the streamed tree (matching MS native
// query-picker behavior; previously emitted in ADO-return order which often
// looked random to users).
function byName(a: { name?: string }, b: { name?: string }): number {
    return String(a?.name || "").localeCompare(String(b?.name || ""), undefined, { sensitivity: "base" });
}

async function collectQueries(items: Array<QueryHierarchyItem>, result: Array<queryListEntry>): Promise<void> {
    for (const item of items) {
        if (item.isPublic === false) continue;
        if (item.isFolder) {
            if (!item.hasChildren) continue;
            let children: Array<QueryHierarchyItem> = item.children || [];
            if (children.length === 0) {
                const folder = await getQueryItem(item.id);
                children = folder?.children || [];
            }
            await collectQueries(children, result);
        } else if (item.queryType === 1 || item.queryType === 2 || item.queryType === 3) {
            const text = item.path.replace(/^Shared Queries\//, '');
            result.push({ text, id: item.id });
        }
    }
}

async function buildQueryTree(items: Array<QueryHierarchyItem>, result: Array<queryFolder | queryItem>): Promise<void> {
    const subfolders: Array<QueryHierarchyItem> = [];
    for (const item of items) {
        if (item.isPublic === false) continue;
        if (item.isFolder) {
            if (item.hasChildren) subfolders.push(item);
        } else if (item.queryType === 1 || item.queryType === 2 || item.queryType === 3) {
            result.push({ id: item.id, name: item.name });
        }
    }
    for (const item of subfolders) {
        let children: Array<QueryHierarchyItem> = item.children || [];
        if (children.length === 0) {
            const folder = await getQueryItem(item.id);
            children = folder?.children || [];
        }
        const folderEntry: queryFolder = { id: item.id, name: item.name, children: [] };
        await buildQueryTree(children, folderEntry.children);
        if (folderEntry.children.length > 0) result.push(folderEntry);
    }
}

export async function getQueries(): Promise<Array<queryListEntry>> {
    const queries = await getRootQueries();
    const result: Array<queryListEntry> = [];
    await collectQueries(queries, result);
    return result.sort(compare);
}

export async function getQueryType(queryId: string): Promise<number> {
    const item = await getQueryItem(queryId);
    return item?.queryType ?? 1;
}

export async function getTreeQueryDepth(queryId: string): Promise<number> {
    const results = await getQueryResults(queryId);
    const childrenMap = new Map<number, Array<number>>();
    const rootIds: Array<number> = [];

    for (const relation of results.workItemRelations || []) {
        if (relation.source === null) {
            rootIds.push(relation.target.id);
        } else if (relation.rel === "System.LinkTypes.Hierarchy-Forward") {
            const parentId = relation.source.id;
            const childId = relation.target.id;
            if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
            childrenMap.get(parentId)!.push(childId);
        }
    }

    function maxDepth(id: number): number {
        const children = childrenMap.get(id) || [];
        if (children.length === 0) return 1;
        return 1 + Math.max(...children.map(maxDepth));
    }

    return rootIds.length === 0 ? 1 : Math.max(...rootIds.map(maxDepth));
}

export async function getQueryFolders(): Promise<Array<queryFolder | queryItem>> {
    const queries = await getRootQueries();
    const result: Array<queryFolder | queryItem> = [];
    await buildQueryTree(queries, result);
    // Unwrap the top-level "Shared Queries" folder — it is always the root container
    if (result.length === 1 && 'children' in result[0]) {
        return (result[0] as queryFolder).children;
    }
    return result;
}

export type QueryStreamEvent =
    | { type: 'folder',      topId: string | null, parentChain: string[], depth: number, id: string, name: string }
    | { type: 'query',       topId: string | null, parentChain: string[], depth: number, id: string, name: string }
    // topId=null → initial top-level structure has been emitted; topId=<id> → that
    // top-level folder's subtree is fully loaded. Consumers can flush UI state at
    // these boundaries to avoid flashing on every individual event.
    | { type: 'folder-done', topId: string | null };

// Streams the Shared Queries tree to a callback, emitting events as each folder resolves.
// Top-level folders fetch their contents in parallel; within a subtree the walk is DFS/sequential
// so options appear in a stable order inside each optgroup. If priorityQueryId is supplied and
// its containing folder is visible in the initial depth-2 response, that folder is walked first
// and awaited before the others start — so returning users see their saved query populate
// quickly even when it lives deep in an alphabetically-late folder.
export async function streamQueryFolders(
    onEvent: (event: QueryStreamEvent) => void,
    priorityQueryId?: string
): Promise<void> {
    console.time("VR:streamQueryFolders:total");
    console.time("VR:streamQueryFolders:rootCall");
    const queries = await getRootQueries();
    console.timeEnd("VR:streamQueryFolders:rootCall");
    let items = queries.filter(q => q.isPublic !== false);
    if (items.length === 1 && items[0].isFolder && items[0].hasChildren) {
        items = items[0].children || [];
    }

    // First pass: collect top-level queries and folders, then sort each
    // alphabetically (matching MS native widgets' convention) before emitting.
    // Queries-before-folders ordering is preserved across the categories.
    const topQueries: Array<QueryHierarchyItem> = [];
    const topFolders: Array<QueryHierarchyItem> = [];
    for (const item of items) {
        if (item.isPublic === false) continue;
        if (item.isFolder) {
            if (!item.hasChildren) continue;
            topFolders.push(item);
        } else if (item.queryType === 1 || item.queryType === 2 || item.queryType === 3) {
            topQueries.push(item);
        }
    }
    topQueries.sort(byName);
    topFolders.sort(byName);
    for (const item of topQueries) {
        onEvent({ type: 'query', topId: null, parentChain: [], depth: 0, id: item.id, name: item.name });
    }

    // Create optgroups up-front so they appear in source order
    for (const folder of topFolders) {
        onEvent({ type: 'folder', topId: null, parentChain: [], depth: 0, id: folder.id, name: folder.name });
    }

    // Signal that the initial top-level structure is fully emitted — consumers can
    // render empty folders now while their contents stream in.
    onEvent({ type: 'folder-done', topId: null });
    console.log(`VR:streamQueryFolders:topFolders count=${topFolders.length}`);

    // Priority-folder optimization: walk the folder containing the user's saved
    // query first. With depth=1 root call (see adoLibrary.getRootQueries), the
    // top-level folders arrive without children pre-loaded — containsQueryId
    // returns false because folder.children is empty — so this block is a no-op
    // unless future code pre-fetches contents to find the priority folder. Kept
    // intact so the optimization re-engages automatically if the depth or pre-
    // fetch strategy ever changes.
    let priorityFolder: QueryHierarchyItem | undefined = undefined;
    if (priorityQueryId) {
        priorityFolder = topFolders.find(f => containsQueryId(f, priorityQueryId));
        if (priorityFolder) {
            await walkSubtree(priorityFolder.children || [], priorityFolder.id, 1, [], onEvent);
            onEvent({ type: 'folder-done', topId: priorityFolder.id });
        }
    }

    // Fetch each top-level folder's children (parallel) before walking. With
    // initial depth=1, folder.children is empty for every top-level folder —
    // we need an explicit getQueryItem() per folder to load contents. The walk
    // happens immediately after each folder's contents arrive; folder-done
    // fires per folder so the UI can show each subtree as it lands.
    //
    // Per-folder error isolation: each folder's walk is wrapped in try/catch
    // so a single getQueryItem() failure (transient network, ADO 503,
    // permission edge case) doesn't reject the whole Promise.all and lose
    // queries from every folder that DID load successfully. folder-done is
    // emitted in the catch block too so the UI's per-folder skeleton state
    // doesn't get stuck waiting forever on a folder that errored.
    console.time("VR:streamQueryFolders:parallelWalk");
    let perFolderFetchCount = 0;
    let perFolderErrorCount = 0;
    await Promise.all(
        topFolders
            .filter(f => f !== priorityFolder)
            .map(async folder => {
                try {
                    let children: Array<QueryHierarchyItem> = folder.children || [];
                    if (children.length === 0) {
                        perFolderFetchCount++;
                        const fetched = await getQueryItem(folder.id);
                        children = fetched?.children || [];
                    }
                    await walkSubtree(children, folder.id, 1, [], onEvent);
                } catch (err) {
                    perFolderErrorCount++;
                    console.warn(`VR:streamQueryFolders: folder "${folder?.name ?? folder?.id}" failed to load — skipping its subtree`, err);
                } finally {
                    onEvent({ type: 'folder-done', topId: folder.id });
                }
            })
    );
    console.timeEnd("VR:streamQueryFolders:parallelWalk");
    console.log(`VR:streamQueryFolders:perFolderFetchCount=${perFolderFetchCount} (top-level folders that needed an extra round trip because depth=1 didn't pre-load their children)`);
    if (perFolderErrorCount > 0) {
        console.warn(`VR:streamQueryFolders:perFolderErrorCount=${perFolderErrorCount} (top-level folders whose subtrees failed to load — see prior warnings for which)`);
    }
    console.timeEnd("VR:streamQueryFolders:total");
}

function containsQueryId(item: QueryHierarchyItem, queryId: string): boolean {
    if (!item) return false;
    if (!item.isFolder) return item.id === queryId;
    if (!item.children) return false;
    return item.children.some(c => containsQueryId(c, queryId));
}

// Emits all queries at this level before any sub-folders, so queries always appear
// directly under the folder that contains them (rather than getting pushed below
// a large sub-folder's contents).
async function walkSubtree(
    items: Array<QueryHierarchyItem>,
    topId: string,
    depth: number,
    parentChain: string[],
    onEvent: (event: QueryStreamEvent) => void
): Promise<void> {
    // Collect queries and sub-folders, sort each alphabetically, then emit in
    // queries-before-folders order. Sorting matches MS native widget behavior;
    // queries-before-folders preserves the existing UX where queries always
    // appear directly under their parent folder rather than getting pushed
    // below a large sub-folder's contents.
    const queries: Array<QueryHierarchyItem> = [];
    const subFolders: Array<QueryHierarchyItem> = [];
    for (const item of items) {
        if (item.isPublic === false) continue;
        if (item.isFolder) {
            if (item.hasChildren) subFolders.push(item);
        } else if (item.queryType === 1 || item.queryType === 2 || item.queryType === 3) {
            queries.push(item);
        }
    }
    queries.sort(byName);
    subFolders.sort(byName);
    for (const item of queries) {
        onEvent({ type: 'query', topId, parentChain, depth, id: item.id, name: item.name });
    }
    for (const item of subFolders) {
        onEvent({ type: 'folder', topId, parentChain, depth, id: item.id, name: item.name });
        let children: Array<QueryHierarchyItem> = item.children || [];
        if (children.length === 0) {
            const folder = await getQueryItem(item.id);
            children = folder?.children || [];
        }
        await walkSubtree(children, topId, depth + 1, [...parentChain, item.id], onEvent);
    }
}
