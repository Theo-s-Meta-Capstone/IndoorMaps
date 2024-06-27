import { Button, Group, JsonInput } from "@mantine/core";
import React, { useEffect } from "react";
import { graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import type { PreloadedQuery } from 'react-relay';
import type { DirectoryGetAllBuildingsQuery } from "./__generated__/DirectoryGetAllBuildingsQuery.graphql";

type Props = {

}
const GetAllBuildings = graphql`
    query DirectoryGetAllBuildingsQuery {
    allBuildings {
      id
      title
      description
    }
  }
`

const Directory = ({ }: Props) => {
    const [
        queryReference,
        loadQuery,
    ] = useQueryLoader<DirectoryGetAllBuildingsQuery>(
        GetAllBuildings,
    );

    useEffect(() => {
        loadQuery({});
    }, []);

    return (
        <>
            <React.Suspense fallback="Loading">
                {queryReference != null
                    ? <NameDisplay queryReference={queryReference} />
                    : null
                }
            </React.Suspense>
        </>
    )
}

type NameDisplayProps = {
    queryReference: PreloadedQuery<DirectoryGetAllBuildingsQuery>
}

function NameDisplay({ queryReference }: NameDisplayProps) {
    const data = usePreloadedQuery(GetAllBuildings, queryReference);

    const buildingListElements = data.allBuildings.map((building, i) => {
        return (
            <Group key={i}>
                <h2>{building.title}</h2>
                <p>{building.description}</p>
            </Group>
        )
    })

    return buildingListElements;
}

export default Directory;
