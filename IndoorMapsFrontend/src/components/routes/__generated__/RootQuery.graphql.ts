/**
 * @generated SignedSource<<dfcbb115d26d5f2d0160639077a6a774>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RootQuery$variables = Record<PropertyKey, never>;
export type RootQuery$data = {
  readonly getUserFromCookie: {
    readonly " $fragmentSpreads": FragmentRefs<"ButtonsContainerFragment" | "UserDataDisplayFragment">;
  };
};
export type RootQuery = {
  response: RootQuery$data;
  variables: RootQuery$variables;
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
    "name": "RootQuery",
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
    "name": "RootQuery",
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
    "cacheID": "37a04d35deae97040df7c45a44dcf8ab",
    "id": null,
    "metadata": {},
    "name": "RootQuery",
    "operationKind": "query",
    "text": "query RootQuery {\n  getUserFromCookie {\n    ...ButtonsContainerFragment\n    ...UserDataDisplayFragment\n    id\n  }\n}\n\nfragment ButtonsContainerFragment on LogedInUser {\n  id\n  isLogedIn\n  user {\n    id\n    email\n    name\n  }\n}\n\nfragment UserDataDisplayFragment on LogedInUser {\n  id\n  isLogedIn\n  user {\n    id\n    email\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "38663dbbb3c185a6d29d3aeef9c5bf14";

export default node;
