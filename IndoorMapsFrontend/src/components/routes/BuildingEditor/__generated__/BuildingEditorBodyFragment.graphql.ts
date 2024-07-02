/**
 * @generated SignedSource<<f645ae9978eb8e46de44dc81fa49466c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BuildingEditorBodyFragment$data = {
  readonly address: string;
  readonly databaseId: number;
  readonly floors: ReadonlyArray<{
    readonly description: string;
    readonly id: string;
    readonly shape: string | null | undefined;
    readonly title: string;
  }>;
  readonly id: string;
  readonly startPos: {
    readonly lat: number;
    readonly lon: number;
  };
  readonly title: string;
  readonly " $fragmentSpreads": FragmentRefs<"EditorSidebarBodyFragment">;
  readonly " $fragmentType": "BuildingEditorBodyFragment";
};
export type BuildingEditorBodyFragment$key = {
  readonly " $data"?: BuildingEditorBodyFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BuildingEditorBodyFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BuildingEditorBodyFragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "EditorSidebarBodyFragment"
    },
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    (v1/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "LatLng",
      "kind": "LinkedField",
      "name": "startPos",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "lat",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "lon",
          "storageKey": null
        }
      ],
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
      "concreteType": "Floor",
      "kind": "LinkedField",
      "name": "floors",
      "plural": true,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
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
      "storageKey": null
    }
  ],
  "type": "Building",
  "abstractKey": null
};
})();

(node as any).hash = "c253c45ba8e7a54bead2b7381bac2d61";

export default node;
