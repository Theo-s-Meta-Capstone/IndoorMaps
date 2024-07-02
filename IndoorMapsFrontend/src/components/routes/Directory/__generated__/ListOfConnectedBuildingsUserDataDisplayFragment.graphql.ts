/**
 * @generated SignedSource<<2eda7a6fbd6f1a05e2e9794a39be1569>>
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
    readonly id: string;
  } | null | undefined;
  readonly " $fragmentType": "ListOfConnectedBuildingsUserDataDisplayFragment";
};
export type ListOfConnectedBuildingsUserDataDisplayFragment$key = {
  readonly " $data"?: ListOfConnectedBuildingsUserDataDisplayFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ListOfConnectedBuildingsUserDataDisplayFragment">;
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
  "name": "ListOfConnectedBuildingsUserDataDisplayFragment",
  "selections": [
    (v0/*: any*/),
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
        (v0/*: any*/),
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
})();

(node as any).hash = "bf9f216abc82df86f024935ab27aa219";

export default node;
