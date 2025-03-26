import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import LocationForm from "./locationform";
import { useAuth0 } from "@auth0/auth0-react";

export default function SitesList({ campaignID }) {
    const [locations, setLocations] = useState([]);
    const [RegionID, setParentLocationID] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [regions, setRegions] = useState([]);
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        if (!campaignID) return;
        async function fetchRegions() {
          try {
            const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
            const response = await fetch(`http://localhost:5050/locations/campaign/${campaignID}/type/Region`,
              {
                headers: { Authorization: `Bearer ${token}` },
              });
            const data = await response.json();
            setRegions(Array.isArray(data) ? data : []);
          } catch (error) {
            console.error("Failed to fetch parent locations: ", error);
          }
        }
        fetchRegions();
      }, [campaignID, getAccessTokenSilently]);    

    useEffect(() => {
        const fetchLocations = async () => {
            if (!campaignID) {
                setError("Missing campaign ID. Cannot fetch locations.");
                // setLoading(false);
                return;
            }
            if (!RegionID) return;

            try {
                setLoading(true)
                const token = await getAccessTokenSilently({ audience: "https://campaignapi.com"});
                const response = await fetch(`http://localhost:5050/locations/parent/${RegionID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (!response.ok) {throw new Error(`Error fetching locations: ${response.statusText}`);}
                
                const data = await response.json(); 
                if (!Array.isArray(data)) {
                    throw new Error("Invalid response: Expected an array of locations.");
                }

                setLocations(data);
            } catch (err) {
                console.error("Failed to fetch locations:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, [RegionID, campaignID, getAccessTokenSilently]);

    useEffect(() => {
        const fetchRootSites = async () => {
            if (!campaignID || !RegionID) return;

            try {
                setLoading(true);
                const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
                const response = await fetch(`http://localhost:5050/locations/parent/${RegionID}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Failed to fetch root sites");
                const rootSites = await response.json();

                const fullTree = await Promise.all(
                    rootSites.map(site => fetchSiteWithChildren(site, token))
                );

                setLocations(fullTree);
            } catch (err) {
                console.error("Failed to fetch locations:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRootSites();
    }, [RegionID, campaignID, getAccessTokenSilently]);

    const handleSaveLocation = (newLocation) => {
        setLocations([...locations, newLocation]); // Update state with new location
        setShowForm(false); // Hide the form after saving
    };

    const fetchSiteWithChildren = async (site, token) => {
        if (!site.children || site.children.length === 0) {
            return { ...site, childrenNodes: [] };
        }

        try {
            const queryString = site.children.map(id => `ids=${id}`).join("&");
            const res = await fetch(`http://localhost:5050/locations/many?${queryString}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch children");
            const children = await res.json();

            const nested = await Promise.all(
                children.map(child => fetchSiteWithChildren(child, token))
            );

            return { ...site, childrenNodes: nested };
        } catch (err) {
            console.error("Error fetching children for site", site._id, err);
            return { ...site, childrenNodes: [] };
        }
    };

    const renderTree = (nodes, level = 0) => {
        return nodes.map(node => (
            <div key={node._id} style={{ paddingLeft: `${level * 24}px` }} className="p-1">
                <Link to={`/locations/${node._id}`} className="text-lg font-semibold hover:underline">
                    {node.name}
                </Link>
                {node.childrenNodes && renderTree(node.childrenNodes, level + 1)}
            </div>
        ));
    };

    if (loading) return (<div>
        {/* <img src="/loader.gif" height="128" width="128"/> */}
        <p className="bg-light-tan text-lg p-2 text-brown rounded">Loading locations...</p></div>);
    if (error)
        return (
            <div className="bg-light-tan font-bold text-lg text-red-800 p-2 rounded">
                <p>Error: {error}. Sorry</p>
            </div>
        );

    return (
        <div style={{ background: "#e9bf69" }} className="flex-1 flex-col justify-center rounded-lg p-2 pb-4">
            <label>Select Region:</label>
            <select
                name="RegionID"
                value={RegionID || ""}
                className="border p-2 w-full rounded"
                onChange={(e) => setParentLocationID(e.target.value)}
            >
                <option value="">Select a Parent Location</option>
                {regions.map(location => (
                    <option key={location._id} value={location._id}>{location.name}</option>
                ))}
            </select>

            {locations.length === 0 && !showForm ? (
                <p>No sites available. Try creating one!</p>
            ) : (
                <div className="flex-1 felx flex-col item-start text-left rounded-lg p-2 pb-4">{renderTree(locations)}</div>
            )}

            {showForm ? (
                <LocationForm
                    campaignID={campaignID}
                    parentLocationID={RegionID}
                    locationType="Site"
                    onSave={handleSaveLocation}
                    onCancel={() => setShowForm(false)}
                />
            ) : (
                <button onClick={() => setShowForm(true)} className="mt-2 bg-goblin-green text-xl text-gold px-4 py-2 rounded-full shadow-sm shadow-amber-800">
                    +
                </button>
            )}
        </div>
    );
}

SitesList.propTypes = {
    campaignID: PropTypes.string.isRequired,
};
