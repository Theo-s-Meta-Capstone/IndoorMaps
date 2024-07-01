import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import { Link, useParams } from "react-router-dom";
import ButtonsContainer from "../pageSections/ButtonsContainer";
import UserDataDisplay from "../pageSections/UserDataDisplay";
import { BuildingEditorQuery } from "./__generated__/BuildingEditorQuery.graphql";

const BuildingEditorPageQuery = graphql`
    query BuildingEditorQuery {
    getUserFromCookie {
        ...ButtonsContainerFragment,
        ...UserDataDisplayFragment
    }
}`

const BuildingEditor = () => {
    let { buildingId } = useParams();

    const [
        queryReference,
        loadQuery,
    ] = useQueryLoader<BuildingEditorQuery>(
        BuildingEditorPageQuery,
    );

    useEffect(() => {
        loadQuery({});
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
    const data = usePreloadedQuery(BuildingEditorPageQuery, queryReference);
    return (
        <>
            <ButtonsContainer getUserFromCookie={data.getUserFromCookie} />
            <UserDataDisplay getUserFromCookie={data.getUserFromCookie} />
        </>
    )
}

export default BuildingEditor;
