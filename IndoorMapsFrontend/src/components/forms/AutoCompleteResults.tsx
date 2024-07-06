import { useRefetchableFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { AutoCompleteResultsFragment$data, AutoCompleteResultsFragment$key } from "./__generated__/AutoCompleteResultsFragment.graphql";
import { useEffect } from "react";
import { Button } from "@mantine/core";
import { useDebounce } from "../../utils/hooks";

// I chose 300 with input from https://stackoverflow.com/a/73979506
const debounceTime = 300;

interface Props {
    searchString: string,
    getGeocoder: AutoCompleteResultsFragment$key,
    chooseAutocompleteResult: (item: AutoCompleteResultsFragment$data["getAutocomplete"]["items"][number]) => void,
}

const AutoCompleteResults = ({ getGeocoder, searchString, chooseAutocompleteResult }: Props) => {
    const debouncedValue = useDebounce(searchString, "", debounceTime);
    // TODO: convert to fetchQuery to avoid suspense after new load
    // See https://relay.dev/docs/guided-tour/refetching/refetching-fragments-with-different-data/
    const [data, refetch] = useRefetchableFragment(
        graphql`
          fragment AutoCompleteResultsFragment on Query
          @refetchable(queryName: "AutoCompleteRefetchQuerry") {
            getAutocomplete(data: $autocompleteInput) {
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
        if (searchString.length > 0) {
            refetch({ autocompleteInput: { p: searchString } }, { fetchPolicy: 'store-or-network' })
        }
    }, [debouncedValue])

    const listOfAutocompleteElements = data.getAutocomplete.items.map(item => {
        return (<li key={item.id}><Button onClick={() => chooseAutocompleteResult(item)}>{item.title}</Button></li>)
    })

    return (
        <ul>
            {listOfAutocompleteElements}
        </ul>
    )

}

export default AutoCompleteResults;
