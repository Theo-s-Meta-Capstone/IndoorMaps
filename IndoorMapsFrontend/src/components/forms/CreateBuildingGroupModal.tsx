import { Button, Group, Modal, TextInput } from "@mantine/core";
import { hasLength, useForm } from "@mantine/form";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import FormErrorNotification from "./FormErrorNotification";
import { CreateBuildingGroupModalMutation } from "./__generated__/CreateBuildingGroupModalMutation.graphql";
import { useRefreshRelayCache } from "../../utils/hooks";

type Props = {
    isOpen: boolean,
    closeModal: () => void,
}

const CreateBuildingGroupModal = ({ isOpen, closeModal }: Props) => {
    const [formError, setFormError] = useState<string | null>(null);
    const { refreshUserBuildingGroupsgData } = useRefreshRelayCache();

    const form = useForm({
        mode: 'controlled',
        initialValues: { name: '' },
        validate: {
            name: hasLength({ min: 1, max: 20 }, 'Building Group name must be between 1 and 20 characters long'),
        },
    });

    const [commit, isInFlight] = useMutation<CreateBuildingGroupModalMutation>(graphql`
        mutation CreateBuildingGroupModalMutation($data: CreateBuildingGroup!){
            createBuildingGroup(data: $data) {
                id
            }
        }
    `);

    const handleSubmit = async (values: typeof form.values) => {
        try {
            commit({
                variables: {
                    data: {
                        name: values.name
                    },
                },
                onCompleted() {
                    refreshUserBuildingGroupsgData();
                    closeModal();
                },
                onError(error) {
                    setFormError(error.message);
                },
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
            title={"Create a Building Group"}
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
        >
            <form method="dialog" onSubmit={form.onSubmit(handleSubmit)}>
                <FormErrorNotification formError={formError} onClose={() => { setFormError(null) }} />
                <TextInput {...form.getInputProps('name')} autoComplete="on" label="Building Group Name" placeholder="" />
                <Group>
                    <Button color="dark-blue" type="submit" disabled={isInFlight}>Submit</Button>
                </Group>
            </form>
        </Modal>
    )
}

export default CreateBuildingGroupModal;
