import { Button, Group, Notification } from "@mantine/core";

type Props = {
    user: any
    logout: () => void;
    formError: string | null;
    closeFormError: () => void;
}

const UserButtons = ({ user, logout, formError, closeFormError }: Props) => {
    if (user == null) return (<div>Error loading User</div>)

    return (
        <Group className="userButtons">
            {formError ?
                    <Notification color="red" title="Error" onClose={() => { closeFormError() }} closeButtonProps={{ 'aria-label': 'Hide notification' }}>
                        {formError}
                    </Notification>
                    : null}
            <p>Hello {user.name}</p>
            <Button onClick={() => { logout() }} variant="default">Log Out</Button>
        </Group>
    )
}

export default UserButtons;
