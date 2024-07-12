import { TextInput, rem } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState, useTransition } from "react";
import { useDebounce } from "../../../utils/hooks";
import { fetchQuery, graphql, useRelayEnvironment } from "react-relay";
import { AreaSearchQuery, AreaSearchQuery$data } from "./__generated__/AreaSearchQuery.graphql";
import FormErrorNotification from "../../forms/FormErrorNotification";

const iconSearch = <IconSearch style={{ width: rem(16), height: rem(16) }} />
const debounceTime = 140;

type Props = {
    map: L.Map;
    buildingId: number;
}

const AreaSearch = ({ buildingId }: Props) => {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, "", debounceTime);
    const [, startTransition] = useTransition();
    const environment = useRelayEnvironment();
    const [formError, setFormError] = useState<string | null>(null);
    const [results, setResults] = useState<AreaSearchQuery$data>();

    useEffect(() => {
        fetchQuery<AreaSearchQuery>(
            environment,
            graphql`
            query AreaSearchQuery($data: AreaSearchInput!) {
                areaSearch(data: $data) {
                    id
                    databaseId
                    title
                    floorDatabaseId
                    description
                }
            }
            `,
            {
                data: {
                    "id": buildingId,
                    "query": debouncedSearchQuery
                }
            },
        )
            .subscribe({
                start: () => { },
                complete: () => { },
                error: (error: Error) => {
                    setFormError(error.message);
                },
                next: (data) => {
                    if (!data) {
                        setFormError("Error with search");
                        return;
                    }
                    startTransition(() => {
                        setResults(data)
                    });
                }
            });
    }, [debouncedSearchQuery])

    return (
        <aside className="AreaSearch">
            <FormErrorNotification formError={formError} onClose={() => setFormError(null)} />
            <TextInput
                leftSectionPointerEvents="none"
                leftSection={iconSearch}
                label="Search"
                placeholder="search .."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
            />
            {results ? results.areaSearch.map((area) => {
                return (
                    <div className="areaResultsItem">
                        <p>{area.title}</p>
                        <p>{area.description}</p>
                    </div>
                )
            })
            : null}
        </aside>
    )
}

export default AreaSearch;
