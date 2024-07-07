import { Arg, Query, Field, Resolver, InputType } from "type-graphql";
import { GraphQLError } from "graphql";

import { Autocomplete, Geocoder } from "../graphqlSchemaTypes/Geocoding.js";
import { LatLng } from "../graphqlSchemaTypes/Building.js";

@InputType()
class AutocompleteInput {
    @Field({nullable: true})
    p?: string
}

@InputType()
class LocationLookupInput {
    @Field({nullable: true})
    id?: string
}

@Resolver()
export class GeododerResolver {
    @Query((type) => Autocomplete)
    async getAutocomplete(
        @Arg('data') data: AutocompleteInput,
    ): Promise<Autocomplete> {
        if(data.p === null){
            return {
                items: []
            }
        }
        try {
            const url = `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${data.p}&limit=${5}&apiKey=${process.env.HERE_API_KEY}`
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

    @Query((returns) => LatLng, {nullable: true})
    async getLocationLookup(
        @Arg('data') data: LocationLookupInput,
    ): Promise<LatLng> {
        if(data.id === null){
            return new LatLng(0, 0)
        }
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
