import "../components/pageSections/style/FixedFooter.css"
import { PreloadedQuery, graphql, useMutation, usePreloadedQuery } from "react-relay";
import { RootQuery } from "./__generated__/RootQuery.graphql";
import HeaderNav from "../components/pageSections/HeaderNav";
import { Link, useLoaderData, useParams } from "react-router-dom";
import Footer from "../components/pageSections/Footer";
import { useMediaQuery } from "@mantine/hooks";
import { Button, em } from "@mantine/core";
import FormErrorNotification from "../components/forms/FormErrorNotification";
import { useState } from "react";
import { RootPageQuery } from "./Root";
import { VerifyEmailMutation } from "./__generated__/VerifyEmailMutation.graphql";

const VerifyEmail = () => {
    const queryReference = useLoaderData() as PreloadedQuery<RootQuery>;
    const { getUserFromCookie } = usePreloadedQuery(RootPageQuery, queryReference);
    const isNotMobile = useMediaQuery(`(min-width: ${em(750)})`);
    const [formError, setFormError] = useState<string | null>(null);
    const { token } = useParams();
    const [isEmailVerified, setIsEmailVerified] = useState(false)

    const [commit, isInFlight] = useMutation<VerifyEmailMutation>(graphql`
        mutation VerifyEmailMutation($data: verifyEmailWithTokenInput!) {
            verifyUser(data: $data) {
                ...ButtonsContainerFragment,
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
                    setIsEmailVerified(true)
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
            <HeaderNav showDesktopContent={isNotMobile} getUserFromCookie={getUserFromCookie} pageTitle={"Welcome to IndoorMaps"} currentPage={"/"} />
            <FormErrorNotification formError={formError} onClose={() => { setFormError(null) }} />
            <h2>Verifying Email</h2>
            <p>Find and create maps on the <Link to={"/directory"}>Directory</Link></p>
            {isEmailVerified ?
                "Thank you for Verifiying your Email"
                :
                <>
                    {token ? <Button disabled={isInFlight} onClick={() => verifyEmail(token)}>Confirm Verifcation</Button> : "Token not found"}
                    {isInFlight ? "loading..." : null}
                </>
            }
            <Footer className="notDeviceHeightPage" getUserFromCookie={getUserFromCookie} showDesktopContent={isNotMobile} />
        </>
    )
}

export default VerifyEmail;
