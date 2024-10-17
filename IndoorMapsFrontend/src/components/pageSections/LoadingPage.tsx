import { Group, Loader, em } from "@mantine/core";
import Footer from "./Footer";
import { useMediaQuery } from "@mantine/hooks";
import HeaderNav from "./HeaderNav";



const LoadingPage = () => {
    const isNotMobile = useMediaQuery(`(min-width: ${em(750)})`);

    return (
        <>
            <HeaderNav pageTitle="" currentPage="" showDesktopContent={isNotMobile} />
            <Group align="center" justify="center"><p>Loading From GraphQL</p><Loader color="dark-blue" /></Group>
            <Group align="center" justify="center"><i>The server is hosted on a 2v cpu Hetzner Coolify instance that also hosts the rest of my projects</i></Group>
            <Footer className="notDeviceHeightPage" showDesktopContent={isNotMobile} />
        </>
    )
}

export default LoadingPage;
