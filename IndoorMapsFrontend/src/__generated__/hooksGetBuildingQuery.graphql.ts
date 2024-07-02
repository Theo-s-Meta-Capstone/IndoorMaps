/**
 * @generated SignedSource<<966da09d9c8511e9c5176059348c39fe>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BuildingUniqueInput = {
  id: number;
};
export type hooksGetBuildingQuery$variables = {
  data: BuildingUniqueInput;
};
export type hooksGetBuildingQuery$data = {
  readonly getBuilding: {
    readonly floors: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"FloorListItemFragment">;
    }>;
    readonly id: string;
  };
};
export type hooksGetBuildingQuery = {
  response: hooksGetBuildingQuery$data;
  variables: hooksGetBuildingQuery$variables;
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
    "kind": "Variable",
    "name": "data",
    "variableName": "data"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "hooksGetBuildingQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Building",
        "kind": "LinkedField",
        "name": "getBuilding",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Floor",
            "kind": "LinkedField",
            "name": "floors",
            "plural": true,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "FloorListItemFragment"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "hooksGetBuildingQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Building",
        "kind": "LinkedField",
        "name": "getBuilding",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Floor",
            "kind": "LinkedField",
            "name": "floors",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "databaseId",
                "storageKey": null
              },
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "title",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "description",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "shape",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "11443d23566c70e87977d0e357e1f9d8",
    "id": null,
    "metadata": {},
    "name": "hooksGetBuildingQuery",
    "operationKind": "query",
    "text": "query hooksGetBuildingQuery(\n  $data: BuildingUniqueInput!\n) {\n  getBuilding(data: $data) {\n    id\n    floors {\n      ...FloorListItemFragment\n      id\n    }\n  }\n}\n\nfragment FloorListItemFragment on Floor {\n  databaseId\n  id\n  title\n  description\n  shape\n}\n"
  }
};
})();

(node as any).hash = "6387fed65e9c01469a5009c5dec3607c";

export default node;
