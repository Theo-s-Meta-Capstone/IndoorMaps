/**
 * @generated SignedSource<<423b5016d5e1593c52e762bf7e981470>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type FloorCreateInput = {
  buildingDatabseId: number;
  description: string;
  title: string;
};
export type CreateFloorModalMutation$variables = {
  input: FloorCreateInput;
};
export type CreateFloorModalMutation$data = {
  readonly createFloor: {
    readonly success: boolean;
  };
};
export type CreateFloorModalMutation = {
  response: CreateFloorModalMutation$data;
  variables: CreateFloorModalMutation$variables;
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
    "concreteType": "MutationResult",
    "kind": "LinkedField",
    "name": "createFloor",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "CreateFloorModalMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "CreateFloorModalMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "87a096c15fd73211dffd66b35c01867a",
    "id": null,
    "metadata": {},
    "name": "CreateFloorModalMutation",
    "operationKind": "mutation",
    "text": "mutation CreateFloorModalMutation(\n  $input: FloorCreateInput!\n) {\n  createFloor(data: $input) {\n    success\n  }\n}\n"
  }
};
})();

(node as any).hash = "8fd791659e40919da41540bce45c4025";

export default node;
