import { TextInput, rem } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState, useTransition } from "react";
import { useDebounce } from "../../../utils/hooks";
import { fetchQuery, graphql, useRelayEnvironment } from "react-relay";
import { AreaSearchQuery, AreaSearchQuery$data } from "./__generated__/AreaSearchQuery.graphql";
import FormErrorNotification from "../../forms/FormErrorNotification";
import { AreaToAreaRouteInfo } from "../../../utils/types";
import AreaNavigate from "./AreaNavigate";

const iconSearch = <IconSearch style={{ width: rem(16), height: rem(16) }} />
const debounceTime = 140;

type Props = {
    buildingId: number;
    areaToAreaRouteInfo: AreaToAreaRouteInfo,
    setAreaToAreaRouteInfo: (newdata: AreaToAreaRouteInfo) => void,
}

const AreaSearch = ({ buildingId, areaToAreaRouteInfo, setAreaToAreaRouteInfo }: Props) => {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, "", debounceTime);
    const [, startTransition] = useTransition();
    const environment = useRelayEnvironment();
    const [formError, setFormError] = useState<string | null>(null);
    const [results, setResults] = useState<AreaSearchQuery$data>();
    const [isNavigating, setIsNavigating] = useState(false)

    const handleSetIsNavigating = (newVal: boolean) => {
        setIsNavigating(newVal);
    }

    const goToArea = (area: AreaSearchQuery$data["areaSearch"][number]): void => {
        setAreaToAreaRouteInfo({
            ...areaToAreaRouteInfo,
            to: {
                areaDatabaseId: area.databaseId,
                floorDatabaseId: area.floorDatabaseId,
                title: area.title,
                description: area.description
            }
        })
        setIsNavigating(true)
    }

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
            {isNavigating ?
                <AreaNavigate areaToAreaRouteInfo={areaToAreaRouteInfo} setIsNavigating={handleSetIsNavigating}/>
                :
                <>
                    <TextInput
                        leftSectionPointerEvents="none"
                        leftSection={iconSearch}
                        label="Search"
                        placeholder="search .."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                    <div className="searchResultsContainer">
                        {results ? results.areaSearch.map((area) => {
                            return (
                                <button onClick={() => goToArea(area)} key={area.id} className="areaResultsItem">
                                    <p className="areaResultsItemTitle">{area.title}</p>
                                    {area.description ?
                                        <p>Description:<br />{area.description}</p>
                                        : null}
                                </button>
                            )
                        })
                            : null}
                    </div>
                </>}
        </aside>
    )
}

export default AreaSearch;
