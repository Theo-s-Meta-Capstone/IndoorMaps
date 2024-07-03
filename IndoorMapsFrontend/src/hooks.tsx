import { useState } from "react";
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
