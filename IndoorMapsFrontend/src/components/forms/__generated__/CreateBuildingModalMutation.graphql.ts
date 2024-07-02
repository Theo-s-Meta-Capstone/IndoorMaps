/**
 * @generated SignedSource<<f752617a99c44a6446801654f2dc2622>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type BuildingCreateInput = {
  address: string;
  startLat: number;
  startLon: number;
  title: string;
};
export type CreateBuildingModalMutation$variables = {
  input: BuildingCreateInput;
};
export type CreateBuildingModalMutation$data = {
  readonly createBuilding: {
    readonly databaseId: number;
  };
};
export type CreateBuildingModalMutation = {
  response: CreateBuildingModalMutation$data;
  variables: CreateBuildingModalMutation$variables;
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
    "kind": "Variable",
    "name": "data",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "CreateBuildingModalMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Building",
        "kind": "LinkedField",
        "name": "createBuilding",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "CreateBuildingModalMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Building",
        "kind": "LinkedField",
        "name": "createBuilding",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
    ]
  },
  "params": {
    "cacheID": "2eb488cddba2ff4e9cc27f891a6302d0",
    "id": null,
    "metadata": {},
    "name": "CreateBuildingModalMutation",
    "operationKind": "mutation",
    "text": "mutation CreateBuildingModalMutation(\n  $input: BuildingCreateInput!\n) {\n  createBuilding(data: $input) {\n    databaseId\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "30461f92242ac8ed5064d8c6af266123";

export default node;
