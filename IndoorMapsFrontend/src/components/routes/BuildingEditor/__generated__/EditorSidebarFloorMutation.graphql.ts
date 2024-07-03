/**
 * @generated SignedSource<<b743fc8acd9eaae3b9c04f1861dd917d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type FloorModifyInput = {
  description?: string | null | undefined;
  id: number;
  newShape?: NewShape | null | undefined;
  title?: string | null | undefined;
};
export type NewShape = {
  shape?: string | null | undefined;
};
export type EditorSidebarFloorMutation$variables = {
  data: FloorModifyInput;
};
export type EditorSidebarFloorMutation$data = {
  readonly modifyFloor: {
    readonly databaseId: number;
  };
};
export type EditorSidebarFloorMutation = {
  response: EditorSidebarFloorMutation$data;
  variables: EditorSidebarFloorMutation$variables;
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
    "concreteType": "NewFloorResult",
    "kind": "LinkedField",
    "name": "modifyFloor",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "databaseId",
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
    "name": "EditorSidebarFloorMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EditorSidebarFloorMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "0e0babd6ab23cdc24f84b28f103a4c9b",
    "id": null,
    "metadata": {},
    "name": "EditorSidebarFloorMutation",
    "operationKind": "mutation",
    "text": "mutation EditorSidebarFloorMutation(\n  $data: FloorModifyInput!\n) {\n  modifyFloor(data: $data) {\n    databaseId\n  }\n}\n"
  }
};
})();

(node as any).hash = "a599728e5d4d3fce79d73e5a58290b00";

export default node;
