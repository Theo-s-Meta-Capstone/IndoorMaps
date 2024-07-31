import { Button, Group, Modal, TextInput } from "@mantine/core";
import { isEmail, useForm } from "@mantine/form";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import { InviteEditorsModalMutation } from "./__generated__/InviteEditorsModalMutation.graphql";
import FormErrorNotification from "../../components/forms/FormErrorNotification";
import { useParams } from "react-router-dom";

type Props = {
    isOpen: boolean,
    closeModal: () => void,
}

const InviteEditorsModal = ({ isOpen, closeModal }: Props) => {
    const [formError, setFormError] = useState<string | null>(null);
    const { buildingId } = useParams();

    const form = useForm({
        mode: 'controlled',
        initialValues: { userEmail: '' },
        validate: {
            userEmail: isEmail("Please enter a valid email address"),
        },
    });

    const [commit, isInFlight] = useMutation<InviteEditorsModalMutation>(graphql`
        mutation InviteEditorsModalMutation($input: InviteEditorInput!) {
            inviteEditor(data: $input) {
                success
            }
        }
    `);

    const handleSubmit = async (values: typeof form.values) => {
        if (!buildingId) {
            setFormError("building not found");
            return;
        }
        try {
            commit({
                variables: {
                    input: {
                        id: parseInt(buildingId),
                        invitedUser: values.userEmail,
                    },
                },
                onCompleted() {
                    closeModal();
                },
                onError(error) {
                    setFormError("hint: User to invite email likley not valid: " + error.message);
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
            title={"Invite a user to edit this building"}
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
        >
            <form method="dialog" onSubmit={form.onSubmit(handleSubmit)}>
                <FormErrorNotification formError={formError} onClose={() => { setFormError(null) }} />
                <TextInput {...form.getInputProps('userEmail')} autoComplete="on" label="User Email" placeholder="" />
                <Group>
                    <Button color="dark-blue" type="submit" disabled={isInFlight}>Submit</Button>
                </Group>
            </form>
        </Modal>
    )
}

export default InviteEditorsModal;
