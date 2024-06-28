/**
 * @generated SignedSource<<6666aaf5b96946bd195340a60c91333c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type AppMainQuery$variables = Record<PropertyKey, never>;
export type AppMainQuery$data = {
  readonly getUserFromCookie: {
    readonly isLogedIn: boolean;
    readonly user: {
      readonly email: string;
      readonly name: string;
    } | null | undefined;
  };
};
export type AppMainQuery = {
  response: AppMainQuery$data;
  variables: AppMainQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isLogedIn",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
},
v3 = {
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
    "name": "AppMainQuery",
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
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/)
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
    "name": "AppMainQuery",
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
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/),
              (v3/*: any*/)
            ],
            "storageKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "53157047f68687f0db075d88ad078241",
    "id": null,
    "metadata": {},
    "name": "AppMainQuery",
    "operationKind": "query",
    "text": "query AppMainQuery {\n  getUserFromCookie {\n    isLogedIn\n    user {\n      name\n      email\n      id\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "e6c6ce98bff6a114c460b597c9612b96";

export default node;
