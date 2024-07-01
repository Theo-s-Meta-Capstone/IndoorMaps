/**
 * @generated SignedSource<<a6aca82fcb5aa63dc581d1bd3b30ceb4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BuildingItemFragment$data = {
  readonly databaseId: number;
  readonly description: string;
  readonly id: string;
  readonly title: string;
  readonly " $fragmentType": "BuildingItemFragment";
};
export type BuildingItemFragment$key = {
  readonly " $data"?: BuildingItemFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BuildingItemFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BuildingItemFragment",
  "selections": [
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
      "name": "databaseId",
      "storageKey": null
    }
  ],
  "type": "Building",
  "abstractKey": null
};

(node as any).hash = "035cbdc31466dfe29d92b2ab9b8c9a03";

export default node;
