import { useRefetchableFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { AutoCompleteResultsFragment$data, AutoCompleteResultsFragment$key } from "./__generated__/AutoCompleteResultsFragment.graphql";
import { useEffect, useTransition } from "react";
import { Button } from "@mantine/core";
import { useDebounce } from "../../utils/hooks";

// I chose 300 with input from https://stackoverflow.com/a/73979506
const debounceTime = 300;

type Props = {
    searchString: string,
    getGeocoder: AutoCompleteResultsFragment$key,
    chooseAutocompleteResult: (item: AutoCompleteResultsFragment$data["getAutocomplete"]["items"][number]) => void,
}

const AutoCompleteResults = ({ getGeocoder, searchString, chooseAutocompleteResult }: Props) => {
    const debouncedValue = useDebounce(searchString, "", debounceTime);
    const [_, startTransition] = useTransition();
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
            startTransition(() => {
                refetch({ autocompleteInput: { p: searchString } }, { fetchPolicy: 'store-or-network' })
            });
        }
    }, [debouncedValue])

    const listOfAutocompleteElements = data.getAutocomplete.items.map(item => {
        return (<li className="autocompleteResultItem" key={item.id}><Button onClick={() => chooseAutocompleteResult(item)}>{item.title}</Button></li>)
    })

    return (
        <ul className="autocompleteResultsContainer">
            {listOfAutocompleteElements}
        </ul>
    )

}

export default AutoCompleteResults;
