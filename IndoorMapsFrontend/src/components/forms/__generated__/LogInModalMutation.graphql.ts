/**
 * @generated SignedSource<<0ec66f3cca3d7f2087023b8c2dc2e0ab>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type UserLoginInput = {
  email: string;
  password: string;
};
export type LogInModalMutation$variables = {
  input: UserLoginInput;
};
export type LogInModalMutation$data = {
  readonly signinUser: {
    readonly email: string;
    readonly id: string;
    readonly name: string;
    readonly token: string;
  };
};
export type LogInModalMutation = {
  response: LogInModalMutation$data;
  variables: LogInModalMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "data",
        "variableName": "input"
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
    "name": "LogInModalMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "LogInModalMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "a0789af92ca21ef39dedc5265d81e715",
    "id": null,
    "metadata": {},
    "name": "LogInModalMutation",
    "operationKind": "mutation",
    "text": "mutation LogInModalMutation(\n  $input: UserLoginInput!\n) {\n  signinUser(data: $input) {\n    id\n    email\n    name\n    token\n  }\n}\n"
  }
};
})();

(node as any).hash = "00050c3b235806abc7dabbbc0a0e04c0";

export default node;
