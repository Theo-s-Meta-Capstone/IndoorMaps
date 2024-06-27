/**
 * @generated SignedSource<<d81e97bebf74c1bc487efc09840f124f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type UserLoginInput = {
  email: string;
  password: string;
};
export type AppLoginUserQuery$variables = {
  data: UserLoginInput;
};
export type AppLoginUserQuery$data = {
  readonly signinUser: {
    readonly email: string;
    readonly id: string;
    readonly name: string | null | undefined;
    readonly token: string;
  };
};
export type AppLoginUserQuery = {
  response: AppLoginUserQuery$data;
  variables: AppLoginUserQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "data"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "data",
        "variableName": "data"
      }
    ],
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "signinUser",
    "plural": false,
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
        "name": "token",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AppLoginUserQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AppLoginUserQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "c8a1c56a5af7f8040f5b8d3128749349",
    "id": null,
    "metadata": {},
    "name": "AppLoginUserQuery",
    "operationKind": "query",
    "text": "query AppLoginUserQuery(\n  $data: UserLoginInput!\n) {\n  signinUser(data: $data) {\n    id\n    email\n    name\n    token\n  }\n}\n"
  }
};
})();

(node as any).hash = "d4a95cde891054f3b7db23efedcb34bb";

export default node;
