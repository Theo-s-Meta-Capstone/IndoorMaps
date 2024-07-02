/**
 * @generated SignedSource<<a1e796e2d43a787e428e41ba20289a76>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EditorSidebarBodyFragment$data = {
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
  readonly " $fragmentType": "EditorSidebarBodyFragment";
};
export type EditorSidebarBodyFragment$key = {
  readonly " $data"?: EditorSidebarBodyFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"EditorSidebarBodyFragment">;
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
  "name": "EditorSidebarBodyFragment",
  "selections": [
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

(node as any).hash = "a4256f56a4f544cced5a95b7be1ca73f";

export default node;
