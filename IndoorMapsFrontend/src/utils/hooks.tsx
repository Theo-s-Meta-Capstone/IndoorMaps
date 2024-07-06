import { useEffect, useRef, useState } from "react";
import { graphql, loadQuery, useRelayEnvironment } from "react-relay";

/**
 * A wrapper for useState<boolean>, commonly used to show modals and to removed the need for close modal handlers
 * Code borrowed from my last project Kudos-Board
 * @param initalValue the initial value of the boolean
 * @returns
 *           [booleanValue, setFalse, setTrue] where booleanValue is the current value of the boolean,
 *           setFalse is a function that sets the boolean to false
 *           and setTrue is a function that sets the boolean to true
 *           Both of these are not states so they can be passed down as props to child components
 */
export const useBooleanState = (initalValue: boolean) => {
    const [booleanValue, setBooleanValue] = useState<boolean>(initalValue);

    const setFalse = () => {
        setBooleanValue(false);
    }

    const setTrue = () => {
        setBooleanValue(true);
    }

    // Const Assertion stops typescript from widing type
    // Read more https://medium.com/@taitasciore/const-assertions-and-type-narrowing-widening-in-typescript-72005b201f28
    return [booleanValue, setFalse, setTrue] as const;
}

/**
 * Provides wrappers around loadQuery that make it easier to refresh the relay cache
 * @returns [refreshFloorData, refreshBuildingData] where refreshFloorData is a function that takes in a floor database id and refreshes the floor data in the relay cache
 *                                                  and refreshBuildingData is a function that takes in a building database id and refreshes the building data in the relay cache
 */
export const useRefreshRelayCache = () => {
    const environment = useRelayEnvironment();

    const refreshFloorQuery = graphql`
        query hooksGetFloorQuery($data: FloorUniqueInput!) {
            getFloor(data: $data) {
                ...FloorListItemFragment
                ...AreaSidebarBodyFragment
            }
        }
    `;

    const refreshFloorData = (floorDatabaseId: number) => {
        loadQuery(
            environment,
            refreshFloorQuery,
            {
                data: {
                    id: floorDatabaseId
                }
            },
            { fetchPolicy: "network-only" }
        );
    }

    const refreshBuildingQuery = graphql`
        query hooksGetBuildingQuery($data: BuildingUniqueInput!) {
            getBuilding(data: $data) {
                id
                floors {
                    ...FloorListItemFragment
                }
            }
        }
    `;

    const refreshBuildingData = (buildingDatabseId: number) => {
        loadQuery(
            environment,
            refreshBuildingQuery,
            {
                data: {
                    id: buildingDatabseId
                }
            },
            { fetchPolicy: "network-only" }
        );
    }

    return [refreshFloorData, refreshBuildingData] as const;
}

// based on https://www.telerik.com/blogs/how-to-create-custom-debounce-hook-react, I added typing
// because the file is tsx, the T needs to be T, for it to not be seen as a react component (https://stackoverflow.com/questions/32696475/typescript-tsx-and-generic-parameters)
export const useDebounce = <T,>(value: T, startingValue: T, delay: number = 500): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(startingValue);
    const timerRef = useRef<ReturnType<typeof setInterval>>();

    useEffect(() => {
        timerRef.current = setTimeout(() => setDebouncedValue(value), delay);

        return () => {
            clearTimeout(timerRef.current);
        };
    }, [value, delay]);

    return debouncedValue;
};


// Based on expample on https://www.w3schools.com/html/html5_geolocation.asp
// enableHighAcuracy and fallback based on https://stackoverflow.com/questions/9053262/geolocation-html5-enablehighaccuracy-true-false-or-best-option
export const useUserLocation = (onUserLocationWatch: (position: GeolocationPosition) => void, setUserLocationError: (errorMessage: string) => void) => {
    let alreadyWatching = false;
    const getLocation = () => {
        if (alreadyWatching) return;
        if (navigator.geolocation) {
            alreadyWatching = true;
            navigator.geolocation.watchPosition(onUserLocationWatch, errorCallback_highAccuracy, {maximumAge:600000, timeout:5000, enableHighAccuracy: true});
        } else {
            setUserLocationError("Geolocation is not supported by this browser.");
        }
    }
    function errorCallback_highAccuracy(error: GeolocationPositionError) {
        alreadyWatching = false;
        switch (error.code) {
            case error.PERMISSION_DENIED:
                setUserLocationError("User denied the request for Geolocation.")
                break;
            case error.POSITION_UNAVAILABLE:
                setUserLocationError("Location information is unavailable.")
                break;
            case error.TIMEOUT:
                navigator.geolocation.watchPosition(
                    onUserLocationWatch,
                    errorCallback_lowAccuracy,
                    {maximumAge:600000, timeout:10000, enableHighAccuracy: false});
                break;
            default:
                setUserLocationError("An unknown error occurred.")
                console.error(error)
                break;
        }
    }
    function errorCallback_lowAccuracy(error: GeolocationPositionError) {
        alreadyWatching = false;
        switch (error.code) {
            case error.PERMISSION_DENIED:
                setUserLocationError("User denied the request for Geolocation.")
                break;
            case error.POSITION_UNAVAILABLE:
                setUserLocationError("Location information is unavailable.")
                break;
            case error.TIMEOUT:
                setUserLocationError("The request to get user location timed out.")
                break;
            default:
                setUserLocationError("An unknown error occurred.")
                console.error(error)
                break;
        }
    }
    return getLocation;
}