import { Link } from "react-router-dom";
import ButtonsContainer from "./ButtonsContainer";
import { ButtonsContainerFragment$key } from "./__generated__/ButtonsContainerFragment.graphql";

type Props = {
    children?: React.ReactNode;
    showDesktopContent?: boolean
    getUserFromCookie?: ButtonsContainerFragment$key;
    className?: string
}

const Footer = ({className, getUserFromCookie, showDesktopContent = true }: Props) => {
    return (
        <footer className={className}>
            {showDesktopContent ? <p className="creditFooter">Created by <a href="https://theoh.dev">Theo Halpern</a></p>
                :
                <>
                    <Link className={"footerButton"} to="/directory"><img alt={"directory"} src={"/directory.svg"} /></Link>
                    {getUserFromCookie ? <ButtonsContainer className="userButtons" getUserFromCookie={getUserFromCookie} /> : null}
                </>}
        </footer>
    )
}

export default Footer;
