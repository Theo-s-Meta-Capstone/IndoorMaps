/**
 * @generated SignedSource<<d616ce702f681a2c08b889bc9ba5cf9b>>
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
  readonly getUserFromCookie: {
    readonly isLogedIn: boolean;
    readonly user: {
      readonly email: string;
      readonly name: string;
    } | null | undefined;
  };
};
export type DirectoryGetAllBuildingsQuery = {
  response: DirectoryGetAllBuildingsQuery$data;
  variables: DirectoryGetAllBuildingsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "concreteType": "Building",
  "kind": "LinkedField",
  "name": "allBuildings",
  "plural": true,
  "selections": [
    (v0/*: any*/),
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
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isLogedIn",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DirectoryGetAllBuildingsQuery",
    "selections": [
      (v1/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "LogedInUser",
        "kind": "LinkedField",
        "name": "getUserFromCookie",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "DirectoryGetAllBuildingsQuery",
    "selections": [
      (v1/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "LogedInUser",
        "kind": "LinkedField",
        "name": "getUserFromCookie",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/),
              (v0/*: any*/)
            ],
            "storageKey": null
          },
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3dd5bd25bc546394fe9d7d13f8eb3e13",
    "id": null,
    "metadata": {},
    "name": "DirectoryGetAllBuildingsQuery",
    "operationKind": "query",
    "text": "query DirectoryGetAllBuildingsQuery {\n  allBuildings {\n    id\n    title\n    description\n  }\n  getUserFromCookie {\n    isLogedIn\n    user {\n      name\n      email\n      id\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b12b01db4ccd10b05ed3849020e2df72";

export default node;
