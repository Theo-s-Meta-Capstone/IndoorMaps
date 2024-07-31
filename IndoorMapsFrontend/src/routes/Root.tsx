import "../components/pageSections/style/FixedFooter.css"
import { PreloadedQuery, graphql, usePreloadedQuery } from "react-relay";
import { RootQuery } from "./__generated__/RootQuery.graphql";
import HeaderNav from "../components/pageSections/HeaderNav";
import { Link, useLoaderData } from "react-router-dom";
import Footer from "../components/pageSections/Footer";
import { useMediaQuery } from "@mantine/hooks";
import { em } from "@mantine/core";

export const RootPageQuery = graphql`
    query RootQuery {
    getUserFromCookie {
        ...ButtonsContainerFragment,
    }
}`

const Root = () => {
    const queryReference = useLoaderData() as PreloadedQuery<RootQuery>;
    const { getUserFromCookie } = usePreloadedQuery(RootPageQuery, queryReference);
    const isNotMobile = useMediaQuery(`(min-width: ${em(750)})`);

    return (
        <>
            <HeaderNav showDesktopContent={isNotMobile} getUserFromCookie={getUserFromCookie} pageTitle={"Welcome to IndoorMaps"} currentPage={"/"} />
            <h2>Welcome To IndoorMaps.</h2>
            <p>The easiest free way to create searchable and sharable maps of any building | School | University | Convention Center | Airport | Office</p>
            <p>Find maps on the <Link to={"/directory"}>Directory</Link></p>
            <Footer className="notDeviceHeightPage" getUserFromCookie={getUserFromCookie} showDesktopContent={isNotMobile} />
        </>
    )
}

export default Root;
