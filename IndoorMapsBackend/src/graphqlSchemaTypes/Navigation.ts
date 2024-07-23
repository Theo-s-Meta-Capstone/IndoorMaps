import { Field, Float, ObjectType } from "type-graphql"
import { Wall, NavMesh } from "../navMesh/GenerateNavMesh"
import { LatLng } from "./Building"

@ObjectType()
export class NavigationResult {
    @Field((type) => [LatLng]!)
    path: LatLng[]

    @Field(type => Boolean)
    neededToGenerateANavMesh: boolean

    @Field(type => Float)
    distance: number

    fromAreaIgnorableWalls: Wall[]
    toAreaWallsWithoutIgnorable: Wall[]
    navMeshData: NavMesh
}
