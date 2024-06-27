/**
 * @generated SignedSource<<b3ebe47edf6ec7e01bfa8827d3a9d6aa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type DirectoryGetAllBuildingsQuery$variables = Record<PropertyKey, never>;
export type DirectoryGetAllBuildingsQuery$data = {
  readonly allBuildings: ReadonlyArray<{
    readonly description: string;
    readonly id: string;
    readonly title: string;
  }>;
};
export type DirectoryGetAllBuildingsQuery = {
  response: DirectoryGetAllBuildingsQuery$data;
  variables: DirectoryGetAllBuildingsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Building",
    "kind": "LinkedField",
    "name": "allBuildings",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "title",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "description",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DirectoryGetAllBuildingsQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "DirectoryGetAllBuildingsQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "9a212d7877583a199d4ecfc6e5c61d1f",
    "id": null,
    "metadata": {},
    "name": "DirectoryGetAllBuildingsQuery",
    "operationKind": "query",
    "text": "query DirectoryGetAllBuildingsQuery {\n  allBuildings {\n    id\n    title\n    description\n  }\n}\n"
  }
};
})();

(node as any).hash = "7d424eacf6e742f6e8338b689a5af44e";

export default node;
