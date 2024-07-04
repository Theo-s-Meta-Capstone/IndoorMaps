import { Arg, Ctx, Query, Field, ObjectType, Resolver, InputType, Int } from "type-graphql";
import { GraphQLError } from "graphql";

import { Context } from "../utils/context.js";
import { Autocomplete } from "../graphqlSchemaTypes/Geocoding.js";
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

@Resolver()
export class AutocompleteResolver {
    @Query((returns) => Autocomplete)
    async getAutocomplete(
        @Arg('data') data: AutocompleteInput,
        @Ctx() ctx: Context,
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

    @Query((returns) => LatLng)
    async locationLookup(
        @Arg('data') data: LocationLookupInput,
        @Ctx() ctx: Context,
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
