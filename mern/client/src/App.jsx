import './App.css'
import { Outlet } from "react-router-dom";
import Navbar from "./components/navbar";
import Header from './components/header';
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from 'react';
import BackButton from './components/back';


function App() {
  const { isAuthenticated } = useAuth0();
  const [showNav, setShowNav] = useState(false);
  function changeShowNav(){
    setShowNav(!showNav);
    console.log(showNav);
  }

  return (
    <div className="w-full p-6">
      <Header showMenuFunc={changeShowNav}/>
      {isAuthenticated && showNav && <Navbar/>}
      {isAuthenticated && <BackButton/>}
      <Outlet/>
    </div>
  )
}

export default App