// import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function LogoutButton(){
    const { logout, user } = useAuth0();

    const logOut = () => {
        logout({ returnTo: window.location.origin })
    }

    return (
    <button className="button shadow-md shadow-amber-800 inline-block bg-cancel-red text-xl rounded-lg text-gold w-36 py-4 font-semibold" 
    onClick={logOut}>Log Out</button>);
}