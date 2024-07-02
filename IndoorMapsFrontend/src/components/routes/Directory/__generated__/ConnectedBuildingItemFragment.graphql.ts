/**
 * @generated SignedSource<<7f649cd48d01f182900e218943188267>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type EditorLevel = "editor" | "owner" | "viewer" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ConnectedBuildingItemFragment$data = {
  readonly building: {
    readonly address: string;
    readonly databaseId: number;
    readonly id: string;
    readonly title: string;
  };
  readonly editorLevel: EditorLevel;
  readonly id: string;
  readonly " $fragmentType": "ConnectedBuildingItemFragment";
};
export type ConnectedBuildingItemFragment$key = {
  readonly " $data"?: ConnectedBuildingItemFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ConnectedBuildingItemFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ConnectedBuildingItemFragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "editorLevel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Building",
      "kind": "LinkedField",
      "name": "building",
      "plural": false,
      "selections": [
        (v0/*: any*/),
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
          "name": "title",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "address",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "BuildingWithPerms",
  "abstractKey": null
};
})();

(node as any).hash = "6ce2edcc40cbe7839a450a22ac88a1b8";

export default node;
