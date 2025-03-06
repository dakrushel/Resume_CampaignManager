// import { useState } from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types"

export default function Navbar({showNav}) {

  const navButtonStyle="flex button bg-light-tan rounded text-3xl text-center sancreek-regular w-52 h-24 items-center align-center"
  return (
    <div className="flex-row">
      <nav className="flex flex-col justify-between items-center mb-6 fixed left-0 top-0 w-64 h-full bg-tan pb-10 pt-24">
        <NavLink to="/campaigns" title="See all your campaigns" alt="Campaigns" className={navButtonStyle}>
          {/* <img src="/campaign.svg"></img> */}
          <p className="text-center m-auto">Campaigns</p>
        </NavLink>
        <NavLink to="/characterdisplay" className={navButtonStyle}>
          <p className="text-center m-auto">PCs</p>
        </NavLink>
        <NavLink to="/characters" title="All your awesome NPCs." alt="Non Player Characters" className={navButtonStyle}>
          {/* <img src="/character.svg" width="128" height="128"></img> */}
          <p className="text-center m-auto">NPCs</p>
        </NavLink>
        <NavLink to="/monsters" title="Check out these monsters" alt="Monsters"className={navButtonStyle}>
          {/* <img src="/monster.svg"></img> */}
          <p className="text-center m-auto">Monsters</p>
        </NavLink>
        <NavLink to="/search" title="Search for anything and everything." alt="Search" className={navButtonStyle}>
          {/* <img src="/search.svg"></img> */}
          <p className="text-center m-auto">Search</p>
        </NavLink>
        <NavLink to="/rules" title="Look up some rules" alt="Rules" className={navButtonStyle}>
          {/* <img src="/rules.svg"></img> */}
          <p className="text-center m-auto">Rulebook</p>
        </NavLink>
        <NavLink to="/lootgenerator" className={navButtonStyle}>
          <p className="text-center m-auto">Loot Table</p>
        </NavLink>
      </nav>
    </div>
  );
}

Navbar.propTypes = {
  showNav: PropTypes.bool.isRequired,
}