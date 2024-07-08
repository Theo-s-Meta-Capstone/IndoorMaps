import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import { RootQuery } from "./__generated__/RootQuery.graphql";
import UserDataDisplay from "../pageSections/UserDataDisplay";
import HeaderNav from "../pageSections/HeaderNav";

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

    // In the example on the relay docs, they run loadQuery after a button press https://www.internalfb.com/intern/staticdocs/relay/docs/api-reference/use-query-loader/
    // I want the query to run on page load, so I'm using useEffect to run loadQuery on page load.
    // When it is not inside of a loadQuery this error is produced: "Too many re-renders. React limits the number of renders to prevent an infinite loop."
    // There is likely a better way to load the main relay query for a page, I just havent found it
    useEffect(() => {
        loadQuery({});
    }, []);

    return (
        <div>
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
    const { getUserFromCookie } = usePreloadedQuery(RootPageQuery, queryReference);
    return (
        <>
            <HeaderNav getUserFromCookie={getUserFromCookie} pageTitle={"Welcome to IndoorMaps"} currentPage={"/"}/>
            <UserDataDisplay getUserFromCookie={getUserFromCookie} />
        </>
    )
}

export default Root;
