import { QueryHierarchyItem, WorkItem, WorkItemQueryResult, WorkItemStateColor } from "azure-devops-extension-api/WorkItemTracking";
import { workItemHierachyEntry } from "./queryResultsLibrary";

export const rawRootQueries : Array<QueryHierarchyItem> = JSON.parse (
`[
    {
      "id": "ae471a2d-92bf-45c1-9b40-1f5d7776d287",
      "name": "Shared Queries",
      "path": "Shared Queries",
      "createdDate": "2020-09-23T22:03:28.877Z",
      "lastModifiedBy": {
        "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
        "name": "Richard Mouser <rmouser@live.com>",
        "displayName": "Richard Mouser",
        "uniqueName": "rmouser@live.com",
        "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
      },
      "lastModifiedDate": "2020-09-23T22:03:28.877Z",
      "isFolder": true,
      "hasChildren": true,
      "children": [
        {
          "id": "0752c7f7-7785-49b6-ab53-eabad74a601d",
          "name": "Work items that we care about a lot more",
          "path": "Shared Queries/Work items that we care about a lot more",
          "createdBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "createdDate": "2020-09-23T22:06:31.280Z",
          "lastModifiedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastModifiedDate": "2020-09-23T22:06:31.280Z",
          "queryType": 2,
          "isPublic": true,
          "lastExecutedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastExecutedDate": "2020-09-23T22:06:31.763Z"
        },
        {
          "id": "407191f5-f7bd-4cc4-9e4c-c204473b8541",
          "name": "Work items that we care about a whole lot more",
          "path": "Shared Queries/Work items that we care about a whole lot more",
          "createdBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "createdDate": "2020-09-23T22:06:40.037Z",
          "lastModifiedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastModifiedDate": "2020-09-23T22:06:40.037Z",
          "queryType": 2,
          "isPublic": true,
          "lastExecutedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastExecutedDate": "2020-09-23T22:06:40.263Z"
        },
        {
          "id": "9c1adcf7-5a74-40d8-9ddb-9e9a8ecaa3c0",
          "name": "More Queries",
          "path": "Shared Queries/More Queries",
          "createdBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "createdDate": "2020-09-24T04:04:35.697Z",
          "lastModifiedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastModifiedDate": "2020-09-24T04:04:35.697Z",
          "isFolder": true,
          "hasChildren": true,
          "children": [
            {
              "id": "c01a9ec8-9cb2-4aea-8522-fabe615a014b",
              "name": "Features and Children Query",
              "path": "Shared Queries/More Queries/Features and Children Query",
              "createdDate": "2020-09-24T04:05:35.040Z",
              "lastModifiedBy": {
                "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
                "name": "Richard Mouser <rmouser@live.com>",
                "displayName": "Richard Mouser",
                "uniqueName": "rmouser@live.com",
                "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
              },
              "lastModifiedDate": "2020-09-24T04:06:03.600Z",
              "queryType": 3,
              "isPublic": true,
              "lastExecutedBy": {
                "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
                "name": "Richard Mouser <rmouser@live.com>",
                "displayName": "Richard Mouser",
                "uniqueName": "rmouser@live.com",
                "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
              },
              "lastExecutedDate": "2020-09-24T04:06:03.790Z"
            },
            {
              "id": "89626995-3d87-48ca-93f1-6e3c9c5cfbba",
              "name": "Even More Queries",
              "path": "Shared Queries/More Queries/Even More Queries",
              "createdBy": {
                "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
                "name": "Richard Mouser <rmouser@live.com>",
                "displayName": "Richard Mouser",
                "uniqueName": "rmouser@live.com",
                "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
              },
              "createdDate": "2020-09-24T04:06:53.557Z",
              "lastModifiedBy": {
                "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
                "name": "Richard Mouser <rmouser@live.com>",
                "displayName": "Richard Mouser",
                "uniqueName": "rmouser@live.com",
                "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
              },
              "lastModifiedDate": "2020-09-24T04:06:53.557Z",
              "isFolder": true,
              "hasChildren": true,
              "isPublic": true
            },
            {
              "id": "12c427bb-625f-48e5-802e-66b28acee7c2",
              "name": "Epics and Features Query",
              "path": "Shared Queries/More Queries/Epics and Features Query",
              "createdDate": "2020-09-24T04:06:21.247Z",
              "lastModifiedBy": {
                "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
                "name": "Richard Mouser <rmouser@live.com>",
                "displayName": "Richard Mouser",
                "uniqueName": "rmouser@live.com",
                "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
              },
              "lastModifiedDate": "2020-09-24T04:06:34.133Z",
              "queryType": 3,
              "isPublic": true,
              "lastExecutedBy": {
                "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
                "name": "Richard Mouser <rmouser@live.com>",
                "displayName": "Richard Mouser",
                "uniqueName": "rmouser@live.com",
                "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
              },
              "lastExecutedDate": "2020-09-24T04:06:35.313Z"
            }
          ],
          "isPublic": true
        },
        {
          "id": "cda04b6c-519a-4de7-ba1e-9c9adee2f643",
          "name": "Work items that we care about a lot",
          "path": "Shared Queries/Work items that we care about a lot",
          "createdBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "createdDate": "2020-09-23T22:06:24.643Z",
          "lastModifiedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastModifiedDate": "2020-09-23T22:06:24.643Z",
          "queryType": 2,
          "isPublic": true,
          "lastExecutedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastExecutedDate": "2020-09-23T22:06:25.050Z"
        },
        {
          "id": "27503d20-2eff-4bce-ae30-91d4ad361f8a",
          "name": "Work items that we care about more",
          "path": "Shared Queries/Work items that we care about more",
          "createdBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "createdDate": "2020-09-23T22:06:14.677Z",
          "lastModifiedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastModifiedDate": "2020-09-23T22:06:14.677Z",
          "queryType": 1,
          "isPublic": true,
          "lastExecutedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastExecutedDate": "2020-09-23T22:07:25.167Z"
        },
        {
          "id": "2b7e7e85-2d88-42d9-8d9d-40f65efce9d0",
          "name": "Work items that we care about the most",
          "path": "Shared Queries/Work items that we care about the most",
          "createdBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "createdDate": "2020-09-23T22:07:40.557Z",
          "lastModifiedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastModifiedDate": "2020-09-23T22:07:40.557Z",
          "queryType": 1,
          "isPublic": true,
          "lastExecutedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastExecutedDate": "2020-09-23T22:07:40.803Z"
        },
        {
          "id": "fe1b344c-21e2-43d2-b7c3-1ba26aa063a4",
          "name": "Work items that we care about a little",
          "path": "Shared Queries/Work items that we care about a little",
          "createdBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "createdDate": "2020-09-23T22:06:04.450Z",
          "lastModifiedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastModifiedDate": "2020-09-23T22:06:04.450Z",
          "queryType": 1,
          "isPublic": true,
          "lastExecutedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastExecutedDate": "2020-09-23T22:06:06.273Z"
        },
        {
          "id": "df1de549-09c0-4799-bc12-04682619a730",
          "name": "Work items that we care about the absolutely most",
          "path": "Shared Queries/Work items that we care about the absolutely most",
          "createdBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "createdDate": "2020-09-23T22:07:51.560Z",
          "lastModifiedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastModifiedDate": "2020-09-23T22:07:51.560Z",
          "queryType": 1,
          "isPublic": true,
          "lastExecutedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastExecutedDate": "2020-09-23T22:07:52.400Z"
        }
      ],
      "isPublic": true
    },
    {
      "id": "8e50f918-ab54-4451-85ef-f4f8362672a3",
      "name": "My Queries",
      "path": "My Queries",
      "createdBy": {
        "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
        "name": "Richard Mouser <rmouser@live.com>",
        "displayName": "Richard Mouser",
        "uniqueName": "rmouser@live.com",
        "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
      },
      "createdDate": "2020-09-23T22:03:29.657Z",
      "lastModifiedBy": {
        "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
        "name": "Richard Mouser <rmouser@live.com>",
        "displayName": "Richard Mouser",
        "uniqueName": "rmouser@live.com",
        "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
      },
      "lastModifiedDate": "2020-09-23T22:03:29.657Z",
      "isFolder": true,
      "hasChildren": true,
      "children": [
        {
          "id": "d8de313f-6e9d-4596-a0b4-369865527601",
          "name": "Followed work items",
          "path": "My Queries/Followed work items",
          "createdBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "createdDate": "2020-09-23T22:04:03.983Z",
          "lastModifiedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastModifiedDate": "2020-09-23T22:04:03.983Z",
          "queryType": 1,
          "isPublic": false
        },
        {
          "id": "bf95e639-b197-4ab4-b029-30672b3d219b",
          "name": "Assigned to me",
          "path": "My Queries/Assigned to me",
          "createdBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "createdDate": "2020-09-23T22:04:03.947Z",
          "lastModifiedBy": {
            "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
            "name": "Richard Mouser <rmouser@live.com>",
            "displayName": "Richard Mouser",
            "uniqueName": "rmouser@live.com",
            "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
          },
          "lastModifiedDate": "2020-09-23T22:04:03.947Z",
          "queryType": 1,
          "isPublic": false
        }
      ],
      "isPublic": false
    }
  ]`
 );


export const evenMoreQueries = JSON.parse (
`{
    "id": "89626995-3d87-48ca-93f1-6e3c9c5cfbba",
    "name": "Even More Queries",
    "path": "Shared Queries/More Queries/Even More Queries",
    "createdBy": {
      "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
      "name": "Richard Mouser <rmouser@live.com>",
      "displayName": "Richard Mouser",
      "uniqueName": "rmouser@live.com",
      "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
    },
    "createdDate": "2020-09-24T04:06:53.557Z",
    "lastModifiedBy": {
      "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
      "name": "Richard Mouser <rmouser@live.com>",
      "displayName": "Richard Mouser",
      "uniqueName": "rmouser@live.com",
      "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
    },
    "lastModifiedDate": "2020-09-24T04:06:53.557Z",
    "isFolder": true,
    "hasChildren": true,
    "children": [
      {
        "id": "786c440f-34f7-4e5f-a9c4-a8ac0016704f",
        "name": "First Even More Query",
        "path": "Shared Queries/More Queries/Even More Queries/First Even More Query",
        "createdBy": {
          "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
          "name": "Richard Mouser <rmouser@live.com>",
          "displayName": "Richard Mouser",
          "uniqueName": "rmouser@live.com",
          "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
        },
        "createdDate": "2020-09-24T04:07:16.240Z",
        "lastModifiedBy": {
          "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
          "name": "Richard Mouser <rmouser@live.com>",
          "displayName": "Richard Mouser",
          "uniqueName": "rmouser@live.com",
          "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
        },
        "lastModifiedDate": "2020-09-24T04:07:16.240Z",
        "queryType": 1,
        "isPublic": true,
        "lastExecutedBy": {
          "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
          "name": "Richard Mouser <rmouser@live.com>",
          "displayName": "Richard Mouser",
          "uniqueName": "rmouser@live.com",
          "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
        },
        "lastExecutedDate": "2020-09-24T04:07:16.553Z"
      },
      {
        "id": "0d6c0aba-ed6b-468e-8816-19ecc4a73c7e",
        "name": "Second Even More Query",
        "path": "Shared Queries/More Queries/Even More Queries/Second Even More Query",
        "createdBy": {
          "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
          "name": "Richard Mouser <rmouser@live.com>",
          "displayName": "Richard Mouser",
          "uniqueName": "rmouser@live.com",
          "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
        },
        "createdDate": "2020-09-24T04:07:22.750Z",
        "lastModifiedBy": {
          "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
          "name": "Richard Mouser <rmouser@live.com>",
          "displayName": "Richard Mouser",
          "uniqueName": "rmouser@live.com",
          "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
        },
        "lastModifiedDate": "2020-09-24T04:07:22.750Z",
        "queryType": 1,
        "isPublic": true,
        "lastExecutedBy": {
          "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
          "name": "Richard Mouser <rmouser@live.com>",
          "displayName": "Richard Mouser",
          "uniqueName": "rmouser@live.com",
          "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
        },
        "lastExecutedDate": "2020-09-24T04:07:23.010Z"
      }
    ],
    "isPublic": true
  }`
);

// this is the result for queryType 3 (work items with direct links / OneHop)
export const queryType2Results : WorkItemQueryResult = JSON.parse (
`{
    "queryType": 3,
    "queryResultType": 2,
    "asOf": "2020-10-29T03:14:04.840Z",
    "columns": [
      {
        "referenceName": "System.Id",
        "name": "ID"
      },
      {
        "referenceName": "System.WorkItemType",
        "name": "Work Item Type"
      },
      {
        "referenceName": "System.Title",
        "name": "Title"
      },
      {
        "referenceName": "System.AssignedTo",
        "name": "Assigned To"
      },
      {
        "referenceName": "System.State",
        "name": "State"
      },
      {
        "referenceName": "System.Tags",
        "name": "Tags"
      }
    ],
    "workItemRelations": [
      {
        "rel": null,
        "source": null,
        "target": {
          "id": 1
        }
      },
      {
        "rel": "System.LinkTypes.Hierarchy-Forward",
        "source": {
          "id": 1
        },
        "target": {
          "id": 3
        }
      },
      {
        "rel": "System.LinkTypes.Hierarchy-Forward",
        "source": {
          "id": 1
        },
        "target": {
          "id": 4
        }
      },
      {
        "rel": "System.LinkTypes.Hierarchy-Forward",
        "source": {
          "id": 1
        },
        "target": {
          "id": 5
        }
      },
      {
        "rel": "System.LinkTypes.Hierarchy-Forward",
        "source": {
          "id": 1
        },
        "target": {
          "id": 8
        }
      },
      {
        "rel": null,
        "source": null,
        "target": {
          "id": 2
        }
      },
      {
        "rel": "System.LinkTypes.Hierarchy-Forward",
        "source": {
          "id": 2
        },
        "target": {
          "id": 6
        }
      },
      {
        "rel": "System.LinkTypes.Hierarchy-Forward",
        "source": {
          "id": 2
        },
        "target": {
          "id": 7
        }
      },
      {
        "rel": "System.LinkTypes.Hierarchy-Forward",
        "source": {
          "id": 2
        },
        "target": {
          "id": 9
        }
      }
    ]
  }`
);

// this is the result for queryType 1 (flat list of work items)
export const queryType1Results : WorkItemQueryResult = JSON.parse (
`{
    "queryType": 1,
    "queryResultType": 1,
    "asOf": "2020-10-30T20:40:45.247Z",
    "columns": [
      {
        "referenceName": "System.Id",
        "name": "ID"
      },
      {
        "referenceName": "System.WorkItemType",
        "name": "Work Item Type"
      },
      {
        "referenceName": "System.Title",
        "name": "Title"
      },
      {
        "referenceName": "System.AssignedTo",
        "name": "Assigned To"
      },
      {
        "referenceName": "System.State",
        "name": "State"
      },
      {
        "referenceName": "System.Tags",
        "name": "Tags"
      }
    ],
    "workItems": [
      {
        "id": 1
      },
      {
        "id": 2
      }
    ]
  }`
);

// this is an invalid queryType 4 (to test the check for unknown types of queries in getWorkItemsByQueryID)
export const queryType4Results : WorkItemQueryResult = JSON.parse (
`{
    "queryType": 4,
    "queryResultType": 1,
    "asOf": "2020-10-30T20:40:45.247Z",
    "columns": [
        {
        "referenceName": "System.Id",
        "name": "ID"
        },
        {
        "referenceName": "System.WorkItemType",
        "name": "Work Item Type"
        },
        {
        "referenceName": "System.Title",
        "name": "Title"
        },
        {
        "referenceName": "System.AssignedTo",
        "name": "Assigned To"
        },
        {
        "referenceName": "System.State",
        "name": "State"
        },
        {
        "referenceName": "System.Tags",
        "name": "Tags"
        }
    ],
    "workItems": [
        {
        "id": 1
        },
        {
        "id": 2
        }
    ]
    }`
);

export const relatedQueryType1Results : Array<WorkItem> = JSON.parse (
`[
    {
      "id": 1,
      "rev": 3,
      "fields": {
        "System.AreaPath": "rmouser",
        "System.TeamProject": "rmouser",
        "System.IterationPath": "rmouser\\\\Sprint 1",
        "System.WorkItemType": "Feature",
        "System.State": "New",
        "System.Reason": "New feature",
        "System.CreatedDate": "2020-10-29T01:40:49.090Z",
        "System.CreatedBy": {
          "displayName": "Richard Mouser",
          "url": "https://spsprodcus3.vssps.visualstudio.com/Aa9911993-e6b0-445c-beb6-151a7df8e263/_apis/Identities/89220c3f-a3aa-6197-96f8-12b2033bf730",
          "_links": {
            "avatar": {
              "href": "https://dev.azure.com/rmouser/_apis/GraphProfile/MemberAvatars/msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
            }
          },
          "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
          "uniqueName": "rmouser@live.com",
          "imageUrl": "https://dev.azure.com/rmouser/_apis/GraphProfile/MemberAvatars/msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw",
          "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
        },
        "System.ChangedDate": "2020-10-29T02:17:16.940Z",
        "System.ChangedBy": {
          "displayName": "Richard Mouser",
          "url": "https://spsprodcus3.vssps.visualstudio.com/Aa9911993-e6b0-445c-beb6-151a7df8e263/_apis/Identities/89220c3f-a3aa-6197-96f8-12b2033bf730",
          "_links": {
            "avatar": {
              "href": "https://dev.azure.com/rmouser/_apis/GraphProfile/MemberAvatars/msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
            }
          },
          "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
          "uniqueName": "rmouser@live.com",
          "imageUrl": "https://dev.azure.com/rmouser/_apis/GraphProfile/MemberAvatars/msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw",
          "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
        },
        "System.CommentCount": 0,
        "System.Title": "Allow user to pick a query that returns parent/child work items",
        "Microsoft.VSTS.Common.StateChangeDate": "2020-10-29T01:40:49.090Z",
        "Microsoft.VSTS.Common.Priority": 2,
        "Microsoft.VSTS.Common.ValueArea": "Business",
        "Microsoft.VSTS.Common.BacklogPriority": 999936756
      },
      "relations": [
        {
          "rel": "System.LinkTypes.Hierarchy-Forward",
          "url": "https://dev.azure.com/rmouser/2ee36327-0c75-44cc-9ac2-2444e1785a4a/_apis/wit/workItems/5",
          "attributes": {
            "isLocked": false,
            "name": "Child"
          }
        },
        {
          "rel": "System.LinkTypes.Hierarchy-Forward",
          "url": "https://dev.azure.com/rmouser/2ee36327-0c75-44cc-9ac2-2444e1785a4a/_apis/wit/workItems/8",
          "attributes": {
            "isLocked": false,
            "name": "Child"
          }
        },
        {
          "rel": "System.LinkTypes.Hierarchy-Forward",
          "url": "https://dev.azure.com/rmouser/2ee36327-0c75-44cc-9ac2-2444e1785a4a/_apis/wit/workItems/4",
          "attributes": {
            "isLocked": false,
            "name": "Child"
          }
        },
        {
          "rel": "System.LinkTypes.Hierarchy-Forward",
          "url": "https://dev.azure.com/rmouser/2ee36327-0c75-44cc-9ac2-2444e1785a4a/_apis/wit/workItems/3",
          "attributes": {
            "isLocked": false,
            "name": "Child"
          }
        }
      ],
      "url": "https://dev.azure.com/rmouser/2ee36327-0c75-44cc-9ac2-2444e1785a4a/_apis/wit/workItems/1/revisions/3"
    },
    {
      "id": 2,
      "rev": 2,
      "fields": {
        "System.AreaPath": "rmouser",
        "System.TeamProject": "rmouser",
        "System.IterationPath": "rmouser\\\\Sprint 1",
        "System.WorkItemType": "Feature",
        "System.State": "New",
        "System.Reason": "New feature",
        "System.CreatedDate": "2020-10-29T01:41:35.193Z",
        "System.CreatedBy": {
          "displayName": "Richard Mouser",
          "url": "https://spsprodcus3.vssps.visualstudio.com/Aa9911993-e6b0-445c-beb6-151a7df8e263/_apis/Identities/89220c3f-a3aa-6197-96f8-12b2033bf730",
          "_links": {
            "avatar": {
              "href": "https://dev.azure.com/rmouser/_apis/GraphProfile/MemberAvatars/msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
            }
          },
          "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
          "uniqueName": "rmouser@live.com",
          "imageUrl": "https://dev.azure.com/rmouser/_apis/GraphProfile/MemberAvatars/msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw",
          "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
        },
        "System.ChangedDate": "2020-10-29T01:41:35.970Z",
        "System.ChangedBy": {
          "displayName": "Richard Mouser",
          "url": "https://spsprodcus3.vssps.visualstudio.com/Aa9911993-e6b0-445c-beb6-151a7df8e263/_apis/Identities/89220c3f-a3aa-6197-96f8-12b2033bf730",
          "_links": {
            "avatar": {
              "href": "https://dev.azure.com/rmouser/_apis/GraphProfile/MemberAvatars/msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
            }
          },
          "id": "89220c3f-a3aa-6197-96f8-12b2033bf730",
          "uniqueName": "rmouser@live.com",
          "imageUrl": "https://dev.azure.com/rmouser/_apis/GraphProfile/MemberAvatars/msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw",
          "descriptor": "msa.ODkyMjBjM2YtYTNhYS03MTk3LTk2ZjgtMTJiMjAzM2JmNzMw"
        },
        "System.CommentCount": 0,
        "System.Title": "Show a visual representation of progress on parent/child work items",
        "Microsoft.VSTS.Common.StateChangeDate": "2020-10-29T01:41:35.193Z",
        "Microsoft.VSTS.Common.Priority": 2,
        "Microsoft.VSTS.Common.ValueArea": "Business",
        "Microsoft.VSTS.Common.BacklogPriority": 999968378
      },
      "relations": [
        {
          "rel": "System.LinkTypes.Hierarchy-Forward",
          "url": "https://dev.azure.com/rmouser/2ee36327-0c75-44cc-9ac2-2444e1785a4a/_apis/wit/workItems/9",
          "attributes": {
            "isLocked": false,
            "name": "Child"
          }
        },
        {
          "rel": "System.LinkTypes.Hierarchy-Forward",
          "url": "https://dev.azure.com/rmouser/2ee36327-0c75-44cc-9ac2-2444e1785a4a/_apis/wit/workItems/6",
          "attributes": {
            "isLocked": false,
            "name": "Child"
          }
        },
        {
          "rel": "System.LinkTypes.Hierarchy-Forward",
          "url": "https://dev.azure.com/rmouser/2ee36327-0c75-44cc-9ac2-2444e1785a4a/_apis/wit/workItems/7",
          "attributes": {
            "isLocked": false,
            "name": "Child"
          }
        }
      ],
      "url": "https://dev.azure.com/rmouser/2ee36327-0c75-44cc-9ac2-2444e1785a4a/_apis/wit/workItems/2/revisions/2"
    }
  ]`
);

// this is the result for queries that return hierarchy of work items
export const workItemBatchResults : Array<WorkItem> = JSON.parse(
`[
    {
      "id": 1,
      "rev": 3,
      "fields": {
        "System.Id": 1,
        "System.WorkItemType": "Feature",
        "System.State": "New",
        "System.Title": "Allow user to pick a query that returns parent/child work items"
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/1"
    },
    {
      "id": 2,
      "rev": 2,
      "fields": {
        "System.Id": 2,
        "System.WorkItemType": "Feature",
        "System.State": "New",
        "System.Title": "Show a visual representation of progress on parent/child work items"
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/2"
    },
    {
      "id": 3,
      "rev": 1,
      "fields": {
        "System.Id": 3,
        "System.WorkItemType": "Product Backlog Item",
        "System.State": "New",
        "System.Title": "Get all the shared queries from ADO into a list for selection"
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/3"
    },
    {
      "id": 4,
      "rev": 1,
      "fields": {
        "System.Id": 4,
        "System.WorkItemType": "Product Backlog Item",
        "System.State": "New",
        "System.Title": "Allow user to select a query and store the selection as configuration data"
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/4"
    },
    {
      "id": 5,
      "rev": 1,
      "fields": {
        "System.Id": 5,
        "System.WorkItemType": "Product Backlog Item",
        "System.State": "New",
        "System.Title": "Filter out queries that won't work from the selection list"
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/5"
    },
    {
      "id": 6,
      "rev": 1,
      "fields": {
        "System.Id": 6,
        "System.WorkItemType": "Product Backlog Item",
        "System.State": "New",
        "System.Title": "Get data for the configured query"
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/6"
    },
    {
      "id": 7,
      "rev": 1,
      "fields": {
        "System.Id": 7,
        "System.WorkItemType": "Product Backlog Item",
        "System.State": "New",
        "System.Title": "Draw at least 6 variations on how to visualize the data"
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/7"
    },
    {
      "id": 8,
      "rev": 1,
      "fields": {
        "System.Id": 8,
        "System.WorkItemType": "Product Backlog Item",
        "System.State": "New",
        "System.Title": "Add option to scale graphs to story point sizes"
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/8"
    },
    {
      "id": 9,
      "rev": 1,
      "fields": {
        "System.Id": 9,
        "System.WorkItemType": "Product Backlog Item",
        "System.State": "New",
        "System.Title": "Implement the visualization that most people like best"
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/9"
    }
  ]`
);
// this is the result for queries that return hierarchy of work items
export const workItemTypeStatesFeature : Array<WorkItemStateColor> = JSON.parse(
`[
    {
      "name": "New",
      "color": "b2b2b2",
      "category": "Proposed"
    },
    {
      "name": "In Progress",
      "color": "007acc",
      "category": "InProgress"
    },
    {
      "name": "Done",
      "color": "339933",
      "category": "Completed"
    },
    {
      "name": "Removed",
      "color": "ffffff",
      "category": "Removed"
    }
  ]`
);

// this is the result for queries that return hierarchy of work items
export const workItemTypeStatesPBI : Array<WorkItemStateColor> = JSON.parse(
    `[
        {
          "name": "New",
          "color": "b2b2b2",
          "category": "Proposed"
        },
        {
          "name": "Approved",
          "color": "b2b2b2",
          "category": "Proposed"
        },
        {
          "name": "Committed",
          "color": "007acc",
          "category": "InProgress"
        },
        {
          "name": "Done",
          "color": "339933",
          "category": "Completed"
        },
        {
          "name": "Removed",
          "color": "ffffff",
          "category": "Removed"
        }
      ]`
    );

// this is the query tree used to build the visual before field data is inserted
export const queryTreeEmptyFields : Array<workItemHierachyEntry> = JSON.parse(
`[
    {
      "id": 1,
      "title": "",
      "wit": "",
      "state": "",
      "priority": 0,
      "effort": 0,
      "remainingWork": 0,
      "hasChildren": true,
      "children": [
        {
          "id": 5,
          "title": "",
          "wit": "",
          "state": "",
          "priority": 0,
          "effort": 0,
          "remainingWork": 0,
          "hasChildren": false,
          "children": []
        },
        {
          "id": 8,
          "title": "",
          "wit": "",
          "state": "",
          "priority": 0,
          "effort": 0,
          "remainingWork": 0,
          "hasChildren": false,
          "children": []
        },
        {
          "id": 4,
          "title": "",
          "wit": "",
          "state": "",
          "priority": 0,
          "effort": 0,
          "remainingWork": 0,
          "hasChildren": false,
          "children": []
        },
        {
          "id": 3,
          "title": "",
          "wit": "",
          "state": "",
          "priority": 0,
          "effort": 0,
          "remainingWork": 0,
          "hasChildren": false,
          "children": []
        }
      ]
    },
    {
      "id": 2,
      "title": "",
      "wit": "",
      "state": "",
      "priority": 0,
      "effort": 0,
      "remainingWork": 0,
      "hasChildren": true,
      "children": [
        {
          "id": 9,
          "title": "",
          "wit": "",
          "state": "",
          "priority": 0,
          "effort": 0,
          "remainingWork": 0,
          "hasChildren": false,
          "children": []
        },
        {
          "id": 6,
          "title": "",
          "wit": "",
          "state": "",
          "priority": 0,
          "effort": 0,
          "remainingWork": 0,
          "hasChildren": false,
          "children": []
        },
        {
          "id": 7,
          "title": "",
          "wit": "",
          "state": "",
          "priority": 0,
          "effort": 0,
          "remainingWork": 0,
          "hasChildren": false,
          "children": []
        }
      ]
    }
  ]`
);

// Tree-query fixture: a 3-level hierarchy used by processTreeQuery tests.
//
//   100 (Feature, "In Progress")          [level 1 root]
//   ├── 200 (PBI, "Committed")            [level 2]
//   │   ├── 300 (PBI, "Done")             [level 3]
//   │   └── 301 (PBI, "New")              [level 3]
//   └── 201 (PBI, "Done")                 [level 2]
//       └── 302 (PBI, "Done")             [level 3]
//   101 (Feature, "New")                  [level 1 root, no children]
//
// IDs are deliberately ≥100 so the auto-mock's getWorkItems dispatch can route
// any tree-fixture id set to treeQueryFieldResults without colliding with the
// 1–9 IDs used by queryType1/queryType2 fixtures.
export const treeQueryResults : WorkItemQueryResult = JSON.parse (
`{
    "queryType": 2,
    "queryResultType": 2,
    "asOf": "2026-05-09T12:00:00.000Z",
    "columns": [],
    "workItemRelations": [
      { "rel": null, "source": null, "target": { "id": 100 } },
      { "rel": "System.LinkTypes.Hierarchy-Forward", "source": { "id": 100 }, "target": { "id": 200 } },
      { "rel": "System.LinkTypes.Hierarchy-Forward", "source": { "id": 100 }, "target": { "id": 201 } },
      { "rel": "System.LinkTypes.Hierarchy-Forward", "source": { "id": 200 }, "target": { "id": 300 } },
      { "rel": "System.LinkTypes.Hierarchy-Forward", "source": { "id": 200 }, "target": { "id": 301 } },
      { "rel": "System.LinkTypes.Hierarchy-Forward", "source": { "id": 201 }, "target": { "id": 302 } },
      { "rel": null, "source": null, "target": { "id": 101 } }
    ]
  }`
);

export const treeQueryFieldResults : Array<WorkItem> = JSON.parse(
`[
    { "id": 100, "rev": 1, "fields": { "System.WorkItemType": "Feature",             "System.State": "In Progress", "System.Title": "Top feature 100", "Microsoft.VSTS.Common.BacklogPriority": 1, "Microsoft.VSTS.Scheduling.Effort": 13 }, "url": "" },
    { "id": 101, "rev": 1, "fields": { "System.WorkItemType": "Feature",             "System.State": "New",         "System.Title": "Lone feature 101 with no children", "Microsoft.VSTS.Common.BacklogPriority": 2, "Microsoft.VSTS.Scheduling.Effort": 5  }, "url": "" },
    { "id": 200, "rev": 1, "fields": { "System.WorkItemType": "Product Backlog Item","System.State": "Committed",   "System.Title": "Mid PBI 200",      "Microsoft.VSTS.Common.BacklogPriority": 1, "Microsoft.VSTS.Scheduling.Effort": 5  }, "url": "" },
    { "id": 201, "rev": 1, "fields": { "System.WorkItemType": "Product Backlog Item","System.State": "Done",        "System.Title": "Mid PBI 201",      "Microsoft.VSTS.Common.BacklogPriority": 2, "Microsoft.VSTS.Scheduling.Effort": 3  }, "url": "" },
    { "id": 300, "rev": 1, "fields": { "System.WorkItemType": "Product Backlog Item","System.State": "Done",        "System.Title": "Leaf PBI 300",     "Microsoft.VSTS.Common.BacklogPriority": 1, "Microsoft.VSTS.Scheduling.Effort": 2  }, "url": "" },
    { "id": 301, "rev": 1, "fields": { "System.WorkItemType": "Product Backlog Item","System.State": "New",         "System.Title": "Leaf PBI 301",     "Microsoft.VSTS.Common.BacklogPriority": 2, "Microsoft.VSTS.Scheduling.Effort": 2  }, "url": "" },
    { "id": 302, "rev": 1, "fields": { "System.WorkItemType": "Product Backlog Item","System.State": "Done",        "System.Title": "Leaf PBI 302",     "Microsoft.VSTS.Common.BacklogPriority": 3, "Microsoft.VSTS.Scheduling.Effort": 1  }, "url": "" }
  ]`
);

// this is the results of fields batch request for all work items
export const fieldsBatchRequestResults : Array<WorkItem> = JSON.parse(
`[
    {
      "id": 1,
      "rev": 3,
      "fields": {
        "System.WorkItemType": "Feature",
        "System.CreatedBy": { "displayName": "Richard Mouser" },
        "System.State": "In Progress",
        "System.Title": "Allow user to pick a query that returns parent/child work items",
        "Microsoft.VSTS.Common.BacklogPriority": 999936756
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/1"
    },
    {
      "id": 2,
      "rev": 2,
      "fields": {
        "System.WorkItemType": "Feature",
        "System.AssignedTo": { "displayName": "Ricky Mouser" },
        "System.CreatedBy": { "displayName": "Richard Mouser" },
        "System.State": "New",
        "System.Title": "Show a visual representation of progress on parent/child work items",
        "Microsoft.VSTS.Common.BacklogPriority": 999968378
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/2"
    },
    {
      "id": 3,
      "rev": 2,
      "fields": {
        "System.WorkItemType": "Product Backlog Item",
        "System.AssignedTo": { "displayName": "Ricky Mouser" },
        "System.CreatedBy": { "displayName": "Richard Mouser" },
        "System.State": "Committed",
        "System.Title": "Get all the shared queries from ADO into a list for selection",
        "Microsoft.VSTS.Scheduling.Effort": 5
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/3"
    },
    {
      "id": 4,
      "rev": 2,
      "fields": {
        "System.WorkItemType": "Product Backlog Item",
        "System.AssignedTo": { "displayName": "Ricky Mouser" },
        "System.CreatedBy": { "displayName": "Richard Mouser" },
        "System.State": "Approved",
        "System.Title": "Allow user to select a query and store the selection as configuration data",
        "Microsoft.VSTS.Scheduling.Effort": 8
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/4"
    },
    {
      "id": 5,
      "rev": 2,
      "fields": {
        "System.WorkItemType": "Product Backlog Item",
        "System.AssignedTo": { "displayName": "Ricky Mouser" },
        "System.CreatedBy": { "displayName": "Richard Mouser" },
        "System.State": "Done",
        "System.Title": "Filter out queries that won't work from the selection list",
        "Microsoft.VSTS.Scheduling.Effort": 3
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/5"
    },
    {
      "id": 6,
      "rev": 1,
      "fields": {
        "System.WorkItemType": "Product Backlog Item",
        "System.AssignedTo": { "displayName": "Ricky Mouser" },
        "System.CreatedBy": { "displayName": "Richard Mouser" },
        "System.State": "New",
        "System.Title": "Get data for the configured query"
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/6"
    },
    {
      "id": 7,
      "rev": 1,
      "fields": {
        "System.WorkItemType": "Product Backlog Item",
        "System.AssignedTo": { "displayName": "Ricky Mouser" },
        "System.CreatedBy": { "displayName": "Richard Mouser" },
        "System.State": "New",
        "System.Title": "Draw at least 6 variations on how to visualize the data"
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/7"
    },
    {
      "id": 8,
      "rev": 2,
      "fields": {
        "System.WorkItemType": "Product Backlog Item",
        "System.AssignedTo": { "displayName": "Ricky Mouser" },
        "System.CreatedBy": { "displayName": "Richard Mouser" },
        "System.State": "New",
        "System.Title": "Add option to scale graphs to story point sizes",
        "Microsoft.VSTS.Scheduling.Effort": 2
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/8"
    },
    {
      "id": 9,
      "rev": 1,
      "fields": {
        "System.WorkItemType": "Product Backlog Item",
        "System.AssignedTo": { "displayName": "Ricky Mouser" },
        "System.CreatedBy": { "displayName": "Richard Mouser" },
        "System.State": "New",
        "System.Title": "Implement the visualization that most people like best"
      },
      "url": "https://dev.azure.com/rmouser/_apis/wit/workItems/9"
    }
  ]`);
