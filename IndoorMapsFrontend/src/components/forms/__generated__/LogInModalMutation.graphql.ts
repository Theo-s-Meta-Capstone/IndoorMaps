/**
 * @generated SignedSource<<768d853d7f6600de970caf48d3380c52>>
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
    readonly id: string;
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
    "cacheID": "03fc8f68b3b6523d8dd0340cc3ad4ed8",
    "id": null,
    "metadata": {},
    "name": "LogInModalMutation",
    "operationKind": "mutation",
    "text": "mutation LogInModalMutation(\n  $input: UserLoginInput!\n) {\n  signinUser(data: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b25f2e50045c656f5e91c80a53384435";

export default node;
