import { graphql, useFragment } from "react-relay";
import { UserDataDisplayFragment$key } from "./__generated__/UserDataDisplayFragment.graphql";

const UserDataFragment = graphql`
  fragment UserDataDisplayFragment on LogedInUser{
    id
    isLogedIn
    user {
      id
      email
      name
    }
  }
`;

type UserDataDisplayProps = {
    getUserFromCookie: UserDataDisplayFragment$key;
}

function UserDataDisplay({ getUserFromCookie }: UserDataDisplayProps) {
    const { isLogedIn, user } = useFragment(
        UserDataFragment,
        getUserFromCookie,
    );
    return (
        <>
            <div>{isLogedIn ? "loged in" : "not loged in"}</div>
            {isLogedIn ?
                <div>{JSON.stringify(user)}</div>
                :
                null
            }
        </>
    )
}

export default UserDataDisplay;
