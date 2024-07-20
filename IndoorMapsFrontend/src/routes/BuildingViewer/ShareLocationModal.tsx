import { Button, Modal, TextInput, Group } from "@mantine/core";
import { hasLength, useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormErrorNotification from "../../components/forms/FormErrorNotification";
import { getPointBetweentwoPoints } from "../../utils/utils";
import { useUserLocation } from "../../utils/hooks";
import Cookies from 'js-cookie'

const WS_ENDPOINT = import.meta.env.VITE_BACKEND_WEBSOCKET_URL;

const numberOfStepsBetweenEachGPSPoint = 10;

type Props = {
    isOpen: boolean,
    closeModal: () => void,
}

const ShareLocationModal = ({ isOpen, closeModal }: Props) => {
    const [formError, setFormError] = useState<string | null>(null);
    const [isRunningTimeout, setIsRunningTimeout] = useState<NodeJS.Timeout | null>(null);
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
    const { buildingId } = useParams();
    const getUserLocaiton = useUserLocation((position: GeolocationPosition) => {
        updateValuesInjectForm([position.coords.latitude, position.coords.longitude]);
    }, (errorMessage: string) => {
        setFormError(errorMessage);
    });

    let countOfSteps = 0;

    const form = useForm({
        mode: 'controlled',
        initialValues: { name: '', message: '', cords: '' },
        validate: {
            name: hasLength({ min: 1, max: 16 }, 'Name must be between 1 and 16 characters long'),
        },
    });

    const updateValuesInjectForm = (curPos: number[]) => {
        updateValues(form.values, curPos);
    }

    const handleSubmit = async () => {
        setWebSocket(new WebSocket(WS_ENDPOINT));
    }

    const updateValues = (values: typeof form.values, curPos: number[]) => {
        if (buildingId == undefined) {
            setFormError("Building url param not found");
            return
        }
        try {
            if (!webSocket) {
                setFormError("connection to the server not estabilished")
                return;
            }
            if (webSocket.readyState !== 1) {
                setFormError("connection to the server not estabilished, please try again")
                if (isRunningTimeout) {
                    clearInterval(isRunningTimeout)
                }
                return;
            }
            if (!Cookies.get('wsKey')) {
                console.error("wsKey cookie not found")
                setTimeout(() => {
                    updateValues(form.values, curPos)
                }, 100)
            } else {
                webSocket.send(
                    JSON.stringify({
                        wsKey: Cookies.get('wsKey'),
                        id: parseInt(buildingId),
                        latitude: curPos[0],
                        longitude: curPos[1],
                        name: values.name,
                        message: values.message,
                    })
                )
            }
        } catch (error) {
            const errorMessage = (error as Error).message;
            setFormError(errorMessage);
        }
    };

    const sendCurrentPositionAlongInputedCords = () => {
        const cords = form.values.cords.split("- ").map((cord) => cord.split(", ").map((cord) => parseFloat(cord)));
        const curPos = getPointBetweentwoPoints(
            cords[(Math.floor(countOfSteps / numberOfStepsBetweenEachGPSPoint)) % cords.length],
            cords[(Math.floor(countOfSteps / numberOfStepsBetweenEachGPSPoint) + 1) % cords.length],
            (countOfSteps % numberOfStepsBetweenEachGPSPoint) / numberOfStepsBetweenEachGPSPoint
        )
        updateValues(form.values, curPos)
        countOfSteps++;
    }

    // set up the websocket connection
    useEffect(() => {
        if (!webSocket) {
            return
        }
        webSocket.onopen = () => {
            if (form.values.cords != null && form.values.cords.length > 0) {
                countOfSteps = 0;
                if (isRunningTimeout) {
                    clearInterval(isRunningTimeout)
                }
                sendCurrentPositionAlongInputedCords()
                setIsRunningTimeout(setInterval(sendCurrentPositionAlongInputedCords, 1000))
            } else {
                // starts running the funciton that was given as a param to useUserLocation
                getUserLocaiton()
            }
            closeModal();
        };
        // Currently the websocket should never send anything
        webSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            Cookies.set('wsKey', data.wsKey)
        };
        webSocket.onerror = (e) => {
            setFormError("Connection to the server not estabilished, Make sure you are logged in and try again")
            console.error(e);
        };
    }, [webSocket])

    return (
        <Modal
            opened={isOpen}
            onClose={() => closeModal()}
            title={"Share you location (or a series of GPS points)"}
            overlayProps={{
                backgroundOpacity: 0.55,
                blur: 3,
            }}
            zIndex={3000}
        >
            <form method="dialog" onSubmit={form.onSubmit(handleSubmit)}>
                <i>You must be logged in to share your location</i><br />
                <FormErrorNotification formError={formError} onClose={() => { setFormError(null) }} />
                {(webSocket && webSocket.readyState !== 1) ? "Setting up connection" : null}
                {isRunningTimeout ? <Button onClick={() => {
                    clearInterval(isRunningTimeout);
                    setIsRunningTimeout(null);
                }}>Stop current location share</Button> : null}
                <TextInput {...form.getInputProps('name')} label="Name to Display" required placeholder="Zuck" />
                <TextInput {...form.getInputProps('message')} label="Message" placeholder="Ask me questions about new student orientation" />
                <TextInput {...form.getInputProps('cords')} label="Mock coordinates (default is your gps location, only set to override)" placeholder="lat1, lng1- lat2, lng2- lat3, lng3 " />
                <Group>
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Modal>
    )
}

export default ShareLocationModal;
