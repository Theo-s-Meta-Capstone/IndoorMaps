/**
 * @generated SignedSource<<637c1196668c68ae7e146c6fe2822a13>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EditorSidebarBodyFragment$data = {
  readonly address: string;
  readonly databaseId: number;
  readonly floors: ReadonlyArray<{
    readonly databaseId: number;
    readonly id: string;
    readonly shape: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"FloorListItemFragment">;
  }>;
  readonly id: string;
  readonly startPos: {
    readonly lat: number;
    readonly lon: number;
  };
  readonly title: string;
  readonly " $fragmentType": "EditorSidebarBodyFragment";
};
export type EditorSidebarBodyFragment$key = {
  readonly " $data"?: EditorSidebarBodyFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"EditorSidebarBodyFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EditorSidebarBodyFragment",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
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
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "shape",
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "FloorListItemFragment"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Building",
  "abstractKey": null
};
})();

(node as any).hash = "bcf5ee5a1ded1e8b8688d83b9c66ebfc";

export default node;
