/**
 * @generated SignedSource<<748917c4fc6ac6752b74583a7731c014>>
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
    readonly " $fragmentSpreads": FragmentRefs<"CreateBuildingModalUserDataFormFragment">;
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
          "args": null,
          "kind": "FragmentSpread",
          "name": "CreateBuildingModalUserDataFormFragment"
        },
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

(node as any).hash = "5f881e320c72a0d9ca8a502520467c1f";

export default node;
