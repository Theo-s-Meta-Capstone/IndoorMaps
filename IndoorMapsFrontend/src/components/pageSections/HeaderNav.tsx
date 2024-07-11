import "./style/HeaderNav.css"
import { Group } from "@mantine/core";
import ButtonsContainer from "./ButtonsContainer";
import { ButtonsContainerFragment$key } from "./__generated__/ButtonsContainerFragment.graphql";
import { Link } from "react-router-dom";

type HeaderNavProps = {
    getUserFromCookie: ButtonsContainerFragment$key;
    pageTitle: string;
    currentPage: string;
    children?: React.ReactNode;
}

const HeaderNav = ({ getUserFromCookie, pageTitle, children }: HeaderNavProps) => {
    return (<>
        <header>
            <h1 className="pageTitle">
                <Link to={"/"}>
                    <img alt={"Home Page"} className="pageTitleImage" src={"/logo.svg"} />
                </Link>
                {pageTitle}
            </h1>
            <Group component="nav" className="nav">
                <Link to="/directory">Directory</Link>
                {children}
                <ButtonsContainer className="userButtons" getUserFromCookie={getUserFromCookie} />
            </Group>
        </header>
    </>
    );
}

export default HeaderNav;
