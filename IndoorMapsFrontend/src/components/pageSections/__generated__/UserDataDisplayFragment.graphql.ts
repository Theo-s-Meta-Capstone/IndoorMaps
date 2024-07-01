/**
 * @generated SignedSource<<9a8ab92d5244177dbdc69565411b0dee>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserDataDisplayFragment$data = {
  readonly id: string;
  readonly isLogedIn: boolean;
  readonly user: {
    readonly email: string;
    readonly id: string;
    readonly name: string;
  } | null | undefined;
  readonly " $fragmentType": "UserDataDisplayFragment";
};
export type UserDataDisplayFragment$key = {
  readonly " $data"?: UserDataDisplayFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserDataDisplayFragment">;
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
  "name": "UserDataDisplayFragment",
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

(node as any).hash = "21f28438ddbb1dad1bfefd7be6202ba4";

export default node;
