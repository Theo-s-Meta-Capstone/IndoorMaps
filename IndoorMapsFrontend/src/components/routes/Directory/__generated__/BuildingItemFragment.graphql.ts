/**
 * @generated SignedSource<<2c018be8853293960922e86c24f52502>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BuildingItemFragment$data = {
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
    }
  ],
  "type": "Building",
  "abstractKey": null
};

(node as any).hash = "64e8711417fd2293a0553222c700ac56";

export default node;
