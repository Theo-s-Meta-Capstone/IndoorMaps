/**
 * @generated SignedSource<<605026d91df28de3063aac639576b207>>
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
    readonly buildingDatabaseId: number;
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
    "concreteType": "NewFloorResult",
    "kind": "LinkedField",
    "name": "createFloor",
    "plural": false,
    "selections": [
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
    "cacheID": "1a75970a35a1661ee5eb56fdfc7309c6",
    "id": null,
    "metadata": {},
    "name": "CreateFloorModalMutation",
    "operationKind": "mutation",
    "text": "mutation CreateFloorModalMutation(\n  $input: FloorCreateInput!\n) {\n  createFloor(data: $input) {\n    buildingDatabaseId\n  }\n}\n"
  }
};
})();

(node as any).hash = "223705df3dd25f875df16280b1cbb4eb";

export default node;
