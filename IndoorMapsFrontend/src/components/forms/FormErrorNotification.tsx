import { Notification } from "@mantine/core";

type Props = {
    formError: string | null;
    onClose: () => void;
    className?: string;
}

const FormErrorNotification = ({ formError, onClose, className }: Props) => {
    if(formError) {
        return (
            <Notification className={className} color="red" title="Error" onClose={onClose} closeButtonProps={{ 'aria-label': 'Hide notification' }}>
                {formError}
            </Notification>
        )
    }
    return null;
}

export default FormErrorNotification;
