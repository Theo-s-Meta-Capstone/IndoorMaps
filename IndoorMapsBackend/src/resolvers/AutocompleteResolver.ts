import { Arg, Ctx, Query, Field, ObjectType, Resolver, InputType, Int, FieldResolver, Root } from "type-graphql";
import { GraphQLError } from "graphql";

import { Context } from "../utils/context.js";
import { Autocomplete, AutocompleteItem, Geododer } from "../graphqlSchemaTypes/Geocoding.js";
import { LatLng } from "../graphqlSchemaTypes/Building.js";

@InputType()
class AutocompleteInput {
    @Field()
    p: string

    @Field(type => Int)
    limit: number
}

@InputType()
class LocationLookupInput {
    @Field()
    id: string
}

@Resolver(Geododer)
export class GeododerResolver {
    @Query((returns) => Geododer)
    async getAutocomplete() {
        return {}
    }

    @FieldResolver((type) => Autocomplete)
    async autocomplete(
        @Arg('data') data: AutocompleteInput,
    ): Promise<Autocomplete> {
        try {
            const url = `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${data.p}&limit=${data.limit}&apiKey=${process.env.HERE_API_KEY}`
            const response = await fetch(url);
            const body = await response.json();
            return {
                items: (body as Autocomplete).items.map(item => item)
            }
        }
        catch (error) {
            console.error(error)
            throw new GraphQLError('Failed to get from HERE api', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
    }

    @FieldResolver((returns) => LatLng)
    async locationLookup(
        @Arg('data') data: LocationLookupInput,
    ): Promise<LatLng> {
        try {
            const url = `https://lookup.search.hereapi.com/v1/lookup?id=${data.id}&apiKey=${process.env.HERE_API_KEY}`
            const response = await fetch(url);
            const body = await response.json();
            const typedBody = body as {"position": {"lat": number, "lng": number}}
            return new LatLng(typedBody.position.lat, typedBody.position.lng)
        }
        catch (error) {
            console.error(error)
            throw new GraphQLError('Failed to get from HERE api', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
    }
}
