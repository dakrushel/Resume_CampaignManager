// import { useState } from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types"

export default function Navbar({showNav}) {

  const navButtonStyle="bg-light-tan p-8 pt-6 rounded text-2xl w-36 h-32 items-center"
  return (
    <div className="flex-row">
      <nav className="flex flex-col justify-between items-center mb-6 fixed left-0 top-0 w-48 h-full bg-tan pb-10 pt-24">
        <NavLink to="/campaigns" title="See all your campaigns" alt="Campaigns" className={navButtonStyle}>
          <img src="/campaign.svg"></img>
        </NavLink>
        <NavLink to="/notes" title="Take a peek at your notes" alt="Notes." className={navButtonStyle}>
          <img src="/notes.svg"></img>
        </NavLink>
        <NavLink to="/characters" title="All your awesome characters." alt="Characters" className={navButtonStyle}>
          <img src="/character.svg"></img>
        </NavLink>
        <NavLink to="/monsters" title="Check out these monsters" alt="Monsters"className={navButtonStyle}>
          <img src="/monster.svg"></img>
        </NavLink>
        <NavLink to="/search" title="Search for anything and everything." alt="Search" className={navButtonStyle}>
          <img src="/search.svg"></img>
        </NavLink>
        <NavLink to="/rules" title="Look up some rules" alt="Rules" className={navButtonStyle}>
        <img src="/rules.svg"></img>
        </NavLink>
        <NavLink to="/characterdisplay">
          CharacterDisplay
        </NavLink>
        <NavLink to="/lootgenerator">
          LootTable
        </NavLink>
      </nav>
    </div>
  );
}

Navbar.propTypes = {
  showNav: PropTypes.bool.isRequired,
}