import { useState } from "react";

/**
 * A wrapper for useState<boolean>, commonly used to show modals and to removed the need for close modal handlers
 * Code borrowed from my last project Kudos-Board
 * @param initalValue the initial value of the boolean
 * @returns
 *           [booleanValue, setFalse, setTrue] where booleanValue is the current value of the boolean,
 *           setFalse is a function that sets the boolean to false
 *           and setTrue is a function that sets the boolean to true
 *           Both of these are not states so they can be passed down as props to child components
 */
export const useBooleanState = (initalValue: boolean) => {
    const [booleanValue, setBooleanValue] = useState<boolean>(initalValue);

    const setFalse = () => {
        setBooleanValue(false);
    }

    const setTrue = () => {
        setBooleanValue(true);
    }

    return [booleanValue, setFalse, setTrue] as const;
}


// js-cookie is based on https://medium.com/@sergeyleschev/react-custom-hook-usecookie-ca8a7a6e89d7#:~:text=The%20useCookie%20hook%20allows%20you,to%20the%20default%20value%20provided.
export const useAuth = () => {

}
