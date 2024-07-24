import { Group, Loader, em } from "@mantine/core";
import Footer from "./Footer";
import { useMediaQuery } from "@mantine/hooks";
import HeaderNav from "./HeaderNav";

type Props = {
    pageTitle: string;
    currentPage: string;
}

const LoadingPage = ({ pageTitle, currentPage }: Props) => {
    const isNotMobile = useMediaQuery(`(min-width: ${em(750)})`);

    return (
        <>
            <HeaderNav pageTitle={pageTitle} currentPage={currentPage} showDesktopContent={isNotMobile} />
            <Group align="center" justify="center"><p>Loading From GraphQL</p><Loader color="blue" /></Group>
            <Footer showDesktopContent={isNotMobile} />
        </>
    )
}

export default LoadingPage;
