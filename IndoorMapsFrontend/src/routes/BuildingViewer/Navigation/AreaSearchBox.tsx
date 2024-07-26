import { Group, TextInput, TextInputProps } from "@mantine/core";
import { useEffect, useState, useTransition } from "react";
import { fetchQuery, graphql, useRelayEnvironment } from "react-relay";
import { useDebounce } from "../../../utils/hooks";
import { AreaSearchBoxQuery, AreaSearchBoxQuery$data } from "./__generated__/AreaSearchBoxQuery.graphql";

const debounceTime = 140;

type Props = {
    startingValue?: string;
    setSelectedResponse: (area: AreaSearchBoxQuery$data["areaSearch"][number]) => void;
    buildingId: number;
    setFormError: (newError: string) => void;
    textInputProps?: TextInputProps;
    searchQuery: string,
    setSearchQuery: (newVal: string) => void;
    children?: React.ReactNode;
    showResults?: boolean
    leftOfInputElements?: React.ReactNode;
    textBoxRef?: React.MutableRefObject<HTMLInputElement | null>;
}

const AreaSearchBox = ({ textBoxRef, searchQuery, setSearchQuery, setSelectedResponse, buildingId, setFormError, textInputProps, children, showResults = true, leftOfInputElements }: Props) => {
    const environment = useRelayEnvironment();
    const debouncedSearchQuery = useDebounce(searchQuery, "", debounceTime);
    const [, startTransition] = useTransition();
    const [results, setResults] = useState<AreaSearchBoxQuery$data>();

    useEffect(() => {
        fetchQuery<AreaSearchBoxQuery>(
            environment,
            graphql`
            query AreaSearchBoxQuery($data: AreaSearchInput!) {
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
        <>
            <Group wrap="nowrap">
                {leftOfInputElements}
                <TextInput
                    {...textInputProps}
                    style={{ flexGrow: "2" }}
                    leftSectionPointerEvents="none"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    ref={textBoxRef}
                />
            </Group>
            <div className="searchResultsContainer">
                {children}

                {showResults && results ? results.areaSearch.map((area) => {
                    return (
                        <button onClick={() => setSelectedResponse(area)} key={area.id} className="areaResultsItem">
                            <p className="areaResultsItemTitle">{area.title}</p>
                            {area.description ?
                                <p>Description:<br />{area.description}</p>
                                : null}
                        </button>
                    )
                })
                    : null}
            </div>
        </>
    )
}

export default AreaSearchBox;
