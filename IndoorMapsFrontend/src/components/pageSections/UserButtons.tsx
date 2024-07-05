import { Button, Group } from "@mantine/core";
import { ButtonsContainerFragment$data } from "./__generated__/ButtonsContainerFragment.graphql";
import FormErrorNotification from "../forms/FormErrorNotification";

type Props = {
    user: ButtonsContainerFragment$data["user"];
    logout: () => void;
    formError: string | null;
    closeFormError: () => void;
}

const UserButtons = ({ user, logout, formError, closeFormError }: Props) => {
    if (user == null) return (<div>Error loading User</div>)

    return (
        <Group className="userButtons">
            <FormErrorNotification formError={formError} onClose={() => { closeFormError() }} />
            <p>Hello {user.name}</p>
            <Button onClick={() => { logout() }} variant="default">Log Out</Button>
        </Group>
    )
}

export default UserButtons;
