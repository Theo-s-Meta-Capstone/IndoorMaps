import { Link } from "react-router-dom";

const Root = () => {
    return (
        <div>
            <Link to="/directory">Directory</Link>
            <p>Created by <a href="https://theoh.dev">Theo Halpern</a></p>
        </div>
    )
}

export default Root;
