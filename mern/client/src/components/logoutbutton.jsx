// import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function LogoutButton(){
    const { logout } = useAuth0();

    return (
    <button className="inline-block bg-cancel-red text-xl rounded-lg text-gold w-36 py-4 font-semibold" 
    onClick={() => logout({ returnTo: window.location.origin })}>Log Out</button>);
}