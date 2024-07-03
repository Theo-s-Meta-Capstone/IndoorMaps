import { Button, Modal, TextInput, Group } from "@mantine/core";
import { hasLength, isNotEmpty, useForm } from "@mantine/form";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import { CreateBuildingModalMutation } from "./__generated__/CreateBuildingModalMutation.graphql";
import { useNavigate } from "react-router-dom";
import FormErrorNotification from "./FormErrorNotification";

interface Props {
    isOpen: boolean,
    closeModal: () => void,
}

const CreateBuildingModal = ({ isOpen, closeModal }: Props) => {
    const [formError, setFormError] = useState<string | null>(null);
    const navigate = useNavigate();

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
                        address: values.address,
                        startLat: parseFloat(values.startingPosition.split(', ')[0]),
                        startLon: parseFloat(values.startingPosition.split(', ')[1]),
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
                <TextInput {...form.getInputProps('buildingName')} autoComplete="" label="Building Name" placeholder="West Seattle Grocery Central" />
                <TextInput {...form.getInputProps('address')} autoComplete="address" label="Address" placeholder="123 California Way" />
                <TextInput {...form.getInputProps('startingPosition')} label="Starting Position Lat, Long" placeholder="47.57975292676628, -122.38632782878642" />
                <Group>
                    <Button type="submit" disabled={isInFlight}>Submit</Button>
                </Group>
            </form>
        </Modal>
    )
}

export default CreateBuildingModal;
