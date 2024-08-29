import "./style/HeaderNav.css"
import { Group } from "@mantine/core";
import ButtonsContainer from "./ButtonsContainer";
import { ButtonsContainerFragment$key } from "./__generated__/ButtonsContainerFragment.graphql";
import { Link } from "react-router-dom";

type HeaderNavProps = {
    getUserFromCookie?: ButtonsContainerFragment$key;
    pageTitle: string;
    currentPage: string;
    children?: React.ReactNode;
    showDesktopContent?: boolean
}

const HeaderNav = ({ getUserFromCookie, pageTitle, children, showDesktopContent = true }: HeaderNavProps) => {
    return (<>
        <header>
            <h1 className="pageTitle">
                <Link to={"/"}>
                    <img alt={"Home Page"} className="pageTitleImage" src={"/logo.svg"} />
                </Link>
                <span style={pageTitle.length < 10 || showDesktopContent ? {} : {fontSize: "1em"}}>{pageTitle}</span>
            </h1>
            {showDesktopContent ?
                <Group component="nav" className="nav">
                    <Link to="/directory">Directory</Link>
                    {children}
                    {getUserFromCookie ? <ButtonsContainer className="userButtons" getUserFromCookie={getUserFromCookie} /> : null}
                </Group>
                :
                <Group component="nav" className="nav">
                    {children}
                </Group>
            }
        </header>
    </>
    );
}

export default HeaderNav;
