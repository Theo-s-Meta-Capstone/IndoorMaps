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
            <Footer className="notDeviceHeightPage" showDesktopContent={isNotMobile} />
        </>
    )
}

export default LoadingPage;
