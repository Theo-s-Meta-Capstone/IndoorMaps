/**
 * @generated SignedSource<<76f02a7a5ba3440a8412516d73cbe202>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BuildingItemFragment$data = {
  readonly address: string;
  readonly databaseId: number;
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
      "name": "address",
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

(node as any).hash = "cfbefec7a86de2eb4b3b34d54842e440";

export default node;
