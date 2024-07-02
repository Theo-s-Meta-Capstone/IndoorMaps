/**
 * @generated SignedSource<<c49bddb68b859fdecdf8b912d56467e2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FloorUniqueInput = {
  id: number;
};
export type hooksGetFloorQuery$variables = {
  data: FloorUniqueInput;
};
export type hooksGetFloorQuery$data = {
  readonly getFloor: {
    readonly " $fragmentSpreads": FragmentRefs<"FloorListItemFragment">;
  };
};
export type hooksGetFloorQuery = {
  response: hooksGetFloorQuery$data;
  variables: hooksGetFloorQuery$variables;
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "hooksGetFloorQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Floor",
        "kind": "LinkedField",
        "name": "getFloor",
        "plural": false,
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
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "hooksGetFloorQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Floor",
        "kind": "LinkedField",
        "name": "getFloor",
        "plural": false,
        "selections": [
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
            "name": "id",
            "storageKey": null
          },
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
    ]
  },
  "params": {
    "cacheID": "3913126ece3a9e2669d4894e68704332",
    "id": null,
    "metadata": {},
    "name": "hooksGetFloorQuery",
    "operationKind": "query",
    "text": "query hooksGetFloorQuery(\n  $data: FloorUniqueInput!\n) {\n  getFloor(data: $data) {\n    ...FloorListItemFragment\n    id\n  }\n}\n\nfragment FloorListItemFragment on Floor {\n  databaseId\n  id\n  title\n  description\n  shape\n}\n"
  }
};
})();

(node as any).hash = "9a519ae19287ae75b0b5df75fd9c7d0a";

export default node;
