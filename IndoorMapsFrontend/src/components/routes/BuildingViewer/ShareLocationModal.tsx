import { Button, Modal, TextInput, Group } from "@mantine/core";
import { hasLength, useForm } from "@mantine/form";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import { useParams } from "react-router-dom";
import { ShareLocationModalMutation } from "./__generated__/ShareLocationModalMutation.graphql";
import FormErrorNotification from "../../forms/FormErrorNotification";
import { getPointBetweentwoPoints } from "../../../utils/utils";
import { useUserLocation } from "../../../utils/hooks";

const numberOfStepsBetweenEachGPSPoint = 10;

type Props = {
    isOpen: boolean,
    closeModal: () => void,
}

const ShareLocationModal = ({ isOpen, closeModal }: Props) => {
    const [formError, setFormError] = useState<string | null>(null);
    const [isRunningTimeout, setIsRunningTimeout] = useState<NodeJS.Timeout | null>(null);
    const { buildingId } = useParams();
    const getUserLocaiton = useUserLocation((position: GeolocationPosition) => {
        updateValuesInjectForm([position.coords.latitude, position.coords.longitude]);
    }, (errorMessage: string) => {
        setFormError(errorMessage);
    });

    const webSocket = new WebSocket('ws://localhost:4000/ws');

    webSocket.onmessage = (event) => {
        console.log(event.data);
    };

    // Connection opened
    webSocket.addEventListener("open", (event) => {
        console.log("Connected To Websocket!");
        webSocket.send("Hello Server!");
    });

    let countOfSteps = 0;

    const form = useForm({
        mode: 'controlled',
        initialValues: { name: '', message: '', cords: '' },
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

    const updateValuesInjectForm = (curPos: number[]) => {
        updateValues(form.values, curPos);
    }

    const handleSubmit = async (values: typeof form.values) => {
        if (values.cords != null && values.cords.length > 0) {
            countOfSteps = 0;
            setIsRunningTimeout(setInterval(() => {
                const cords = values.cords.split("- ").map((cord) => cord.split(", ").map((cord) => parseFloat(cord)));
                const curPos = getPointBetweentwoPoints(
                    cords[(Math.floor(countOfSteps / numberOfStepsBetweenEachGPSPoint)) % cords.length],
                    cords[(Math.floor(countOfSteps / numberOfStepsBetweenEachGPSPoint) + 1) % cords.length],
                    (countOfSteps % numberOfStepsBetweenEachGPSPoint) / numberOfStepsBetweenEachGPSPoint
                )
                updateValues(form.values, curPos)
                countOfSteps++;
            }, 3000))
        } else {
            getUserLocaiton()
            closeModal();
        }
    }

    const updateValues = (values: typeof form.values, curPos: number[]) => {
        if (buildingId == undefined) {
            setFormError("Building url param not found");
            return
        }
        try {
            commit({
                variables: {
                    data: {
                        id: parseInt(buildingId),
                        latitude: curPos[0],
                        longitude: curPos[1],
                        name: values.name,
                        message: values.message,
                    },
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
                {isRunningTimeout ? <Button onClick={() => {
                    clearInterval(isRunningTimeout);
                    setIsRunningTimeout(null);
                }}>Stop current location share</Button> : null}
                <TextInput {...form.getInputProps('name')} label="Name to Display" required placeholder="Zuck" />
                <TextInput {...form.getInputProps('message')} label="Message" placeholder="Ask me questions about new student orientation" />
                <TextInput {...form.getInputProps('cords')} label="Mock coordinates (default is your gps location, only set to override)" placeholder="lat1, lng1- lat2, lng2- lat3, lng3 " />
                <Group>
                    <Button type="submit" disabled={isInFlight}>Submit</Button>
                </Group>
            </form>
        </Modal>
    )
}

export default ShareLocationModal;
