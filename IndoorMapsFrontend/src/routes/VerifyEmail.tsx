import "../components/pageSections/style/FixedFooter.css"
import { PreloadedQuery, graphql, useFragment, useMutation, usePreloadedQuery } from "react-relay";
import HeaderNav from "../components/pageSections/HeaderNav";
import { Link, useLoaderData } from "react-router-dom";
import Footer from "../components/pageSections/Footer";
import { useMediaQuery } from "@mantine/hooks";
import { em } from "@mantine/core";
import FormErrorNotification from "../components/forms/FormErrorNotification";
import { useState } from "react";
import { VerifyEmailMutation } from "./__generated__/VerifyEmailMutation.graphql";
import { VerifyEmailPageFragment$key } from "./__generated__/VerifyEmailPageFragment.graphql";
import { VerifyEmailQuery } from "./__generated__/VerifyEmailQuery.graphql";
import { VerifyEmailResendMutation } from "./__generated__/VerifyEmailResendMutation.graphql";
import VerifyEmailPageContent from "./VerifyEmail/VerifyEmailPageContent";

export const VerifyEmailPageQuery = graphql`
    query VerifyEmailQuery {
    getUserFromCookie {
        ...ButtonsContainerFragment,
        ...VerifyEmailPageFragment,
    }
}`

const VerifyEmailFragment = graphql`
    fragment VerifyEmailPageFragment on LogedInUser {
        id
        user {
            isEmailVerified
            email
        }
    }
`;

const VerifyEmail = () => {
    const queryReference = useLoaderData() as PreloadedQuery<VerifyEmailQuery>;
    const { getUserFromCookie } = usePreloadedQuery(VerifyEmailPageQuery, queryReference);
    const isNotMobile = useMediaQuery(`(min-width: ${em(750)})`);
    const [formError, setFormError] = useState<string | null>(null);
    const { user } = useFragment<VerifyEmailPageFragment$key>(VerifyEmailFragment, getUserFromCookie);
    const [hasNewEmailBeenSent, setHasNewEmailBeenSent] = useState(false);

    const [commit, isVerifyInFlight] = useMutation<VerifyEmailMutation>(graphql`
        mutation VerifyEmailMutation($data: verifyEmailWithTokenInput!) {
            verifyUser(data: $data) {
                ...ButtonsContainerFragment,
                ...VerifyEmailPageFragment,
                user {
                    isEmailVerified
                }
            }
        }
    `);

    const verifyEmail = async (token: string) => {
        try {
            commit({
                variables: {
                    data: {
                        token
                    },
                },
                onCompleted(data) {
                    if (!(data.verifyUser && data.verifyUser.user)) {
                        setFormError("User not found")
                        return
                    }
                    if (!data.verifyUser.user.isEmailVerified) {
                        setFormError("Email not verified, try again later")
                        return
                    }
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

    const [commitResend, isResendInFlight] = useMutation<VerifyEmailResendMutation>(graphql`
        mutation VerifyEmailResendMutation {
            resendVerifyEmail {
                ...ButtonsContainerFragment,
                ...VerifyEmailPageFragment,
            }
        }
    `);

    const resendEmail = async () => {
        try {
            commitResend({
                variables: {
                },
                onCompleted() {
                    setHasNewEmailBeenSent(true)
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
        <>
            <HeaderNav showDesktopContent={isNotMobile} getUserFromCookie={getUserFromCookie} pageTitle={"Email Verification Center"} currentPage={"/"} />
            <FormErrorNotification formError={formError} onClose={() => { setFormError(null) }} />
            <p>Find and create maps on the <Link to={"/directory"}>Directory</Link></p>
            <VerifyEmailPageContent
                user={user}
                hasNewEmailBeenSent={hasNewEmailBeenSent}
                isVerifyInFlight={isVerifyInFlight}
                verifyEmail={verifyEmail}
                isResendInFlight={isResendInFlight}
                resendEmail={resendEmail}
            />
            <Footer className="notDeviceHeightPage" getUserFromCookie={getUserFromCookie} showDesktopContent={isNotMobile} />
        </>)
}

export default VerifyEmail;
