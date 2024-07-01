import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import { Link } from "react-router-dom";
import { RootQuery } from "./__generated__/RootQuery.graphql";
import ButtonsContainer from "../pageSections/ButtonsContainer";
import UserDataDisplay from "../pageSections/UserDataDisplay";

const RootPageQuery = graphql`
    query RootQuery {
    getUserFromCookie {
        ...ButtonsContainerFragment,
        ...UserDataDisplayFragment
    }
}`

const Root = () => {
    const [
        queryReference,
        loadQuery,
    ] = useQueryLoader<RootQuery>(
        RootPageQuery,
    );

    useEffect(() => {
        loadQuery({});
    }, []);

    return (
        <div>
            <h1>Welcome to IndoorMaps</h1>
            <Link to="/directory">Directory</Link>
            {queryReference == null ? <div>Waiting for useEffect</div> :
                <Suspense fallback="Loading GraphQL">
                    <RootBodyContainer queryReference={queryReference} />
                </Suspense>
            }
            <p>Created by <a href="https://theoh.dev">Theo Halpern</a></p>
        </div>
    )
}

type RootBodyContainerProps = {
    queryReference: PreloadedQuery<RootQuery>
}

function RootBodyContainer({ queryReference }: RootBodyContainerProps) {
    const data = usePreloadedQuery(RootPageQuery, queryReference);
    return (
        <>
            <ButtonsContainer getUserFromCookie={data.getUserFromCookie} />
            <UserDataDisplay getUserFromCookie={data.getUserFromCookie} />
        </>
    )
}

export default Root;
