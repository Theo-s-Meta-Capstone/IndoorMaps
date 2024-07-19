import "../pageSections/style/FixedFooter.css"
import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import { RootQuery } from "./__generated__/RootQuery.graphql";
import HeaderNav from "../components/pageSections/HeaderNav";
import { Link } from "react-router-dom";
import Footer from "../components/pageSections/Footer";
import { useMediaQuery } from "@mantine/hooks";
import { em } from "@mantine/core";

const RootPageQuery = graphql`
    query RootQuery {
    getUserFromCookie {
        ...ButtonsContainerFragment,
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
                <Suspense fallback="Loading GraphQL... This can take up to 2 minutes after a cold start">
                    <RootBodyContainer queryReference={queryReference} />
                </Suspense>
            }
        </div>
    )
}

type RootBodyContainerProps = {
    queryReference: PreloadedQuery<RootQuery>
}

function RootBodyContainer({ queryReference }: RootBodyContainerProps) {
    const { getUserFromCookie } = usePreloadedQuery(RootPageQuery, queryReference);
    const isNotMobile = useMediaQuery(`(min-width: ${em(750)})`);

    return (
        <>
            <HeaderNav showDesktopContent={isNotMobile} getUserFromCookie={getUserFromCookie} pageTitle={"Welcome to IndoorMaps"} currentPage={"/"}/>
            <h2>Welcome To IndoorMaps.</h2>
            <p>IndoorMaps is the easy way to create useful and accurate maps of any building.</p>
            <p>Find maps on the <Link to={"/directory"}>Directory</Link></p>
            <Footer className="notDeviceHeightPage" getUserFromCookie={getUserFromCookie} showDesktopContent={isNotMobile}/>
        </>
    )
}

export default Root;
