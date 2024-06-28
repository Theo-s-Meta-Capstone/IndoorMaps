/**
 * @generated SignedSource<<97b335cde385027b38111d914a06b382>>
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
    "cacheID": "0835290ff4bb2808ac98938bbdbbf5da",
    "id": null,
    "metadata": {},
    "name": "LogInModalMutation",
    "operationKind": "mutation",
    "text": "mutation LogInModalMutation(\n  $input: UserLoginInput!\n) {\n  signinUser(data: $input) {\n    id\n    email\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "2c66b45feae69d16b8a0e57cc806f21f";

export default node;
