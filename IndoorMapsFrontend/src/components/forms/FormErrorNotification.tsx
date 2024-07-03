import { Notification } from "@mantine/core";

interface Props {
    formError: string | null;
    onClose: () => void;
}

const FormErrorNotification = ({ formError, onClose }: Props) => {
    if(formError) {
        return (
            <Notification color="red" title="Error" onClose={onClose} closeButtonProps={{ 'aria-label': 'Hide notification' }}>
                {formError}
            </Notification>
        )
    }
    return null;
}

export default FormErrorNotification;
