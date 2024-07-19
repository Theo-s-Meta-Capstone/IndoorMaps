import { useEffect, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import FormErrorNotification from "../../../forms/FormErrorNotification";
import { AreaToAreaRouteInfo } from "../../../../utils/types";
import AreaNavigate from "./AreaNavigate";
import AreaSearchBox from "./AreaSearchBox";
import { AreaSearchBoxQuery$data } from "./__generated__/AreaSearchBoxQuery.graphql";
import { rem } from "@mantine/core";

const iconSearch = <IconSearch style={{ width: rem(16), height: rem(16) }} />

type Props = {
    buildingId: number;
    areaToAreaRouteInfo: AreaToAreaRouteInfo,
    setAreaToAreaRouteInfo: (newdata: AreaToAreaRouteInfo) => void,
}

const AreaSearch = ({ buildingId, areaToAreaRouteInfo, setAreaToAreaRouteInfo }: Props) => {
    const [formError, setFormError] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false)
    const [searchQuery, setSearchQuery] = useState<string>("");

    const handleSetError = (newVal: string) => setFormError(newVal)

    const handleSetIsNavigating = (newVal: boolean) => {
        setIsNavigating(newVal);
    }

    const goToArea = (area: AreaSearchBoxQuery$data["areaSearch"][number]): void => {
        setAreaToAreaRouteInfo({
            ...areaToAreaRouteInfo,
            to: {
                isLatLon: false,
                areaDatabaseId: area.databaseId,
                floorDatabaseId: area.floorDatabaseId,
                title: area.title,
                description: area.description
            }
        })
        setIsNavigating(true)
    }

    useEffect(() => {
        if(areaToAreaRouteInfo.to) {
            setIsNavigating(true)
        }
    }, [areaToAreaRouteInfo.to])

    return (
        <aside className="AreaSearch">
            <FormErrorNotification formError={formError} onClose={() => setFormError(null)} />
            {isNavigating ?
                <AreaNavigate buildingId={buildingId} setFormError={handleSetError} areaToAreaRouteInfo={areaToAreaRouteInfo} setAreaToAreaRouteInfo={setAreaToAreaRouteInfo} setIsNavigating={handleSetIsNavigating} />
                :
                <AreaSearchBox
                    textInputProps={{
                        leftSection: iconSearch,
                        label: "Search",
                        placeholder: "search .."
                    }}
                    setFormError={handleSetError}
                    buildingId={buildingId}
                    searchQuery={searchQuery}
                    setSearchQuery={(newQuery: string) => setSearchQuery(newQuery)}
                    setSelectedResponse={(selectedArea: AreaSearchBoxQuery$data["areaSearch"][number]) => goToArea(selectedArea)}
                />}
        </aside>
    )
}

export default AreaSearch;
