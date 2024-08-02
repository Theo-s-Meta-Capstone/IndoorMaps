import { Button } from "@mantine/core";
import { VerifyEmailPageFragment$data } from "../__generated__/VerifyEmailPageFragment.graphql";
import { useParams } from "react-router-dom";

type Props = {
    user: VerifyEmailPageFragment$data["user"]
    hasNewEmailBeenSent: boolean
    isVerifyInFlight: boolean
    verifyEmail: (token: string) => void
    isResendInFlight: boolean
    resendEmail: () => void
}

const VerifyEmailPageContent = ({ user, hasNewEmailBeenSent, isVerifyInFlight, verifyEmail, isResendInFlight, resendEmail }: Props) => {
    const { token } = useParams();

    if (user?.isEmailVerified) {
        return "Thank you for Verifiying your Email"
    }

    if (token) {
        return (<>
            <Button disabled={isVerifyInFlight} onClick={() => verifyEmail(token)}>Confirm Verifcation By Clicking Here</Button>
            {isVerifyInFlight ? "loading..." : null}
        </>)
    }

    if (user) {
        if (!hasNewEmailBeenSent) {
            return (
                <div>
                    You are signed up under {user.email}<br />
                    <Button disabled={isResendInFlight} onClick={() => resendEmail()}>Resend verification email</Button>
                </div>
            )
        }

        else {
            return "New email has been sent. Check your email for the link.";
        }
    }

    return ("not currently logged in")
}

export default VerifyEmailPageContent;
