// import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function LoginButton(){
    const { loginWithRedirect, user } = useAuth0();

    const logIn = () => {
        loginWithRedirect()
    }

    return (
    <button className="button shadow-md shadow-amber-800 inline-block bg-goblin-green text-xl rounded-lg text-gold w-36 py-4 font-semibold"
    onClick={logIn}>Log In</button>
);

}