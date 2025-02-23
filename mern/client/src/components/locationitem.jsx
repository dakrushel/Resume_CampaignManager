import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import LocationList from "./locationlist";
import LocationForm from "./locationform";
import PropTypes from "prop-types";
import NotesList from "./noteslist";

export default function LocationItem() {
    const { id } = useParams(); // Get IDs from the URL
    const navigate = useNavigate();
    const isNew = id === "new";
    const locationData = useLocation();
    const locationState = useLocation();
    // console.log("window.location:", window.location.href); // Debug full URL
    // console.log("locationData.search:", locationData.search);
    const params = new URLSearchParams(locationData.search);
    const campaignID = params.get("campaignID");
    const [campaignName, setCampaignName] = useState("");
    const [parentLocationName, setParentLocationName] = useState("");
    const parentLocationID = params.get("parentLocationID") || null;
    const locationType = params.get("locationType");

    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(!isNew);
    // const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(isNew);
    const [formData, setFormData] = useState({ 
        name: "",
        description: "",
        locationType: locationType,
        campaignID: campaignID,
        parentLocationID: parentLocationID,
    });

    const getChildLocationType = (locationType) => {

        const locationHierarchy = {
            Plane: "Realm",
            Realm: "Country",
            Country: "Region",
            Region: "Site",
            Site: "Site",  // Nested sites allowed
        };

        return locationHierarchy[locationType] || null;
    };

    // Expand/collapse states
    const [showNotes, setShowNotes] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [showNPCs, setShowNPCs] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const [showSublocations, setShowSublocations] = useState(false);

    useEffect(() => {
        if (isNew) {
            setFormData({
                name: "",
                description: "",
                locationType: locationType,  //Problem: this needs to be the next type down in hierarchy
                campaignID: campaignID,  // Use extracted campaignID
                parentLocationID: parentLocationID,  //Problem: this needs to be the previous locationID
            });
            setLocation(null);
            setLoading(false);
            return;
        }

            if (formData.campaignID) {
                fetch(`http://localhost:5050/campaigns/${formData.campaignID}`)
                    .then(response => response.json())
                    .then(data => setCampaignName(data.title))
                    .catch(error => console.error("Failed to fetch campaign: ", error));
            }
        
            if (formData.parentLocationID) {
                fetch(`http://localhost:5050/locations/${formData.parentLocationID}`)
                    .then(response => response.json())
                    .then(data => setParentLocationName(data.name))
                    .catch(error => console.error("Failed to fetch parent location: ", error));
            }

        const fetchLocation = async () => {
            try {
                const response = await fetch(`http://localhost:5050/locations/${id}`);
                if (!response.ok) {
                    throw new Error(`Error fetching location: ${response.statusText}`);
                }
                const data = await response.json();
                console.log("Fetched location data: ", data);
                setLocation(data);
                setFormData({
                    name: data.name,
                    description: data.description || "",
                    locationType: data.locationType,
                    campaignID: data.campaignID ? data.campaignID.toString() : "",
                    parentLocationID: data.parentLocationID ? data.parentLocationID.toString() : null,
                });
                console.log("Setting formData with:", {
                    name: data.name,
                    description: data.description || "",
                    locationType: data.locationType || "Region",
                    campaignID: data.campaignID ? data.campaignID.toString() : "",
                    parentLocationID: data.parentLocationID ? data.parentLocationID.toString() : null,
                });
                
            } catch (err) {
                console.error("Failed to fetch location:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLocation();
    }, [id, isNew, campaignID, formData.campaignID, parentLocationID, formData.parentLocationID, locationType, locationState.state?.forceRefresh]);
    
    const handleSave = async (newLocation) => {
        setEditMode(false);
        setLocation(newLocation);
        navigate(`/locations/${newLocation._id}`);
    };    

    const handleDelete = async () => {
        if (deleting) return; //no duplicate requests
        setDeleting(true);
        if (!window.confirm("Are you sure you want to delete this location?")) return;
        
        setDeleting(true);

        try {
            const response = await fetch(`http://localhost:5050/locations/${id}`, { method: "DELETE" });
            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.error || "Failed to delete location");
            }
            
            const redirectPath = parentLocationID ? `/location/${parentLocationID}` : "/campaigns";
            navigate(redirectPath);
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleCancel = () => {
        if (isNew) {
            navigate(parentLocationID ? `/locations/${parentLocationID}` : "/campaigns");
        }
         else {
            setFormData({
                name: location?.name || "",
                description: location?.description || "",
                locationType: location?.locationType || "Region",
                campaignID: location?.campaignID || "",
                parentLocationID: location?.parentLocationID || null,
            });
            setEditMode(false);
            
        }
    };
    // console.log("Location campaignID: ", location.campaignID)
    // console.log("formData.campaignID: ", formData.campaignID)
    if (loading || !location) return <p className="text-gray-600">Loading location details...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!location) {
        console.warn("Location data is missing, preventing incorrect render")
        return <p className="text-gray-600">Fetching location...</p>;
    }

    console.log("Rendering location item: ", location);
    return (
        <div className="p-4 border rounded-lg bg-white shadow-md">
            {editMode ? (
                    <LocationForm 
                    campaignID={formData.campaignID}
                    parentLocationID={isNew ? location?._id : formData.parentLocationID}
                    locationType={isNew ? getChildLocationType(formData.locationType) : formData.locationType}
                    // parentLocationType={isNew ? formData.locationType : getParentLocationType(formData.locationType)}
                    existingLocation={location}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            ) : (
                <>
                    <h1 className="text-3xl font-bold">{location.name || "Unknown Location"}</h1>
                    <p className="text-lg italic">{location.description || "No description available."}</p>
                    <p><strong>Campaign:</strong> {campaignName || "Unspecified Campaign"}</p>
                    {formData.locationType !== "Plane" && (<p><strong>Parent Location:</strong> {parentLocationName || "Unspecified Parent Location"}</p>)}
                    {/* <p><strong>Location Type:</strong> {formData.locationType}</p> */}
                    <div className="flex space-x-2 mt-4">
                        <button onClick={() => setEditMode(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
                            Edit
                        </button>
                        <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
                            Delete Location
                        </button>
                    </div>

                    {/* Notes Section */}
                    <button onClick={() => setShowNotes(!showNotes)} className="mt-2 text-blue-600 underline">
                        Notes {showNotes ? "▲" : "▼"}
                    </button>
                    {
                        showNotes && <NotesList parentLocationID={location?._id} campaignID={formData.campaignID} />
                    }

                    {/* Events Section */}
                    <button onClick={() => setShowEvents(!showEvents)} className="mt-2 text-blue-600 underline">
                        Events {showEvents ? "▲" : "▼"}
                    </button>

                    {/* NPCs & Items (Only for Regions and Sites) */}
                    {["Region", "Site"].includes(formData.locationType) && (
                        <>
                            <button onClick={() => setShowNPCs(!showNPCs)} className="mt-2 text-blue-600 underline">
                                NPCs {showNPCs ? "▲" : "▼"}
                            </button>

                            <button onClick={() => setShowItems(!showItems)} className="mt-2 text-blue-600 underline">
                                Items {showItems ? "▲" : "▼"}
                            </button>
                        </>
                    )}

                    {/* Sublocations */}
                    <button onClick={() => setShowSublocations(!showSublocations)} className="mt-2 text-blue-600 underline">
                        {getChildLocationType(formData.locationType) === "Country" ? ("Countries") : (`${getChildLocationType(formData.locationType)}s`)} {showSublocations ? "▲" : "▼"}
                    </button>
                    {showSublocations && <LocationList
                        parentLocationID={location?._id}
                        locationType={getChildLocationType(formData.locationType)}
                        campaignID={formData.campaignID} />}

                </>
            )}
        </div>
    );
}

/** Prop Validation for Type Safety */
LocationItem.propTypes = {
    id: PropTypes.string, // `useParams` provides `id` as a string
};