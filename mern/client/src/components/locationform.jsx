import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

export default function LocationForm({ campaignID, parentLocationID, locationType, existingLocation, onSave, onCancel }) {
    // const navigate = useNavigate();
    const location = useLocation();
    const navigate = useNavigate();
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

        // if (!parentLocation || !parentLocation.locationType) return;

        fetch("http://localhost:5050/campaigns")
            .then(response => response.json())
            .then(data => {
                console.log("Fetched campaigns: ", data);
                setCampaigns(Array.isArray(data) ? data: []);
            })
            .catch(error => console.error("Failed to fetch Campaign: ", error));
            
        }, [existingLocation, locationType, campaignID, parentLocationID]);

    useEffect(() => {
        if (!parentLocationID) return;
        
            fetch(`http://localhost:5050/locations/${parentLocationID}`)
                .then(response => response.json())
                .then(data => setParentLocation(data))
                .catch(error => console.error("Failed to fetch parent location: ", error));

    }, [parentLocationID]);

    useEffect(() => {
        // if (parentLocation && parentLocation.locationType) {
        if (!parentLocation || !parentLocation.locationType) return;

        fetch(`http://localhost:5050/locations/campaign/${campaignID}/type/${parentLocation.locationType}`)
            .then(response => response.json())
            .then(data => setParentLocations(Array.isArray(data) ? data: []))
            .catch(error => console.error("Failed to fetch parent location: ", error));
        }, [parentLocation?.locationType, campaignID]);
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
    
        // console.log("Submitting location data:", JSON.stringify(formData, null, 2));
    
        let databaseReady = false; // Flag to prevent navigation until data is confirmed
    
        try {
            const response = await fetch(
                existingLocation
                    ? `http://localhost:5050/locations/${existingLocation._id}`
                    : "http://localhost:5050/locations",
                {
                    method: existingLocation ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );
    
            if (!response.ok) {
                throw new Error(`Failed to ${existingLocation ? "update" : "create"} location`);
            }
    
            createdLocation = await response.json();
            console.log("Database confirmed update:", createdLocation);
    
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
