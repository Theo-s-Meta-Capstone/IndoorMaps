import { Button, Modal, TextInput, Notification, Group } from "@mantine/core";
import { hasLength, isNotEmpty, useForm } from "@mantine/form";
import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { CreateBuildingModalMutation } from "./__generated__/CreateBuildingModalMutation.graphql";
import { CreateBuildingModalUserDataFormFragment$key } from "./__generated__/CreateBuildingModalUserDataFormFragment.graphql";
import { useNavigate } from "react-router-dom";

const CreateBuildingModalUserDataFragment = graphql`
fragment CreateBuildingModalUserDataFormFragment on User {
    id,
    databaseId
}
`;

interface Props {
    isOpen: boolean,
    closeModal: () => void,
    userData: CreateBuildingModalUserDataFormFragment$key,
}

const CreateBuildingModal = ({ isOpen, closeModal, userData }: Props) => {
    const [formError, setFormError] = useState<string | null>(null);
    const navigate = useNavigate();
    const user = useFragment(CreateBuildingModalUserDataFragment, userData);

    const form = useForm({
        mode: 'controlled',
        initialValues: { buildingName: '', address: '', startingPosition: '' },
        validate: {
            buildingName: hasLength({ min: 4 }, 'Building name must be at least 4 characters long'),
            address: isNotEmpty('Please enter an address'),
            startingPosition: isNotEmpty('Please enter a starting position'),
        },
    });

    const [commit, isInFlight] = useMutation<CreateBuildingModalMutation>(graphql`
        mutation CreateBuildingModalMutation($input: BuildingCreateInput!) {
            createBuilding(data: $input) {
                databaseId
            }
        }
    `);

    const handleSubmit = async (values: typeof form.values) => {
        try {
            commit({
                variables: {
                    input: {
                        title: values.buildingName,
                        description: values.address,
                        owner: user.databaseId
                    },
                },
                onCompleted(data) {
                    navigate(`/building/${data.createBuilding.databaseId}/editor`);
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
            title={"Create a New Building Map"}
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
                <TextInput {...form.getInputProps('buildingName')} autoComplete="" label="Building Name" placeholder="West Seattle Grocery Central" />
                <TextInput {...form.getInputProps('address')} autoComplete="address" label="Address" placeholder="123 California Way" />
                <TextInput {...form.getInputProps('startingPosition')} label="Starting Position" placeholder="47.57975292676628, -122.38632782878642" />
                <Group>
                    <Button type="submit" disabled={isInFlight}>Submit</Button>
                </Group>
            </form>
        </Modal>
    )
}

export default CreateBuildingModal;
