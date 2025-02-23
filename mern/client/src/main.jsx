import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import "./index.css";
import CampaignList from "./components/campaignlist";
import CampaignOverview from "./components/campaignoverview";
import LocationItem from "./components/locationitem";
import CharacterOverview from "./components/characteroverview";
// import Notes from "./components/notes";
import MonsterOverview from "./components/monsteroverview";
import APISearch from "./components/search";
import Rulebook from "./components/rulebook";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/campaigns",
        element: <CampaignList />,
      },
      {
        path: "/campaigns/:id",
        element: <CampaignOverview />,
      },
      {
        path: "/locations/:id",
        element: <LocationItem />
      },
      // {
      //   path: "/notes",
      //   element: <Notes />,
      // },
      {
        path: "/characters",
        element: <CharacterOverview />,
      },
      {
        path: "/monsters",
        element: <MonsterOverview />,
      },
      {
        path: "/search",
        element: <APISearch />,
      },
      {
        path: "/rules",
        element: <Rulebook />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
