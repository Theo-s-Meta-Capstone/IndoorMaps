/**
 * @generated SignedSource<<60d56708f034ccb00b1fc5ff9b10be48>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DirectoryQuery$variables = Record<PropertyKey, never>;
export type DirectoryQuery$data = {
  readonly allBuildings: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"BuildingItemFragment">;
  }>;
  readonly getUserFromCookie: {
    readonly " $fragmentSpreads": FragmentRefs<"ButtonsContainerFragment" | "ListOfConnectedBuildingsUserDataDisplayFragment" | "UserDataDisplayFragment">;
  };
};
export type DirectoryQuery = {
  response: DirectoryQuery$data;
  variables: DirectoryQuery$variables;
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
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "address",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DirectoryQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Building",
        "kind": "LinkedField",
        "name": "allBuildings",
        "plural": true,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "BuildingItemFragment"
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "LogedInUser",
        "kind": "LinkedField",
        "name": "getUserFromCookie",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ButtonsContainerFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "UserDataDisplayFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ListOfConnectedBuildingsUserDataDisplayFragment"
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
    "name": "DirectoryQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Building",
        "kind": "LinkedField",
        "name": "allBuildings",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "LogedInUser",
        "kind": "LinkedField",
        "name": "getUserFromCookie",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "isLogedIn",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v0/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "email",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "BuildingWithPerms",
                "kind": "LinkedField",
                "name": "BuildingWithPerms",
                "plural": true,
                "selections": [
                  (v0/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "editorLevel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Building",
                    "kind": "LinkedField",
                    "name": "building",
                    "plural": false,
                    "selections": [
                      (v0/*: any*/),
                      (v3/*: any*/),
                      (v1/*: any*/),
                      (v2/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "31690f26cdcc139f396fc7d18cc6a2dd",
    "id": null,
    "metadata": {},
    "name": "DirectoryQuery",
    "operationKind": "query",
    "text": "query DirectoryQuery {\n  allBuildings {\n    ...BuildingItemFragment\n    id\n  }\n  getUserFromCookie {\n    ...ButtonsContainerFragment\n    ...UserDataDisplayFragment\n    ...ListOfConnectedBuildingsUserDataDisplayFragment\n    id\n  }\n}\n\nfragment BuildingItemFragment on Building {\n  id\n  title\n  address\n  databaseId\n}\n\nfragment ButtonsContainerFragment on LogedInUser {\n  id\n  isLogedIn\n  user {\n    id\n    email\n    name\n  }\n}\n\nfragment ConnectedBuildingItemFragment on BuildingWithPerms {\n  id\n  editorLevel\n  building {\n    id\n    databaseId\n    title\n    address\n  }\n}\n\nfragment ListOfConnectedBuildingsUserDataDisplayFragment on LogedInUser {\n  id\n  isLogedIn\n  user {\n    id\n    BuildingWithPerms {\n      ...ConnectedBuildingItemFragment\n      id\n    }\n  }\n}\n\nfragment UserDataDisplayFragment on LogedInUser {\n  id\n  isLogedIn\n  user {\n    id\n    email\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "698c87f77dfb201fbbb9cdf444d30a72";

export default node;
