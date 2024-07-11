type Props = {
    children?: React.ReactNode;
}

const Footer = ({ children }: Props) => {
    return (
        <footer>
            <p className="creditFooter">Created by <a href="https://theoh.dev">Theo Halpern</a></p>
            {children}
        </footer>
    )
}

export default Footer;
