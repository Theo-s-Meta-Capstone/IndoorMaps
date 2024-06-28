/**
 * @generated SignedSource<<962a99b8c8df1284b0ef366638139001>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type ButtonsContainerMutation$variables = Record<PropertyKey, never>;
export type ButtonsContainerMutation$data = {
  readonly signOut: {
    readonly success: boolean;
  };
};
export type ButtonsContainerMutation = {
  response: ButtonsContainerMutation$data;
  variables: ButtonsContainerMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "SignedOutSuccess",
    "kind": "LinkedField",
    "name": "signOut",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "success",
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
    "name": "ButtonsContainerMutation",
    "selections": (v0/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ButtonsContainerMutation",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "9af110b9f852f40f1fff4c0c93202c3d",
    "id": null,
    "metadata": {},
    "name": "ButtonsContainerMutation",
    "operationKind": "mutation",
    "text": "mutation ButtonsContainerMutation {\n  signOut {\n    success\n  }\n}\n"
  }
};
})();

(node as any).hash = "17b9f85c7df9a50e45fc435cc50e546e";

export default node;
