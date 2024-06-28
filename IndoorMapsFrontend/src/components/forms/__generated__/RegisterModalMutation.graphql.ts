/**
 * @generated SignedSource<<b5a74511a049433c9bff0cf4070f1d6c>>
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
    "cacheID": "d8551685d9f2ae698d1ef80df304fda3",
    "id": null,
    "metadata": {},
    "name": "RegisterModalMutation",
    "operationKind": "mutation",
    "text": "mutation RegisterModalMutation(\n  $input: UserCreateInput!\n) {\n  signupUser(data: $input) {\n    id\n    email\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "83b7827de6d6971753d942049b4594b5";

export default node;
