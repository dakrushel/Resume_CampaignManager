import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Auth0Provider } from '@auth0/auth0-react';
import {
  BrowserRouter,
  createBrowserRouter,
  RouterProvider,
  Route,
  Routes,
} from "react-router-dom";
import App from "./App";
import "./index.css";
import CampaignList from "./components/campaignlist";
import CampaignOverview from "./components/campaignoverview";
import LocationItem from "./components/locationitem";
// import CharacterOverview from "./components/characteroverview";
import Notes from "./components/noteitem";
import MonsterItem from "./components/monsteritem";
import APISearch from "./components/search";
import RulesLookUp from "./components/rulebook";
import Home from "./components/home";
import PlayerCharacters from "./components/playercharacters";
import NonPlayerCharacters from "./components/nonplayercharacters";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-rq4jo6f1866uwndl.us.auth0.com"
      clientId="Tu11UqJ5IwIO4KINfmAckutSS005Wh02"
      //note: this is mildly unsecure BUT should allow page refreshes
      cacheLocation="localstorage"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://campaignapi.com"
      }}>
      
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campaigns" element={<CampaignList />} />
          <Route path="/campaigns/:id" element={<CampaignOverview />} />
          <Route path="/locations/:id" element={<LocationItem />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/characters" element={<NonPlayerCharacters />} />
          <Route path="/monsters" element={<MonsterItem />} />
          <Route path="/search" element={<APISearch />} />
          <Route path="/rules" element={<RulesLookUp />} />
          <Route path="/playercharacters" element={<PlayerCharacters/>} />
        </Routes>
        <App/>
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
  
  
);
