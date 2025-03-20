import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth0 } from "@auth0/auth0-react";

export default function LocationForm({ campaignID, parentLocationID, locationType, existingLocation, onSave, onCancel }) {
    // const navigate = useNavigate();
    const location = useLocation();
    const navigate = useNavigate();
    const { getAccessTokenSilently } = useAuth0();
    const params = new URLSearchParams(location.search);
    
    const [formData, setFormData] = useState(() => {
        return existingLocation
            ? { ...existingLocation } 
            : {
                name: "",
                description: "",
                locationType: locationType || null,
                campaignID: campaignID || params.get("campaignID"),
                parentLocationID: parentLocationID || params.get("parentLocationID"),
            };
    });    
    
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [parentLocation, setParentLocation] = useState();
    const [parentLocations, setParentLocations] = useState([]);

    useEffect(() => {
        if (existingLocation) {
            setFormData({
                name: existingLocation.name || "",
                description: existingLocation.description || "",
                locationType: existingLocation.locationType || locationType,
                campaignID: existingLocation.campaignID || campaignID,
                parentLocationID: existingLocation.parentLocationID || parentLocationID,
            });
          }
        }, [existingLocation, locationType, campaignID, parentLocationID]);

  //Fetch all campaigns
  const userId = window.localStorage.getItem("userId")
  useEffect(() => {
      async function fetchCampaigns() {
        try {
          const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
          const response = await fetch("http://localhost:5050/campaigns", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          let myCampaigns = []
                for (let i = 0; i < data.length; i++) {
                    if (data[i].createdBy == userId){
                        myCampaigns = [...myCampaigns, data[i]]
                    }
                }
          setCampaigns(myCampaigns);
        } catch (error) {
          console.error("Failed to fetch Campaign: ", error);
        }
      }
      fetchCampaigns();
    }, [getAccessTokenSilently]);
          

  // Fetch parent location data with authorization
  useEffect(() => {
    if (!parentLocationID) return;
    async function fetchParentLocation() {
      try {
        const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
        const response = await fetch(`http://localhost:5050/locations/${parentLocationID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setParentLocation(data);
      } catch (error) {
        console.error("Failed to fetch parent location: ", error);
      }
    }
    fetchParentLocation();
  }, [parentLocationID, getAccessTokenSilently]);

  // Fetch parent locations based on the parent's location type with authorization
  useEffect(() => {
    if (!parentLocation || !parentLocation.locationType) return;
    async function fetchParentLocations() {
      try {
        const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
        const response = await fetch(
          `http://localhost:5050/locations/campaign/${campaignID}/type/${parentLocation.locationType}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setParentLocations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch parent locations: ", error);
      }
    }
    fetchParentLocations();
  }, [parentLocation?.locationType, campaignID, getAccessTokenSilently]);
    //Apparently you don't need to track all of parentLocation if you're only using parentLocation.locationType
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSave = async (e) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        let createdLocation;
    
        if (!formData.name.trim()) {
            setError("Location name is required.");
            setSaving(false);
            return;
        }
    
        let databaseReady = false; // Flag to prevent navigation until data is confirmed
    
        try {
            const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
            const response = await fetch(
              existingLocation
                ? `http://localhost:5050/locations/${existingLocation._id}`
                : "http://localhost:5050/locations",
              {
                method: existingLocation ? "PUT" : "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
              }
            );
    
            if (!response.ok) {
                throw new Error(`Failed to ${existingLocation ? "update" : "create"} location`);
            }
    
            createdLocation = await response.json();
            // console.log("Database confirmed update:", createdLocation);
    
            databaseReady = true; // Mark database as updated
            onSave(createdLocation); // Pass new location to parent component
    
            // Ensure `locationID` is valid before navigating
            const locationID = existingLocation?._id || createdLocation?._id;
            if (!locationID) {
                console.error("Error: locationID is undefined. Cannot navigate.");
                return;
            }
    
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setSaving(false);
        }
    
        // Wait until databaseReady is true before navigating
        if (databaseReady) {
            const locationID = existingLocation?._id || createdLocation?._id;
            if (!locationID) {
                console.error("Error: locationID is undefined. Cannot navigate.");
                return;
            }
    
            // console.log(`Navigating to /locations/${locationID}`);
            navigate(`/locations/${locationID}`, { state: { forceRefresh: true } });  // Pass a state flag
        }
    };
     

    // const handleCancel = () => {
    //     navigate(-1); // Navigate back to the previous page
    // };
    
    return (
        <div className="p-4 border-0 rounded-lg bg-cream shadow-md shadow-amber-800">
            <h2 className="text-xl font-bold">Create New Location</h2>
            {error && <p className="text-red-800">{error}</p>}
            <label>Campaign:</label>
            <select
                name="campaignID"
                value={formData.campaignID}
                onChange={handleChange}
                className="border border-brown outline-none p-2 w-full rounded bg-cream hover:cursor-pointer hover:shadow-sm hover:shadow-amber-800"
            >
                <option value="">Select a Campaign</option>
                {campaigns.map(campaign => (
                    <option key={campaign._id} value={campaign._id}>{campaign.title}</option>
                ))}
            </select>

            {locationType !== "Plane" && (
                <>
                    <label>Located in:</label>
                    <select
                        name="parentLocationID"
                        value={formData.parentLocationID}
                        onChange={handleChange}
                        className="border border-brown outline-none p-2 w-full rounded bg-cream hover:cursor-pointer hover:shadow-sm hover:shadow-amber-800"
                    >
                        <option value="">Select a Location</option>
                        {parentLocations.map(location => (
                            <option key={location._id} value={location._id}>{location.name}</option>
                        ))}
                    </select>
                </>
            )}

            <form onSubmit={handleSave} className="mt-8 space-y-3">
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Location Name"
                    required
                    className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                    hover:shadow-sm hover:shadow-amber-800
                    focus:shadow-sm focus:shadow-amber-600"
                />
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Location Description"
                    className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                    hover:shadow-sm hover:shadow-amber-800
                    focus:shadow-sm focus:shadow-amber-600"
                />
                <div className="flex space-x-2">
                    <button
                        type="submit"
                        className={saving ? "bg-tan font-bold text-brown px-4 py-2 rounded" : "button font-bold bg-goblin-green text-gold px-4 py-2 rounded hover:shadow-sm hover:shadow-amber-800"}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                    <button type="button" onClick={onCancel} className="bg-cancel-red font-bold button text-gold px-4 py-2 rounded hover:shadow-sm hover:shadow-amber-800">
                        Cancel
                    </button>

                </div>
            </form>
        </div>
    );
}

LocationForm.propTypes = {
    campaignID: PropTypes.string.isRequired,
    parentLocationID: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
    locationType: PropTypes.string.isRequired,
    existingLocation: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};