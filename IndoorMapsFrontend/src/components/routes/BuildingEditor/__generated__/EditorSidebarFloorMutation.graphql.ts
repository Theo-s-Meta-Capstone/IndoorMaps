/**
 * @generated SignedSource<<d97512af4d5dfe96103be7210f7f4975>>
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
    readonly buildingDatabaseId: number;
    readonly databaseId: number;
    readonly success: boolean;
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
        "name": "success",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "databaseId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "buildingDatabaseId",
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
    "cacheID": "ea47b5e92959717336254318266e71af",
    "id": null,
    "metadata": {},
    "name": "EditorSidebarFloorMutation",
    "operationKind": "mutation",
    "text": "mutation EditorSidebarFloorMutation(\n  $data: FloorModifyInput!\n) {\n  modifyFloor(data: $data) {\n    success\n    databaseId\n    buildingDatabaseId\n  }\n}\n"
  }
};
})();

(node as any).hash = "bef8b65f9064bd83778386e42df7531d";

export default node;
