/**
 * @generated SignedSource<<12f3f5945b38de2c0e1d12a4f7efc1ff>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ListOfConnectedBuildingsUserDataDisplayFragment$data = {
  readonly id: string;
  readonly isLogedIn: boolean;
  readonly user: {
    readonly BuildingWithPerms: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"ConnectedBuildingItemFragment">;
    }>;
  } | null | undefined;
  readonly " $fragmentType": "ListOfConnectedBuildingsUserDataDisplayFragment";
};
export type ListOfConnectedBuildingsUserDataDisplayFragment$key = {
  readonly " $data"?: ListOfConnectedBuildingsUserDataDisplayFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ListOfConnectedBuildingsUserDataDisplayFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ListOfConnectedBuildingsUserDataDisplayFragment",
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
        {
          "alias": null,
          "args": null,
          "concreteType": "BuildingWithPerms",
          "kind": "LinkedField",
          "name": "BuildingWithPerms",
          "plural": true,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ConnectedBuildingItemFragment"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "LogedInUser",
  "abstractKey": null
};

(node as any).hash = "18aa88c5e6b0c1c3cfb3c02ef128b45b";

export default node;
