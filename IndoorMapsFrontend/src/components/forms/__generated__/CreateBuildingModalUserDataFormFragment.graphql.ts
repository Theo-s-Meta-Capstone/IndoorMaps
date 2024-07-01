/**
 * @generated SignedSource<<2f70e606af1482cde461505db6662625>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CreateBuildingModalUserDataFormFragment$data = {
  readonly databaseId: number;
  readonly id: string;
  readonly " $fragmentType": "CreateBuildingModalUserDataFormFragment";
};
export type CreateBuildingModalUserDataFormFragment$key = {
  readonly " $data"?: CreateBuildingModalUserDataFormFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"CreateBuildingModalUserDataFormFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CreateBuildingModalUserDataFormFragment",
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
      "name": "databaseId",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "35f17b62489893ff6c0dfc19a9d174e3";

export default node;
