import { useEffect, useRef, useState } from "react";
import { fetchQuery, graphql, loadQuery, useRelayEnvironment } from "react-relay";
import { AutoCompleteResultsFragment$data } from "../components/forms/__generated__/AutoCompleteResultsFragment.graphql";
import { hooksLatlngLookupQuery } from "./__generated__/hooksLatlngLookupQuery.graphql";

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
                    ...AreaSidebarBodyFragment
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

    const refreshUserBuildingGroupsQuery = graphql`
        query hooksUserBuildingGroupsQuery {
            getUserFromCookie {
            user {
                buildingGroups {
                    id
                    databaseId
                    name
                }
            }
        }
        }
    `;

    const refreshUserBuildingGroupsgData = () => {
        loadQuery(
            environment,
            refreshUserBuildingGroupsQuery,
            {},
            { fetchPolicy: "network-only" }
        );
    }

    return { refreshFloorData, refreshBuildingData, refreshUserBuildingGroupsgData } as const;
}

export const useRefreshUserData = () => {
    const environment = useRelayEnvironment();

    // Used in the loadQuery that runs after a change in the user's cookie is expected
    const refreshQuery = graphql`
    query hooksGetUserFromCookieQuery {
        getUserFromCookie {
            ...ButtonsContainerFragment,
            ...ListOfConnectedBuildingsUserDataDisplayFragment,
            ...VerifyEmailPageFragment,
        }
    }
    `;

    const refreshUserData = () => {
        loadQuery(
            environment,
            refreshQuery,
            {},
            { fetchPolicy: "network-only" }
        );
    }
    return refreshUserData
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
// I decided to not return a state that changes based on the position/error and instead have the consumers of this hook
// write functions (the params) that are called when the position is updated or when an error occurs. This is because
// anything to do with the map, espeically things that happen a lot (like the position marker updating) shouldn't cause React to even consider re-render
// The leaflet map response far better to updates that come from tridtional JS as aposed to React so using states just results in more re-renders and a worse expreience.
export const useUserLocation = (onUserLocationWatch: (position: GeolocationPosition) => void, setUserLocationError: (errorMessage: string) => void) => {
    const alreadyWatching = useRef<boolean>(false)
    const getLocation = () => {
        if (alreadyWatching.current) return;
        if (navigator.geolocation) {
            alreadyWatching.current = true;
            navigator.geolocation.watchPosition(onUserLocationWatch, errorCallback_highAccuracy, { maximumAge: 600000, timeout: 5000, enableHighAccuracy: true });
        } else {
            setUserLocationError("Geolocation is not supported by this browser.");
        }
    }
    function errorCallback_highAccuracy(error: GeolocationPositionError) {
        alreadyWatching.current = false;
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
                    { maximumAge: 600000, timeout: 10000, enableHighAccuracy: false });
                break;
            default:
                setUserLocationError("An unknown error occurred.")
                console.error(error)
                break;
        }
    }
    function errorCallback_lowAccuracy(error: GeolocationPositionError) {
        alreadyWatching.current = false;
        switch (error.code) {
            case error.PERMISSION_DENIED:
                setUserLocationError("User denied the request for Geolocation.")
                break;
            case error.POSITION_UNAVAILABLE:
                setUserLocationError("Location information is unavailable.")
                break;
            case error.TIMEOUT:
                if (alreadyWatching.current) break;
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

// Based on https://www.joshwcomeau.com/snippets/react-hooks/use-prefers-reduced-motion/
// Not SSR safe, if the project updates to use SSR, this will need to be updated
const QUERY = '(prefers-reduced-motion: no-preference)';
const getInitialState = () => !window.matchMedia(QUERY).matches;
export const usePrefersReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialState);
    useEffect(() => {
        const mediaQueryList = window.matchMedia(QUERY);
        const listener = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(!event.matches);
        };
        mediaQueryList.addEventListener('change', listener);
        return () => {
            mediaQueryList.removeEventListener('change', listener);
        };
    }, []);
    return prefersReducedMotion;
}

export const useChooseAutocompleteResult = (setAddressValue: (newAddressValue: string) => void, setStartingPositionValue: (newLatLonString: string) => void, setFormError: (errorMessage: string) => void) => {
    const environment = useRelayEnvironment();
    const handleChooseAutocompleteResult = (item: AutoCompleteResultsFragment$data["getAutocomplete"]["items"][number]) => {
        setAddressValue(item.title);
        fetchQuery<hooksLatlngLookupQuery>(
            environment,
            graphql`
            query hooksLatlngLookupQuery($lookupInput: LocationLookupInput!) {
                getLocationLookup(data: $lookupInput) {
                    lat
                    lon
                }
            }
            `,
            {
                lookupInput: {
                    "id": item.id
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
                    if (!data || !data.getLocationLookup) {
                        setFormError("No response when loading lat/long for autocomplete result");
                        return;
                    }
                    setStartingPositionValue(`${data.getLocationLookup.lat}, ${data.getLocationLookup.lon}`);
                }
            });
    }
    return handleChooseAutocompleteResult;
}
