// import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function LoginButton(){
    const { loginWithRedirect } = useAuth0();

    return (
    <button className="inline-block bg-goblin-green text-xl rounded-lg text-gold w-36 py-4 font-semibold"
    onClick={() => loginWithRedirect()}>Log In</button>
);

}