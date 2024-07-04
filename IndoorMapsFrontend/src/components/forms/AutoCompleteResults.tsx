import { Button } from "@mantine/core";
import { useRefetchableFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { AutoCompleteResultsFragment$key } from "./__generated__/AutoCompleteResultsFragment.graphql";
import { useEffect } from "react";

interface Props {
    searchString: string,
    getGeocoder: AutoCompleteResultsFragment$key,
}

const AutoCompleteResults = ({ getGeocoder, searchString }: Props) => {
    // TODO: convert to fetchQuery to avoid suspense after new load
    // See https://relay.dev/docs/guided-tour/refetching/refetching-fragments-with-different-data/
    const [data, refetch] = useRefetchableFragment(
        graphql`
          fragment AutoCompleteResultsFragment on Query
          @refetchable(queryName: "AutoCompleteRefetchQuerry") {
            getAutocomplete(data: $data) {
                items {
                    id
                    title
                }
            }
          }
        `,
        getGeocoder,
    );

    useEffect(() => {
        console.log(searchString)
        if(searchString.length > 0) {
            refetch({ data: { p: searchString } }, { fetchPolicy: 'store-or-network' })
        }
    }, [searchString])

    return (
        <>
            {JSON.stringify(data)}
        </>
    )

}

export default AutoCompleteResults;
