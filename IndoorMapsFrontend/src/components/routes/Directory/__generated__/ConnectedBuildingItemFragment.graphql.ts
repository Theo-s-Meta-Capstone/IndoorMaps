/**
 * @generated SignedSource<<1b7de7d4b642e965894a793e526a754c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type EditorLevel = "editor" | "owner" | "viewer" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ConnectedBuildingItemFragment$data = {
  readonly building: {
    readonly databaseId: number;
    readonly description: string;
    readonly id: string;
    readonly title: string;
  };
  readonly editorLevel: EditorLevel;
  readonly id: string;
  readonly " $fragmentType": "ConnectedBuildingItemFragment";
};
export type ConnectedBuildingItemFragment$key = {
  readonly " $data"?: ConnectedBuildingItemFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ConnectedBuildingItemFragment">;
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
  "name": "ConnectedBuildingItemFragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "editorLevel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Building",
      "kind": "LinkedField",
      "name": "building",
      "plural": false,
      "selections": [
        (v0/*: any*/),
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
      "storageKey": null
    }
  ],
  "type": "BuildingWithPerms",
  "abstractKey": null
};
})();

(node as any).hash = "51e41ea9adfa1468f85461f17a8b18c1";

export default node;
