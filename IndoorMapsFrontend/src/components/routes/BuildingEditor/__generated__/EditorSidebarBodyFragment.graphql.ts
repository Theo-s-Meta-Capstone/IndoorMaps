/**
 * @generated SignedSource<<165c10bcfd0b7bd14b71ce7e102f6757>>
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

(node as any).hash = "94bc162ac2702792b9a25ce0edfa9533";

export default node;
