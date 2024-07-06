import { Button, Group } from "@mantine/core";
import LogInModal from "../forms/LogInModal";
import { useBooleanState } from "../../utils/hooks";
import RegisterModal from "../forms/RegisterModal";

interface Props {
    refreshUserData: () => void;
}

const AuthButton = ({ refreshUserData }: Props) => {
    const [isLogInOpen, handleCloseLogIn, handleOpenLogIn] = useBooleanState(false);
    const [isRegisterOpen, handleCloseRegister, handleOpenRegister] = useBooleanState(false);

    return (
        <Group className="userButtons">
            <Button onClick={() => { handleOpenLogIn() }} variant="default">Log In</Button>
            <Button onClick={() => { handleOpenRegister() }} variant="default">Sign up</Button>
            <LogInModal isOpen={isLogInOpen} refreshUserData={refreshUserData} closeModal={handleCloseLogIn} switchAuthAction={() => {
                handleCloseLogIn()
                handleOpenRegister()
            }}/>
            <RegisterModal isOpen={isRegisterOpen} refreshUserData={refreshUserData} closeModal={handleCloseRegister} switchAuthAction={() => {
                handleCloseRegister()
                handleOpenLogIn()
            }} />
        </Group>
    )
}

export default AuthButton;
