import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./loginbutton";
import LogoutButton from "./logoutbutton";
import { NavLink } from "react-router-dom";

export default function Home(){
    const {isAuthenticated, user} = useAuth0();
    window.localStorage.setItem("selectedCampaign", "")
    if (isAuthenticated){
        window.localStorage.setItem("userId", `${user.sub}`)
        console.log(window.localStorage.getItem("userId"))
    } else {
        window.localStorage.setItem("userId", "")
        console.log(window.localStorage.getItem("userId"))
    }
    

    const textStyle = "text-2xl mb-4 text-brown"

    return(
        <div className="flex flex-col bg-cream rounded-lg mt-16 p-8 items-center">
            {!isAuthenticated && <p className={textStyle}>Welcome, dungeon master! Ready to help your players embark on epic quests and manage your tabletop campaigns with ease? 
                            Sign up now to track characters, plan encounters, and bring your adventures to life all in one place!</p>}
            {!isAuthenticated && <LoginButton/>}
            {isAuthenticated && <p className={textStyle}>Welcome back, dungeon master! Your campaigns await.</p>}
            {isAuthenticated && <div>
                <NavLink className="button shadow-md shadow-amber-800 inline-block text-xl rounded-lg py-4 mr-2 w-36 text-gold bg-goblin-green font-semibold"
                    to="/campaigns">Campaigns</NavLink> 
                <LogoutButton/>
            </div>}
        </div>
    )
}