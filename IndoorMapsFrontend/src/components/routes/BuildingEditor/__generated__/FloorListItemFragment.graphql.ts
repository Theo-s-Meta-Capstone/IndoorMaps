/**
 * @generated SignedSource<<c107a5b4a499d2887416c1b79d478651>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FloorListItemFragment$data = {
  readonly databaseId: number;
  readonly description: string;
  readonly id: string;
  readonly shape: string | null | undefined;
  readonly title: string;
  readonly " $fragmentType": "FloorListItemFragment";
};
export type FloorListItemFragment$key = {
  readonly " $data"?: FloorListItemFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"FloorListItemFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FloorListItemFragment",
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
  "type": "Floor",
  "abstractKey": null
};

(node as any).hash = "4fece2a8c45c18dd773619dbbb9e32c2";

export default node;
