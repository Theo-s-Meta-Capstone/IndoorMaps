import { Button, Modal, TextInput, Group } from "@mantine/core";
import { hasLength, useForm } from "@mantine/form";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import { useParams } from "react-router-dom";
import { ShareLocationModalMutation } from "./__generated__/ShareLocationModalMutation.graphql";
import FormErrorNotification from "../../forms/FormErrorNotification";

type Props = {
    isOpen: boolean,
    closeModal: () => void,
}

const ShareLocationModal = ({ isOpen, closeModal }: Props) => {
    const [formError, setFormError] = useState<string | null>(null);
    const [isRunningTimeout, setIsRunningTimeout] = useState<NodeJS.Timeout | null>(null);
    const { buildingId } = useParams();
    let countOfSteps = 0;

    const form = useForm({
        mode: 'controlled',
        initialValues: { name: '', message: '', cords: ''},
        validate: {
            name: hasLength({ min: 1, max: 16 }, 'Name must be between 1 and 16 characters long'),
        },
    });

    const [commit, isInFlight] = useMutation<ShareLocationModalMutation>(graphql`
        mutation ShareLocationModalMutation($data: LiveLocationInput!) {
            setLocation(data: $data) {
                success
            }
        }
    `);

    const handleSubmit = async (values: typeof form.values) => {
        if(values.cords != null){
            countOfSteps = 0;
            setIsRunningTimeout(setInterval(() => {updateValues(values)}, 3000))
        }
    }


    const updateValues = (values: typeof form.values) => {
        const cords = values.cords.split("- ").map((cord) => cord.split(", ").map((cord) => parseFloat(cord)));
        if(buildingId == undefined){
            setFormError("Building url param not found");
            return
        }
        try {
            commit({
                variables: {
                    data: {
                        id: parseInt(buildingId),
                        latitude: cords[countOfSteps][0],
                        longitude: cords[countOfSteps][1],
                        name: values.name,
                        message: values.message,
                    },
                },
                onCompleted() {
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
        countOfSteps++;
        countOfSteps%=cords.length;
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
                {isRunningTimeout ? <Button onClick={() => {
                    clearInterval(isRunningTimeout);
                    setIsRunningTimeout(null);
                }}>Stop current location share</Button> : null}
                <TextInput {...form.getInputProps('name')} label="Name to Display" placeholder="Zuck" />
                <TextInput {...form.getInputProps('message')} label="Message" placeholder="Ask me questions about new student orientation" />
                <TextInput {...form.getInputProps('cords')} label="Mock coordinates" placeholder="lat1, lng1- lat2, lng2- lat3, lng3 " />
                <Group>
                    <Button type="submit" disabled={isInFlight}>Submit</Button>
                </Group>
            </form>
        </Modal>
    )
}

export default ShareLocationModal;
