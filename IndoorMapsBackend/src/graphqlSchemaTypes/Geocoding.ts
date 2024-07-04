import { Field, Int, ObjectType } from "type-graphql"

@ObjectType()
class AutocompleteAddress {
    @Field({nullable: true})
    label: string

    @Field({nullable: true})
    countryCode?: string

    @Field({nullable: true})
    countryName?: string

    @Field({nullable: true})
    stateCode?: string

    @Field({nullable: true})
    state?: string

    @Field({nullable: true})
    postalCode?: string
}

@ObjectType()
class HighlightsRange {
    @Field(type => Int, {nullable: true})
    start: number

    @Field(type => Int, {nullable: true})
    end: number
}

@ObjectType()
class TitleHighlightsRange {
    @Field(type => [HighlightsRange]!, {nullable: true})
    title: HighlightsRange[]
}

@ObjectType()
export class AutocompleteItem {
    @Field()
    id: string

    @Field()
    title: string

    @Field({nullable: true})
    resultType: string

    @Field(type => AutocompleteAddress, {nullable: true})
    address: AutocompleteAddress

    @Field(type => TitleHighlightsRange, {nullable: true})
    highlights: TitleHighlightsRange
}

@ObjectType()
export class Autocomplete {
    @Field(type => [AutocompleteItem]!)
    items: AutocompleteItem[]
}

@ObjectType()
export class Geododer {
}
