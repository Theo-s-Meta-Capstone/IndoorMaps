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
    const [, startTransition] = useTransition();
    const [data, refetch] = useRefetchableFragment(
        graphql`
          fragment AutoCompleteResultsFragment on Query
          @refetchable(queryName: "AutoCompleteRefetchQuerry") {
            getAutocomplete(data: $autocompleteInput) {
                items {
                    id
                    title
                    highlights {
                        title {
                            start
                            end
                        }
                    }
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
        let titleToDispaly = item.title;
        if(item.highlights && item.highlights.title){
            let newTitle = "";
            // supposedly the newer versions of ts are better at using filters to remove null and undefired, here we need as number[]
            const starts: number[] = item.highlights.title.map((titleHighlight) => titleHighlight.start).filter((val) => (val !== null && val !== undefined)) as number[];
            const ends: number[] = item.highlights.title.map((titleHighlight) => titleHighlight.end).filter((val) => (val !== null && val !== undefined)) as number[];
            for(let i = 0; i < titleToDispaly.length; i++){
                if(starts.includes(i)){
                    newTitle += "<span class=\"selectedText\">"
                }
                if(ends.includes(i)){
                    newTitle += "</span>"
                }
                newTitle += titleToDispaly.charAt(i);
            }
            titleToDispaly = newTitle
        }
        return (<li className="autocompleteResultItem" key={item.id}><Button onClick={() => chooseAutocompleteResult(item)}><p dangerouslySetInnerHTML={{ __html: titleToDispaly }} /></Button></li>)
    })

    return (
        <ul className="autocompleteResultsContainer">
            {listOfAutocompleteElements}
        </ul>
    )

}

export default AutoCompleteResults;
