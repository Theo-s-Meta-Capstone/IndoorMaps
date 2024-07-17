import { Button, Group, rem } from "@mantine/core";
import { AreaToAreaRouteInfo } from "../../../../utils/types";
import { IconArrowLeft, IconCurrentLocation, IconLocationShare } from "@tabler/icons-react";
import AreaSearchBox from "./AreaSearchBox";
import { AreaSearchBoxQuery$data } from "./__generated__/AreaSearchBoxQuery.graphql";
import { useEffect, useState } from "react";
import { fetchQuery, graphql, useRelayEnvironment } from "react-relay";
import { AreaNavigateQuery } from "./__generated__/AreaNavigateQuery.graphql";
import { LatLng } from "leaflet";

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
    const environment = useRelayEnvironment();

    const setFrom = (area: AreaSearchBoxQuery$data["areaSearch"][number]) => {
        setFromSearchQuery(area.title);
        setAreaToAreaRouteInfo({
            ...areaToAreaRouteInfo,
            from: {
                ...area,
                areaDatabaseId: area.databaseId
            }
        })
    }

    const setTo = (area: AreaSearchBoxQuery$data["areaSearch"][number]) => {
        setToSearchQuery(area.title);
        setAreaToAreaRouteInfo({
            ...areaToAreaRouteInfo,
            to: {
                ...area,
                areaDatabaseId: area.databaseId
            }
        })
    }

    useEffect(() => {
        if (!(areaToAreaRouteInfo.to instanceof Object && areaToAreaRouteInfo.from instanceof Object)) return;
        fetchQuery<AreaNavigateQuery>(
            environment,
            graphql`
                query AreaNavigateQuery($data: NavigationInput!) {
                    getNavBetweenAreas(data: $data) {
                        path {
                            lat
                            lon
                        }
                    }
                }
            `,
            {
                data: {
                    "areaFromId": areaToAreaRouteInfo.from.areaDatabaseId,
                    "areaToId": areaToAreaRouteInfo.to.areaDatabaseId
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
                    if (!data || !data.getNavBetweenAreas) {
                        setFormError("No response when loading lat/long for autocomplete result");
                        return;
                    }
                    setAreaToAreaRouteInfo({
                        ...areaToAreaRouteInfo,
                        path: data.getNavBetweenAreas.path.map((point) => new LatLng(point.lat, point.lon))
                    })
                }
            });
    }, [areaToAreaRouteInfo.to, areaToAreaRouteInfo.from])

    return (
        <Group wrap="nowrap" align="top" style={{ height: "100%" }}>
            <Button className="backToSearchAreaButton" title="back to area search" onClick={() => setIsNavigating(false)}>
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
                    setSearchQuery={(newQuery: string) => setFromSearchQuery(newQuery)}
                    setFormError={(newVal: string) => setFormError(newVal)}
                    buildingId={buildingId}
                    setSelectedResponse={setFrom}
                    // show results if nothing is selected, or if the search query doesn't match the title
                    showResults={areaToAreaRouteInfo.from !== "gpsLocation" && (!(areaToAreaRouteInfo.from instanceof Object) || areaToAreaRouteInfo.from.title !== fromSearchQuery)}
                >
                    <Button style={{ width: "100%", margin: ".5em 0px" }} onClick={() => {
                        setFromSearchQuery("gpsLocation")
                        setAreaToAreaRouteInfo({
                            ...areaToAreaRouteInfo,
                            from: "gpsLocation"
                        })
                    }}>My GPS Location</Button>
                </AreaSearchBox>

                <AreaSearchBox
                    textInputProps={{
                        leftSection: iconLocationShare,
                        label: "To:",
                    }}
                    searchQuery={toSearchQuery}
                    setSearchQuery={(newQuery: string) => setToSearchQuery(newQuery)}
                    setFormError={(newVal: string) => setFormError(newVal)}
                    buildingId={buildingId}
                    setSelectedResponse={setTo}
                    showResults={areaToAreaRouteInfo.to?.title !== toSearchQuery}
                />
            </div>
        </Group>
    )
}

export default AreaNavigate;
