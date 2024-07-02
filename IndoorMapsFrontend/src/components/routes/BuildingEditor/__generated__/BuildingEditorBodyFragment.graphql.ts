/**
 * @generated SignedSource<<f228883f1b990c74601889c457de4741>>
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
    readonly address: string;
    readonly id: string;
    readonly title: string;
  }>;
  readonly id: string;
  readonly startPos: {
    readonly lat: number;
    readonly lon: number;
  };
  readonly title: string;
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
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "address",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BuildingEditorBodyFragment",
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
    (v2/*: any*/),
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
        (v2/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "Building",
  "abstractKey": null
};
})();

(node as any).hash = "26beb6697bfdc1c5a8c553f6b74cd3bd";

export default node;
