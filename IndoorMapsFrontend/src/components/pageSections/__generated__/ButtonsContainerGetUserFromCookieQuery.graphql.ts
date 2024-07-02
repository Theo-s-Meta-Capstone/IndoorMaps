/**
 * @generated SignedSource<<eb4598ad083cdd1ab85ae95bd2ec2e6b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ButtonsContainerGetUserFromCookieQuery$variables = Record<PropertyKey, never>;
export type ButtonsContainerGetUserFromCookieQuery$data = {
  readonly getUserFromCookie: {
    readonly " $fragmentSpreads": FragmentRefs<"ButtonsContainerFragment" | "ListOfConnectedBuildingsUserDataDisplayFragment" | "UserDataDisplayFragment">;
  };
};
export type ButtonsContainerGetUserFromCookieQuery = {
  response: ButtonsContainerGetUserFromCookieQuery$data;
  variables: ButtonsContainerGetUserFromCookieQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ButtonsContainerGetUserFromCookieQuery",
    "selections": [
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
    "name": "ButtonsContainerGetUserFromCookieQuery",
    "selections": [
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
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "databaseId",
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
                        "name": "address",
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c76027c30611df33d794391f74d5d8fd",
    "id": null,
    "metadata": {},
    "name": "ButtonsContainerGetUserFromCookieQuery",
    "operationKind": "query",
    "text": "query ButtonsContainerGetUserFromCookieQuery {\n  getUserFromCookie {\n    ...ButtonsContainerFragment\n    ...UserDataDisplayFragment\n    ...ListOfConnectedBuildingsUserDataDisplayFragment\n    id\n  }\n}\n\nfragment ButtonsContainerFragment on LogedInUser {\n  id\n  isLogedIn\n  user {\n    id\n    email\n    name\n  }\n}\n\nfragment ConnectedBuildingItemFragment on BuildingWithPerms {\n  id\n  editorLevel\n  building {\n    id\n    databaseId\n    title\n    address\n  }\n}\n\nfragment ListOfConnectedBuildingsUserDataDisplayFragment on LogedInUser {\n  id\n  isLogedIn\n  user {\n    id\n    BuildingWithPerms {\n      ...ConnectedBuildingItemFragment\n      id\n    }\n  }\n}\n\nfragment UserDataDisplayFragment on LogedInUser {\n  id\n  isLogedIn\n  user {\n    id\n    email\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "cdb3c24b319347bb79252d382a550213";

export default node;
