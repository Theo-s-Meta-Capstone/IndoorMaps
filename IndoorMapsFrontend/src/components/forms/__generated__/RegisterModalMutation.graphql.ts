/**
 * @generated SignedSource<<c56c31e595574c9d9257d92d16067d79>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type UserCreateInput = {
  email: string;
  name: string;
  password: string;
};
export type RegisterModalMutation$variables = {
  input: UserCreateInput;
};
export type RegisterModalMutation$data = {
  readonly signupUser: {
    readonly email: string;
    readonly id: string;
    readonly name: string;
    readonly token: string;
  };
};
export type RegisterModalMutation = {
  response: RegisterModalMutation$data;
  variables: RegisterModalMutation$variables;
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
    "name": "signupUser",
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
    "name": "RegisterModalMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RegisterModalMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "8b4eea222304094a273ae9d32008b958",
    "id": null,
    "metadata": {},
    "name": "RegisterModalMutation",
    "operationKind": "mutation",
    "text": "mutation RegisterModalMutation(\n  $input: UserCreateInput!\n) {\n  signupUser(data: $input) {\n    id\n    email\n    name\n    token\n  }\n}\n"
  }
};
})();

(node as any).hash = "2efbe2c59d5f78f6e300ea353d19eb91";

export default node;
