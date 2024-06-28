import { PreloadedQuery, useMutation, usePreloadedQuery } from "react-relay";
import { graphql } from "relay-runtime";
import { AppMainQuery } from "../../__generated__/AppMainQuery.graphql";
import { GetCurrentUser } from "../../App";
import { ButtonsContainerMutation } from "./__generated__/ButtonsContainerMutation.graphql";
import UserButtons from "./UserButtons";
import AuthButtons from "./AuthButtons";
import { useState } from "react";

type UserButtonsProps = {
  queryReference: PreloadedQuery<AppMainQuery>,
  loadQuery: any,
}

function ButtonsContainer({ queryReference, loadQuery }: UserButtonsProps) {
  const [signOutFormError, setSignOutFormError] = useState<string | null>(null);
  const data = usePreloadedQuery(GetCurrentUser, queryReference);
  const refreshUserData = () => {
    loadQuery(
      {},
      { fetchPolicy: 'network-only' },
    );
  }
  const [commit] = useMutation<ButtonsContainerMutation>(graphql`
        mutation ButtonsContainerMutation {
            signOut {
              success
            }
        }
    `);
  const handleLogout = async () => {
    try {
      commit({
        variables: {},
        onCompleted() {
          refreshUserData()
        },
        onError(error) {
          setSignOutFormError(error.message);
        }
      });
    } catch (error) {
      let errorMessage = (error as Error).message;
      setSignOutFormError(errorMessage);
    }
  };
  if (data.getUserFromCookie.isLogedIn && data.getUserFromCookie.user) {
    return (
      <UserButtons user={data.getUserFromCookie.user} logout={handleLogout} formError={signOutFormError} closeFormError={() => { setSignOutFormError(null) }} />
    )
  }
  return (<AuthButtons refreshUserData={refreshUserData} />)
}

export default ButtonsContainer;
