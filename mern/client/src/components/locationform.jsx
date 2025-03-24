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
    const [parentLocations, setParentLocations] = useState([]); //locations PLURAL!!!! Very important

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
  useEffect(() => {
      async function fetchCampaigns() {
        try {
          const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
          const response = await fetch("http://localhost:5050/campaigns", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          // console.log("Fetched campaigns: ", data);
          setCampaigns(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Failed to fetch Campaign: ", error);
        }
      }
      fetchCampaigns();
    }, [getAccessTokenSilently]);
          

  // Fetch parent location data with authorization
  useEffect(() => {
    if (!formData.parentLocationID) return;
    async function fetchParentLocation() {
      try {
        const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
        const response = await fetch(`http://localhost:5050/locations/${formData.parentLocationID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setParentLocation(data);
      } catch (error) {
        console.error("Failed to fetch parent location: ", error);
      }
    }
    fetchParentLocation();
  }, [formData.parentLocationID, getAccessTokenSilently]);

  // Fetch parent locations based on the parent's location type with authorization
  useEffect(() => {
    if (!formData.locationType || !campaignID) return;
  
    async function fetchParentLocations() {
      try {
        const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
  
        let combined = [];
  
        if (formData.locationType === "Site") {
          // Fetch both Regions and Sites
          const [regionRes, siteRes] = await Promise.all([
            fetch(`http://localhost:5050/locations/campaign/${campaignID}/type/Region`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`http://localhost:5050/locations/campaign/${campaignID}/type/Site`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
  
          const [regions, sites] = await Promise.all([
            regionRes.json(),
            siteRes.json(),
          ]);
  
          combined = [
            ...(Array.isArray(regions) ? regions : []),
            ...(Array.isArray(sites) ? sites : []),
          ];
        } else {
          // Fetch parent locations based on parentLocation's type
          const parentType = parentLocation?.locationType;
          if (!parentType) return;
  
          const response = await fetch(
            `http://localhost:5050/locations/campaign/${campaignID}/type/${parentType}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
  
          const data = await response.json();
          combined = Array.isArray(data) ? data : [];
        }
  
        // Filter out self-reference if editing
        if (existingLocation?._id) {
          combined = combined.filter(loc => loc._id !== existingLocation._id);
        }
  
        setParentLocations(combined);
      } catch (error) {
        console.error("Failed to fetch parent locations: ", error);
      }
    }
  
    fetchParentLocations();
  }, [formData.locationType, campaignID, parentLocation?.locationType, existingLocation?._id, getAccessTokenSilently]);
  
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
            
//////////////////////////////////////////////            
            // Determine nestDepth if location is a Site
            if (formData.locationType === "Site") {
              let nestDepth = 0;
              const parentDepth = parseInt(parentLocation?.nestDepth);
              if (!isNaN(parentDepth)) {
                nestDepth = parentDepth + 1;
              }
              formData.nestDepth = nestDepth;
              formData.children = []; // Start with no children
          }            
//////////////////////////////////////////////          

            // Create or update location
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

            // If the parent is a Site, add this new location to its children
            try {
              const isSite = formData.locationType === "Site";
              const isNew = !existingLocation;
              const parentChanged = existingLocation &&
                existingLocation.parentLocationID &&
                formData.parentLocationID &&
                existingLocation.parentLocationID !== formData.parentLocationID;
            
              if (isSite && isNew && parentLocation?.locationType === "Site") {
                // New Site under a Site parent → add to parent's children[]
                const patchRes = await fetch(`http://localhost:5050/locations/${parentLocation._id}/add-child`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ childID: createdLocation._id }),
                });
            
                if (!patchRes.ok) {
                  const errText = await patchRes.text();
                  throw new Error(`Failed to PATCH parent: ${patchRes.statusText} - ${errText}`);
                }
            
                console.log("Successfully added new child to parent.");
              }
            
              if (isSite && parentChanged) {
                console.log("Parent has changed. Updating relationships...");
            
                // 1. Remove from old parent
                await fetch(`http://localhost:5050/locations/${existingLocation.parentLocationID}/remove-child`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ childID: existingLocation._id }),
                });
            
                // 2. Add to new parent
                await fetch(`http://localhost:5050/locations/${formData.parentLocationID}/add-child`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ childID: createdLocation._id }),
                });
            
                console.log("Parent-child relationship updated.");
              }
            } catch (err) {
              console.error("PATCH error (add/remove child):", err);
            }            
            
            databaseReady = true; // Mark database as updated
            onSave(createdLocation); // Pass new location to parent component
    
            // Ensure `locationID` is valid before navigating
            const locationID = existingLocation?._id || createdLocation?._id;
            if (!locationID) {
                console.error("Error: locationID is undefined. Cannot navigate.");
                return;
            }

// //////////////////////////////////////////////
//             if (locationID) {
//               navigate(`/locations/${locationID}`, { state: { forceRefresh: true } });
//             }            
// //////////////////////////////////////////////

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
        <div className="p-4 border rounded-lg bg-white shadow-md">
            <h2 className="text-xl font-bold">Create New Location</h2>
            {error && <p className="text-red-500">{error}</p>}
            <label>Campaign:</label>
            <select
                name="campaignID"
                value={formData.campaignID}
                onChange={handleChange}
                className="border p-2 w-full rounded"
            >
                <option value="">Select a Campaign</option>
                {campaigns.map(campaign => (
                    <option key={campaign._id} value={campaign._id}>{campaign.title}</option>
                ))}
            </select>

            {locationType !== "Plane" && (
                <>
                    <label>Parent Location:</label>
                    <select
                        name="parentLocationID"
                        value={formData.parentLocationID}
                        onChange={handleChange}
                        className="border p-2 w-full rounded"
                    >
                        <option value="">Select a Parent Location</option>
                        {parentLocations.map(location => (
                            <option key={location._id} value={location._id}>{location.name}</option>
                        ))}
                    </select>
                </>
            )}

            <form onSubmit={handleSave} className="space-y-3">
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Location Name"
                    required
                    className="border p-2 w-full rounded"
                />
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Location Description"
                    className="border p-2 w-full rounded"
                />
                <div className="flex space-x-2">
                    <button
                        type="submit"
                        className={`px-4 py-2 rounded ${saving ? "bg-gray-400" : "bg-blue-600 text-white"}`}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                    <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-4 py-2 rounded">
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