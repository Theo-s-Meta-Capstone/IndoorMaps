import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { ButtonsContainerMutation } from "./__generated__/ButtonsContainerMutation.graphql";
import UserButtons from "./UserButtons";
import AuthButtons from "./AuthButtons";
import { useState } from "react";
import { ButtonsContainerFragment$key } from "./__generated__/ButtonsContainerFragment.graphql";
import { useRefreshUserData } from "../../utils/hooks";

const ButtonsUserFragment = graphql`
  fragment ButtonsContainerFragment on LogedInUser
  {
    id
    isLogedIn
    user {
      id
      email
      name
      isEmailVerified
    }
  }
`;


type UserButtonsProps = {
  getUserFromCookie: ButtonsContainerFragment$key;
  className?: string;
}

function ButtonsContainer({ getUserFromCookie, className }: UserButtonsProps) {
  const [signOutFormError, setSignOutFormError] = useState<string | null>(null);
  const { isLogedIn, user } = useFragment(ButtonsUserFragment, getUserFromCookie);
  const refreshUserData = useRefreshUserData();

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
      <UserButtons className={className} user={user} logout={handleLogout} formError={signOutFormError} closeFormError={() => { setSignOutFormError(null) }} />
    )
  }
  return (<AuthButtons className={className} refreshUserData={refreshUserData} />)
}

export default ButtonsContainer;
