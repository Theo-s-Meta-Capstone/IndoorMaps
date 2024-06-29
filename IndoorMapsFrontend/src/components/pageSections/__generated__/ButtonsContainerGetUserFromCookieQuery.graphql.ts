/**
 * @generated SignedSource<<7f0cc5ffd0026241f24f5e641d4051e2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type ButtonsContainerGetUserFromCookieQuery$variables = Record<PropertyKey, never>;
export type ButtonsContainerGetUserFromCookieQuery$data = {
  readonly getUserFromCookie: {
    readonly id: string;
    readonly isLogedIn: boolean;
    readonly user: {
      readonly email: string;
      readonly id: string;
      readonly isEmailVerified: boolean;
      readonly name: string;
    } | null | undefined;
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
},
v1 = [
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
            "kind": "ScalarField",
            "name": "isEmailVerified",
            "storageKey": null
          }
        ],
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
    "name": "ButtonsContainerGetUserFromCookieQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ButtonsContainerGetUserFromCookieQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e1d4754dc26460be0abb95ee991bf92a",
    "id": null,
    "metadata": {},
    "name": "ButtonsContainerGetUserFromCookieQuery",
    "operationKind": "query",
    "text": "query ButtonsContainerGetUserFromCookieQuery {\n  getUserFromCookie {\n    id\n    isLogedIn\n    user {\n      id\n      email\n      name\n      isEmailVerified\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "74a125c08fed6a4f067264e800721065";

export default node;
