/**
 * @generated SignedSource<<306693e050de72b5f4c3a1cfce3dbfb4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BuildingUniqueInput = {
  id?: number | null | undefined;
};
export type BuildingEditorQuery$variables = {
  data: BuildingUniqueInput;
};
export type BuildingEditorQuery$data = {
  readonly getBuilding: {
    readonly " $fragmentSpreads": FragmentRefs<"BuildingEditorBodyFragment">;
  };
  readonly getUserFromCookie: {
    readonly " $fragmentSpreads": FragmentRefs<"ButtonsContainerFragment">;
  };
};
export type BuildingEditorQuery = {
  response: BuildingEditorQuery$data;
  variables: BuildingEditorQuery$variables;
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
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BuildingEditorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "LogedInUser",
        "kind": "LinkedField",
        "name": "getUserFromCookie",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ButtonsContainerFragment"
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Building",
        "kind": "LinkedField",
        "name": "getBuilding",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "BuildingEditorBodyFragment"
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
    "name": "BuildingEditorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "LogedInUser",
        "kind": "LinkedField",
        "name": "getUserFromCookie",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "isLogedIn",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v2/*: any*/),
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
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
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
            "kind": "ScalarField",
            "name": "databaseId",
            "storageKey": null
          },
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "LatLng",
            "kind": "LinkedField",
            "name": "startPos",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lat",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lon",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "address",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Floor",
            "kind": "LinkedField",
            "name": "floors",
            "plural": true,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
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
    "cacheID": "e23d14139097a2890c7d04904eeb47c8",
    "id": null,
    "metadata": {},
    "name": "BuildingEditorQuery",
    "operationKind": "query",
    "text": "query BuildingEditorQuery(\n  $data: BuildingUniqueInput!\n) {\n  getUserFromCookie {\n    ...ButtonsContainerFragment\n    id\n  }\n  getBuilding(data: $data) {\n    ...BuildingEditorBodyFragment\n    id\n  }\n}\n\nfragment BuildingEditorBodyFragment on Building {\n  ...EditorSidebarBodyFragment\n  id\n  databaseId\n  title\n  startPos {\n    lat\n    lon\n  }\n  address\n  floors {\n    id\n    title\n    description\n    shape\n  }\n}\n\nfragment ButtonsContainerFragment on LogedInUser {\n  id\n  isLogedIn\n  user {\n    id\n    email\n    name\n  }\n}\n\nfragment EditorSidebarBodyFragment on Building {\n  id\n  databaseId\n  title\n  startPos {\n    lat\n    lon\n  }\n  address\n  floors {\n    id\n    title\n    description\n    shape\n  }\n}\n"
  }
};
})();

(node as any).hash = "53fb01775100a411c8b74a9e808bbefa";

export default node;
