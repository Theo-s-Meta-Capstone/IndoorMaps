import { Button, Group, HoverCard, Text } from "@mantine/core";
import { ButtonsContainerFragment$data } from "./__generated__/ButtonsContainerFragment.graphql";
import FormErrorNotification from "../forms/FormErrorNotification";

const emailIsNotVerifiedAlertText = "Email is not verified: Verify by clicking the link sent to your inbox"

type Props = {
    user: ButtonsContainerFragment$data["user"];
    logout: () => void;
    formError: string | null;
    closeFormError: () => void;
    className?: string;
}

const UserButtons = ({ user, logout, formError, closeFormError, className }: Props) => {
    if (user == null) return (<div>Error loading User</div>)

    return (
        <Group className={"userButtons " + className}>
            <FormErrorNotification formError={formError} onClose={() => { closeFormError() }} />
            <p>Hello {user.name}</p>
            {user.isEmailVerified ? null :
                <HoverCard width={200} position="bottom" withArrow shadow="md">
                    <HoverCard.Target>
                        <button style={{ border: "none" }} aria-label={emailIsNotVerifiedAlertText} className='NoEmailInformer'>!</button>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                        <Text>{emailIsNotVerifiedAlertText}</Text>
                    </HoverCard.Dropdown>
                </HoverCard>
            }
            <Button color="dark-blue" onClick={() => { logout() }} variant="default">Log Out</Button>
        </Group>
    )
}

export default UserButtons;
