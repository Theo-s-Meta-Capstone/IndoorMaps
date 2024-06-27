/**
 * @generated SignedSource<<8af2ba30eaf88c1fb80e4a7274436784>>
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
export type AppSignupUserMutation$variables = {
  data: UserCreateInput;
};
export type AppSignupUserMutation$data = {
  readonly signupUser: {
    readonly email: string;
    readonly id: string;
    readonly name: string | null | undefined;
    readonly token: string;
  };
};
export type AppSignupUserMutation = {
  response: AppSignupUserMutation$data;
  variables: AppSignupUserMutation$variables;
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
    "name": "AppSignupUserMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AppSignupUserMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "95a7fb5e952298275cfa282f3dc90c51",
    "id": null,
    "metadata": {},
    "name": "AppSignupUserMutation",
    "operationKind": "mutation",
    "text": "mutation AppSignupUserMutation(\n  $data: UserCreateInput!\n) {\n  signupUser(data: $data) {\n    id\n    email\n    name\n    token\n  }\n}\n"
  }
};
})();

(node as any).hash = "e96b89827a7a93ab4ceb0d135dacf035";

export default node;
