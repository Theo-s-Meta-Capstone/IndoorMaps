import { Button, Switch, rem } from "@mantine/core";
import { AreaToAreaRouteInfo } from "../../../../utils/types";
import { IconArrowLeft, IconCurrentLocation, IconLocationShare } from "@tabler/icons-react";
import AreaSearchBox from "./AreaSearchBox";
import { AreaSearchBoxQuery$data } from "./__generated__/AreaSearchBoxQuery.graphql";
import { useEffect, useRef, useState } from "react";
import { fetchQuery, graphql, useRelayEnvironment } from "react-relay";
import { LatLng } from "leaflet";
import { AreaNavigateAllDataQuery, AreaNavigateAllDataQuery$variables } from "./__generated__/AreaNavigateAllDataQuery.graphql";
import { useUserLocation } from "../../../../utils/hooks";

const iconCurrentLocation = <IconCurrentLocation style={{ width: rem(16), height: rem(16) }} />
const iconLocationShare = <IconLocationShare style={{ width: rem(16), height: rem(16) }} />
const kmToFeet = 3280.84;

type Props = {
    areaToAreaRouteInfo: AreaToAreaRouteInfo,
    setAreaToAreaRouteInfo: (newdata: AreaToAreaRouteInfo) => void,
    setIsNavigating: (newVal: boolean) => void,
    buildingId: number,
    setFormError: (newError: string) => void,
}

const getNavWithAllData = graphql`
query AreaNavigateAllDataQuery($data: NavigationInput!) {
    getNavBetweenAreas(data: $data) {
        path {
            lat
            lon
        }
        walls
        navMesh
        neededToGenerateANavMesh
        distance
    }
}
`
const getNavWithoutData = graphql`
query AreaNavigateQuery($data: NavigationInput!) {
    getNavBetweenAreas(data: $data) {
        path {
            lat
            lon
        }
        neededToGenerateANavMesh
        distance
    }
}
`

const AreaNavigate = ({ buildingId, areaToAreaRouteInfo, setAreaToAreaRouteInfo, setIsNavigating, setFormError }: Props) => {
    const [fromSearchQuery, setFromSearchQuery] = useState<string>(areaToAreaRouteInfo.from instanceof Object ? areaToAreaRouteInfo.from.title : "")
    const [toSearchQuery, setToSearchQuery] = useState<string>(areaToAreaRouteInfo.to ? areaToAreaRouteInfo.to.title : "")
    const environment = useRelayEnvironment();
    const isUsingCurrentLocationNav = useRef(false)
    const areaToAreaRouteInfoRef = useRef(areaToAreaRouteInfo);

    useEffect(() => {
        areaToAreaRouteInfoRef.current = areaToAreaRouteInfo;
    }, [areaToAreaRouteInfo])

    const getUserLocaiton = useUserLocation((position: GeolocationPosition) => {
        if (isUsingCurrentLocationNav.current) {
            setFromWithGPS([position.coords.latitude, position.coords.longitude]);
        }
    }, (errorMessage: string) => {
        setFormError(errorMessage);
    });

    const setFromWithGPS = (curPos: number[]) => {
        setFromSearchQuery("gpsLocation " + curPos)
        // I think this sufferers from the same issue as clicking on an area in viewer map loader, which is why I'm using a Ref
        setAreaToAreaRouteInfo({
            ...areaToAreaRouteInfoRef.current,
            from: "gpsLocation",
            currentGPSCoords: new LatLng(curPos[0], curPos[1])
        })
    }

    const setFrom = (area: AreaSearchBoxQuery$data["areaSearch"][number]) => {
        setFromSearchQuery(area.title);
        isUsingCurrentLocationNav.current = false
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

    const updateOptions = (event: React.ChangeEvent<HTMLInputElement>, optionToUpdate: string) => {
        const newInfo = {
            ...areaToAreaRouteInfo,
        }
        if (!newInfo.options) newInfo.options = {}
        newInfo.options[optionToUpdate] = event.currentTarget.checked;
        setAreaToAreaRouteInfo(newInfo)
    }

    const getNewPath = () => {
        if (!(areaToAreaRouteInfo.to instanceof Object && areaToAreaRouteInfo.from !== undefined)) return;
        let query = getNavWithAllData;
        if (!areaToAreaRouteInfo.options?.showEdges && !areaToAreaRouteInfo.options?.showWalls) query = getNavWithoutData
        let startTime: number, endTime: number;
        const data: AreaNavigateAllDataQuery$variables["data"] = {
            "areaToId": areaToAreaRouteInfo.to.areaDatabaseId
        }
        if (areaToAreaRouteInfo.from instanceof Object) {
            data["areaFromId"] = areaToAreaRouteInfo.from.areaDatabaseId
        } else if (areaToAreaRouteInfo.currentGPSCoords) {
            data["locationFromLat"] = areaToAreaRouteInfo.currentGPSCoords.lat
            data["locationFromLon"] = areaToAreaRouteInfo.currentGPSCoords.lng
        } else {
            return;
        }
        data["pathfindingMethod"] = areaToAreaRouteInfo.options?.useVoronoi ?? false ? "Voronoi" : "Standard";
        fetchQuery<AreaNavigateAllDataQuery>(
            environment,
            query,
            {
                data
            },
        )
            .subscribe({
                start: () => { startTime = performance.now(); },
                complete: () => { },
                error: (error: Error) => {
                    setFormError(error.message.split("\n\n")[0]);
                },
                next: (data) => {
                    endTime = performance.now();
                    if (!data || !data.getNavBetweenAreas) {
                        setFormError("No response when loading lat/long for autocomplete result");
                        return;
                    }
                    if (areaToAreaRouteInfo.options?.showEdges || areaToAreaRouteInfo.options?.showWalls) {
                        setAreaToAreaRouteInfo({
                            ...areaToAreaRouteInfo,
                            path: data.getNavBetweenAreas.path.map((point) => new LatLng(point.lat, point.lon)),
                            walls: data.getNavBetweenAreas.walls,
                            navMesh: data.getNavBetweenAreas.navMesh,
                            info: {
                                requestTime: endTime - startTime,
                                generateNewNavMesh: data.getNavBetweenAreas.neededToGenerateANavMesh
                            },
                            distance: data.getNavBetweenAreas.distance
                        })
                    } else {
                        const newRouteInfo = {
                            ...areaToAreaRouteInfo,
                            path: data.getNavBetweenAreas.path.map((point) => new LatLng(point.lat, point.lon)),
                            distance: data.getNavBetweenAreas.distance,
                            info: {
                                requestTime: endTime - startTime,
                                generateNewNavMesh: data.getNavBetweenAreas.neededToGenerateANavMesh
                            },
                        }
                        newRouteInfo.navMesh = undefined;
                        newRouteInfo.walls = undefined;
                        setAreaToAreaRouteInfo(newRouteInfo)
                    }
                }
            });
    }

    useEffect(() => {
        getNewPath()
    }, [areaToAreaRouteInfo.to, areaToAreaRouteInfo.from, areaToAreaRouteInfo.options?.showEdges, areaToAreaRouteInfo.options?.showWalls, areaToAreaRouteInfo.options?.useVoronoi])

    useEffect(() => {
        if (isUsingCurrentLocationNav.current) {
            getNewPath()
        }
    }, [areaToAreaRouteInfo.currentGPSCoords])

    useEffect(() => {
        if (areaToAreaRouteInfo.to) {
            setToSearchQuery(areaToAreaRouteInfo.to.title)
        }
    }, [areaToAreaRouteInfo.to])

    return (
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
                showResults={!(areaToAreaRouteInfo.from instanceof Object) || areaToAreaRouteInfo.from.title !== fromSearchQuery}
                leftOfInputElements={(
                    <Button className="backToSearchAreaButton" title="back to area search" onClick={() => setIsNavigating(false)}>
                        <IconArrowLeft style={{ width: rem(16), height: rem(16) }} />
                    </Button>
                )}
            >
                <Button style={{ width: "100%", margin: ".5em 0px" }} onClick={() => {
                    setFromSearchQuery("gpsLocation Loading...")
                    isUsingCurrentLocationNav.current = true
                    getUserLocaiton();
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
            {areaToAreaRouteInfo.distance !== undefined ? Math.round(areaToAreaRouteInfo.distance * kmToFeet) + " ft" : null}
            {areaToAreaRouteInfo.to?.description ? <p className="areaDescription">{areaToAreaRouteInfo.to.description}</p> : null}
            <div className="extraOptionsForNav">
                <Switch
                    onChange={(e) => updateOptions(e, "showWalls")}
                    checked={areaToAreaRouteInfo.options?.showWalls ?? false}
                    label="Show Walls"
                />
                <Switch
                    onChange={(e) => updateOptions(e, "showEdges")}
                    checked={areaToAreaRouteInfo.options?.showEdges ?? false}
                    label="Show Edges"
                />
                <Switch
                    onChange={(e) => updateOptions(e, "showInfo")}
                    checked={areaToAreaRouteInfo.options?.showInfo ?? false}
                    label="Show Info"
                />
                <Switch
                    onChange={(e) => updateOptions(e, "useVoronoi")}
                    checked={areaToAreaRouteInfo.options?.useVoronoi ?? false}
                    label="use Voronoi based Nav Mesh"
                />
                {areaToAreaRouteInfo.info && (areaToAreaRouteInfo.options?.showInfo ?? false) ?
                    (<p>Needed to Generate a new nav mesh: {areaToAreaRouteInfo.info.generateNewNavMesh.toString()}<br />
                        Time to complete request: {areaToAreaRouteInfo.info.requestTime}ms</p>)
                    : null}
            </div>
        </div>
    )
}

export default AreaNavigate;