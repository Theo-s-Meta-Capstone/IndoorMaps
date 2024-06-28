import { Button, Modal, TextInput, Notification, PasswordInput, Group } from "@mantine/core";
import { isEmail, useForm } from "@mantine/form";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import { LogInModalMutation } from "./__generated__/LogInModalMutation.graphql";

interface Props {
    isOpen: boolean,
    closeModal: () => void,
    switchAuthAction: () => void,
    refreshUserData: () => void,
}

const LogInModal = ({ isOpen, closeModal, switchAuthAction, refreshUserData }: Props) => {
    const [formError, setFormError] = useState<string | null>(null);

    const form = useForm({
        mode: 'controlled',
        initialValues: { email: '', password: '' },
        validate: {
            email: isEmail(),
        },
    });

    const [commit, isInFlight] = useMutation<LogInModalMutation>(graphql`
        mutation LogInModalMutation($input: UserLoginInput!) {
            signinUser(data: $input) {
                id,
                email,
                name,
            }
        }
    `);

    const handleSubmit = async (values: typeof form.values) => {
        try {
            commit({
                variables: {
                    input: {
                        email: values.email,
                        password: values.password,
                    },
                },
                onCompleted() {
                    refreshUserData()
                    closeModal();
                },
                onError(error) {
                    setFormError(error.message);
                }
            });
        } catch (error) {
            let errorMessage = (error as Error).message;
            setFormError(errorMessage);
        }
    };

    return (
        <Modal
            opened={isOpen}
            onClose={() => closeModal()}
            title={"Log In"}
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
        >
            <form method="dialog" onSubmit={form.onSubmit(handleSubmit)}>
                {formError ?
                    <Notification color="red" title="Error" onClose={() => { setFormError(null) }} closeButtonProps={{ 'aria-label': 'Hide notification' }}>
                        {formError}
                    </Notification>
                    : null}
                <TextInput {...form.getInputProps('email')} autoComplete="email" label="Email" placeholder="zuck@meta.com" />
                <PasswordInput {...form.getInputProps('password')} autoComplete="current-password" label="Password" placeholder="" />
                <Group>
                    <Button disabled={isInFlight} type="submit">Submit</Button>
                    <Button onClick={switchAuthAction}>Sign Up instead</Button>
                </Group>
            </form>
        </Modal>
    )
}

export default LogInModal;
