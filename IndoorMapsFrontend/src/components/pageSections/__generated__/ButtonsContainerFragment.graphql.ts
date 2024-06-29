/**
 * @generated SignedSource<<dd8e16d436591f89a23557cca67ad805>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ButtonsContainerFragment$data = {
  readonly id: string;
  readonly isLogedIn: boolean;
  readonly user: {
    readonly email: string;
    readonly id: string;
    readonly name: string;
  } | null | undefined;
  readonly " $fragmentType": "ButtonsContainerFragment";
};
export type ButtonsContainerFragment$key = {
  readonly " $data"?: ButtonsContainerFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ButtonsContainerFragment">;
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
  "name": "ButtonsContainerFragment",
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
          "kind": "ScalarField",
          "name": "email",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
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

(node as any).hash = "52624cdfc9bf20d7589bd06990d595b1";

export default node;
