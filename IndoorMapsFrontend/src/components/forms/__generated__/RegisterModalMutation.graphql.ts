/**
 * @generated SignedSource<<b3d7ea8f2b05289af6210a0738c5fdd0>>
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
    readonly id: string;
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
    "cacheID": "40a66c9b7e81300c9bde2a44ecfcfb1a",
    "id": null,
    "metadata": {},
    "name": "RegisterModalMutation",
    "operationKind": "mutation",
    "text": "mutation RegisterModalMutation(\n  $input: UserCreateInput!\n) {\n  signupUser(data: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "8baca6b509a5b6acfa71b87e126d9632";

export default node;
