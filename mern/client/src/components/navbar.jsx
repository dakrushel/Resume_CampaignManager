// import { useState } from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types"
import { useState } from "react";

export default function Navbar() {

  let campaignSelected;
  if (window.localStorage.getItem("selectedCampaign") != ""){
    campaignSelected = true;
  } else {
    campaignSelected = false;
  }

  const resetSelected = () => {
    window.localStorage.setItem("selectedCampaign", "")
    campaignSelected = false;
    this.forceUpdate()
  }


  const navButtonStyle="flex button bg-light-tan rounded text-3xl text-center sancreek-regular w-52 h-36 items-start mx-auto mb-8"
  return (
    <div className="flex-col">
      <nav className="flex flex-col align-top mb-6 fixed left-0 top-0 w-64 h-full bg-tan pb-10 pt-24">
        <NavLink to={`/campaigns`} 
        title="See all of your campaigns" 
        alt="Home" 
        className={navButtonStyle}
        onClick={resetSelected}>
          <p className="text-center m-auto">Home</p>
        </NavLink>
        <NavLink to={`/campaigns/${window.localStorage.getItem("selectedCampaign")}`} 
        title="See your current campaign in all its glory" 
        alt="Campaign" 
        className={navButtonStyle}>
          <p className="text-center m-auto">Campaign</p>
        </NavLink>
        {campaignSelected && <NavLink to="/playercharacters" className={navButtonStyle}>
          <p className="text-center m-auto">PCs</p>
        </NavLink>}
        {campaignSelected && <NavLink to="/characters" title="All your awesome NPCs." alt="Non Player Characters" className={navButtonStyle}>
          <p className="text-center m-auto">NPCs</p>
        </NavLink>}
        <NavLink to="/rules" title="Look up some rules" alt="Rules" className={navButtonStyle}>
          <p className="text-center m-auto">Rulebook</p>
        </NavLink>


        {/* Obsolete pages that may get brought back */}
        {/* <NavLink to="/monsters" title="Check out these monsters" alt="Monsters"className={navButtonStyle}>
          <p className="text-center m-auto">Monsters</p>
        </NavLink> */}
        {/* <NavLink to="/search" title="Search for anything and everything." alt="Search" className={navButtonStyle}>
          <p className="text-center m-auto">Search</p>
        </NavLink> */}
        {/* <NavLink to="/lootgenerator" className={navButtonStyle}>
          <p className="text-center m-auto">Loot Table</p>
        </NavLink> */}
      </nav>
    </div>
  );
}

Navbar.propTypes = {
  showNav: PropTypes.bool.isRequired,
}