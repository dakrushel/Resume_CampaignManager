import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import LocationForm from "./locationform";
import { useAuth0 } from "@auth0/auth0-react";

export default function LocationList({ parentLocationID, locationType, campaignID, isOverview }) {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { getAccessTokenSilently } = useAuth0();
    
    // console.log("LocationList - Received parentLocationID: ", parentLocationID);
    // console.log("LocationList - Revieved locationType: ", locationType);
    // console.log("LocationList - Received campaignID:", campaignID);

    // const navigate = useNavigate();

    useEffect(() => {
        const fetchLocations = async () => {
            if (!campaignID) {
                setError("Missing campaignID. Cannot fetch locations.");
                setLoading(false);
                return;
            }

            try {
                const token = await getAccessTokenSilently({ audience: "https://campaignapi.com"});
                let endpoint = parentLocationID
                    ? `http://localhost:5050/locations/parent/${parentLocationID}`
                    : `http://localhost:5050/locations/campaign/${campaignID}/type/${locationType}`;

                // console.log(`LocationList - Fetching locations from: ${endpoint}`);

                const response = await fetch(endpoint, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error fetching locations: ${response.statusText}`);
                }
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
    }, [parentLocationID, campaignID, locationType, getAccessTokenSilently]);

    const handleSaveLocation = (newLocation) => {
        setLocations([...locations, newLocation]); // Update state with new location
        setShowForm(false); // Hide the form after saving
    };

    if (loading) return <p className="text-lg text-brown">Loading campaigns...</p>;
    if (error)
        return (
            <div className="bg-cancel-red text-gold p-2 rounded">
                <p>Error: {error}</p>
            </div>
        );

    return (
        <div style={{ background: "#e9bf69" }} className="flex-1 flex-col justify-center rounded-lg p-2 pb-4">
            {locations.length === 0 && !showForm ? (
                <p>No locations of type {locationType} available. Try creating one!</p>
            ) : (
                locations.map((location) => (
                    <div key={location._id} className="p-2 border-b border-brown rounded">
                        <Link to={`/locations/${location._id}`} className="text-xl font-bold hover:underline">
                            {location.name} ({location.parentLocationID})
                        </Link>
                    </div>
                ))
            )}
            {showForm ? (
                <LocationForm 
                    campaignID={campaignID}
                    parentLocationID={parentLocationID}
                    locationType={locationType}
                    onSave={handleSaveLocation}
                    onCancel={() => setShowForm(false)}
                />
            ) : (!isOverview || locationType === "Plane" ? <button onClick={() => setShowForm(true)} className="mt-2 bg-goblin-green text-xl text-gold px-4 py-2 rounded-full shadow-sm shadow-amber-800"> + </button> : ""
            )}

        </div>
    );
}

LocationList.propTypes = {
    parentLocationID: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
    locationType: PropTypes.string.isRequired,
    campaignID: PropTypes.string.isRequired,
    isOverview: PropTypes.bool,
};
