import { Button, Group, rem } from "@mantine/core";
import { AreaToAreaRouteInfo } from "../../../../utils/types";
import { IconArrowLeft, IconCurrentLocation, IconLocationShare } from "@tabler/icons-react";
import AreaSearchBox from "./AreaSearchBox";
import { AreaSearchBoxQuery$data } from "./__generated__/AreaSearchBoxQuery.graphql";
import { useState } from "react";

const iconCurrentLocation = <IconCurrentLocation style={{ width: rem(16), height: rem(16) }} />
const iconLocationShare = <IconLocationShare style={{ width: rem(16), height: rem(16) }} />

type Props = {
    areaToAreaRouteInfo: AreaToAreaRouteInfo,
    setAreaToAreaRouteInfo: (newdata: AreaToAreaRouteInfo) => void,
    setIsNavigating: (newVal: boolean) => void,
    buildingId: number,
    setFormError: (newError: string) => void,
}

const AreaNavigate = ({ buildingId, areaToAreaRouteInfo, setAreaToAreaRouteInfo, setIsNavigating, setFormError }: Props) => {
    const [fromSearchQuery, setFromSearchQuery] = useState<string>(areaToAreaRouteInfo.from instanceof Object ? areaToAreaRouteInfo.from.title : "")
    const [toSearchQuery, setToSearchQuery] = useState<string>(areaToAreaRouteInfo.to ? areaToAreaRouteInfo.to.title : "")
    return (
        <Group>
            <Button title="back to area search" onClick={() => setIsNavigating(false)}>
                <IconArrowLeft style={{ width: rem(16), height: rem(16) }} />
            </Button>
            <div className="navigationInputs">
                <AreaSearchBox
                    textInputProps={{
                        autoFocus: true,
                        leftSection: iconCurrentLocation,
                        label: "From:",
                    }}
                    searchQuery={fromSearchQuery}
                    setSearchQuery={(newQuery: string)=>setFromSearchQuery(newQuery)}
                    setFormError={(newVal: string) => setFormError(newVal)}
                    buildingId={buildingId}
                    setSelectedResponse={(selectedArea: AreaSearchBoxQuery$data["areaSearch"][number]) => console.log(selectedArea)}
                />

                <AreaSearchBox
                    textInputProps={{
                        leftSection:iconLocationShare,
                        label:"To:",
                    }}
                    searchQuery={toSearchQuery}
                    setSearchQuery={(newQuery: string)=>setToSearchQuery(newQuery)}
                    setFormError={(newVal: string) => setFormError(newVal)}
                    buildingId={buildingId}
                    setSelectedResponse={(selectedArea: AreaSearchBoxQuery$data["areaSearch"][number]) => console.log(selectedArea)}
                />
            </div>
        </Group>
    )
}

export default AreaNavigate;
