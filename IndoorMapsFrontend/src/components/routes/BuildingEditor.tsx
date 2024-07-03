import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import { Link, useParams } from "react-router-dom";
import ButtonsContainer from "../pageSections/ButtonsContainer";
import { BuildingEditorQuery } from "./__generated__/BuildingEditorQuery.graphql";
import BuildingEditorBody from "./BuildingEditor/BuildingEditorBody";

const BuildingEditorPageQuery = graphql`
    query BuildingEditorQuery($data: BuildingUniqueInput!) {
    getUserFromCookie {
        ...ButtonsContainerFragment,
    }
    getBuilding(data: $data) {
        ...BuildingEditorBodyFragment
    }
}`

const BuildingEditor = () => {
    const { buildingId } = useParams();

    const [
        queryReference,
        loadQuery,
    ] = useQueryLoader<BuildingEditorQuery>(
        BuildingEditorPageQuery,
    );

    // See ./Root.tsx line 24 for explanation of this useEffect
    useEffect(() => {
        if (buildingId == null) {
            return;
        }
        loadQuery({
            "data": {
                id: parseInt(buildingId)
            }
        });
    }, []);

    return (
        <div>
            <h1>Editing building #{buildingId}</h1>
            <Link to="/directory">Directory</Link>
            {queryReference == null ? <div>Waiting for useEffect</div> :
                <Suspense fallback="Loading GraphQL">
                    <BuildingEditorBodyContainer queryReference={queryReference} />
                </Suspense>
            }
            <p>Created by <a href="https://theoh.dev">Theo Halpern</a></p>
        </div>
    )
}

type BuildingEditorBodyContainerProps = {
    queryReference: PreloadedQuery<BuildingEditorQuery>
}

function BuildingEditorBodyContainer({ queryReference }: BuildingEditorBodyContainerProps) {
    const { getUserFromCookie, getBuilding } = usePreloadedQuery(BuildingEditorPageQuery, queryReference);
    return (
        <>
            <ButtonsContainer getUserFromCookie={getUserFromCookie} />
            <BuildingEditorBody buildingFromParent={getBuilding} />
        </>
    )
}

export default BuildingEditor;
