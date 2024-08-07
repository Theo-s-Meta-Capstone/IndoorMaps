import { Button, Modal, TextInput, PasswordInput, Group } from "@mantine/core";
import { hasLength, isEmail, isNotEmpty, useForm } from "@mantine/form";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import { RegisterModalMutation } from "./__generated__/RegisterModalMutation.graphql";
import FormErrorNotification from "./FormErrorNotification";

type Props = {
    isOpen: boolean,
    closeModal: () => void,
    switchAuthAction: () => void,
    refreshUserData: () => void,
}

const RegisterModal = ({ isOpen, closeModal, switchAuthAction, refreshUserData }: Props) => {
    const [formError, setFormError] = useState<string | null>(null);

    const form = useForm({
        mode: 'controlled',
        initialValues: { email: '', password: '', name: '' },
        validate: {
            email: isEmail(),
            name: isNotEmpty('Please select a name'),
            password: hasLength({ min: 6 }, 'Password must be at least 6 characters long'),
        },
    });

    const [commit, isInFlight] = useMutation<RegisterModalMutation>(graphql`
        mutation RegisterModalMutation($input: UserCreateInput!) {
            signupUser(data: $input) {
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
                        name: values.name
                    },
                },
                onCompleted() {
                    refreshUserData();
                    closeModal();
                },
                onError(error) {
                    setFormError(error.message);
                }
            });
        } catch (error) {
            const errorMessage = (error as Error).message;
            setFormError(errorMessage);
        }
    };

    return (
        <Modal
            opened={isOpen}
            onClose={() => closeModal()}
            title={"Sign Up"}
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
        >

            <form method="dialog" onSubmit={form.onSubmit(handleSubmit)}>
                <FormErrorNotification formError={formError} onClose={() => { setFormError(null) }} />
                <TextInput {...form.getInputProps('name')} autoComplete="name" label="Name (public)" placeholder="Zuck" />
                <TextInput {...form.getInputProps('email')} autoComplete="email" label="Email" placeholder="zuck@meta.com" />
                <PasswordInput {...form.getInputProps('password')} autoComplete="new-password" label="Password" placeholder="" />
                <Group>
                    <Button color="dark-blue" type="submit" disabled={isInFlight}>Submit</Button>
                    <Button color="dark-blue" onClick={switchAuthAction}>Log In instead</Button>
                </Group>
            </form>
        </Modal>
    )
}

export default RegisterModal;
