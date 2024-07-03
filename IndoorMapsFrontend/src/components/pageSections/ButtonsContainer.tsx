import { loadQuery, useFragment, useMutation, useRelayEnvironment } from "react-relay";
import { graphql } from "relay-runtime";
import { ButtonsContainerMutation } from "./__generated__/ButtonsContainerMutation.graphql";
import UserButtons from "./UserButtons";
import AuthButtons from "./AuthButtons";
import { useState } from "react";
import { ButtonsContainerFragment$key } from "./__generated__/ButtonsContainerFragment.graphql";

const ButtonsUserFragment = graphql`
  fragment ButtonsContainerFragment on LogedInUser
  {
    id
    isLogedIn
    user {
      id
      email
      name
    }
  }
`;

// Used in the loadQuery that runs after a change in the user's cookie is expected
const refreshQuery = graphql`
  query ButtonsContainerGetUserFromCookieQuery {
  getUserFromCookie {
    ...ButtonsContainerFragment,
    ...UserDataDisplayFragment,
    ...ListOfConnectedBuildingsUserDataDisplayFragment
  }
}
`;

type UserButtonsProps = {
  getUserFromCookie: ButtonsContainerFragment$key
}

function ButtonsContainer({ getUserFromCookie }: UserButtonsProps) {
  const [signOutFormError, setSignOutFormError] = useState<string | null>(null);
  const { isLogedIn, user } = useFragment(ButtonsUserFragment, getUserFromCookie);
  const environment = useRelayEnvironment();

  const refreshUserData = () => {
    loadQuery(
      environment,
      refreshQuery,
      {},
      { fetchPolicy: "network-only" }
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
      const errorMessage = (error as Error).message;
      setSignOutFormError(errorMessage);
    }
  };
  if (isLogedIn && user) {
    return (
      <UserButtons user={user} logout={handleLogout} formError={signOutFormError} closeFormError={() => { setSignOutFormError(null) }} />
    )
  }
  return (<AuthButtons refreshUserData={refreshUserData} />)
}

export default ButtonsContainer;
