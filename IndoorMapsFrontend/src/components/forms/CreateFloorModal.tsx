import { Button, Modal, TextInput, Group } from "@mantine/core";
import { hasLength, useForm } from "@mantine/form";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import { useParams } from "react-router-dom";
import { CreateFloorModalMutation } from "./__generated__/CreateFloorModalMutation.graphql";
import { useRefreshRelayCache } from "../../hooks";
import FormErrorNotification from "./FormErrorNotification";

interface Props {
    isOpen: boolean,
    closeModal: () => void,
}

const CreateFloorModal = ({ isOpen, closeModal }: Props) => {
    const [formError, setFormError] = useState<string | null>(null);
    const [, refreshBuildingData] = useRefreshRelayCache();
    const { buildingId } = useParams();

    const form = useForm({
        mode: 'controlled',
        initialValues: { title: '', description: ''},
        validate: {
            title: hasLength({ min: 1, max: 8 }, 'Floor must be between 1 and 8 characters long'),
        },
    });

    const [commit, isInFlight] = useMutation<CreateFloorModalMutation>(graphql`
        mutation CreateFloorModalMutation($input: FloorCreateInput!) {
            createFloor(data: $input) {
                buildingDatabaseId
            }
        }
    `);

    const handleSubmit = async (values: typeof form.values) => {
        if(buildingId == undefined){
            setFormError("Building url param not found");
            return
        }
        try {
            commit({
                variables: {
                    input: {
                        buildingDatabseId: parseInt(buildingId),
                        title: values.title,
                        description: values.description,
                    },
                },
                onCompleted(data) {
                    refreshBuildingData(data.createFloor.buildingDatabaseId);
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
            title={"Create a New Building Map"}
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
        >
            <form method="dialog" onSubmit={form.onSubmit(handleSubmit)}>
                <FormErrorNotification formError={formError} onClose={() => { setFormError(null) }} />
                <TextInput {...form.getInputProps('title')} label="Floor Name" placeholder="F1" />
                <TextInput {...form.getInputProps('description')} label="Floor Description" placeholder="Geology department" />
                <Group>
                    <Button type="submit" disabled={isInFlight}>Submit</Button>
                </Group>
            </form>
        </Modal>
    )
}

export default CreateFloorModal;
