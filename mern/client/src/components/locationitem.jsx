import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link, } from "react-router-dom";
import LocationList from "./locationlist";
import LocationForm from "./locationform";
import PropTypes from "prop-types";
import NotesList from "./noteslist";
import EventList from "./eventlist";
import NPCList from "./NPCList";
import { useAuth0 } from "@auth0/auth0-react";
import loader from "../graphics/loader.gif";
import MonstersList from "./monsterlist";
import ItemList from "./itemlist";


export default function LocationItem() {
    const { id } = useParams(); // Get IDs from the URL
    const navigate = useNavigate();
    const isNew = id === "new";
    const locationData = useLocation();
    const locationState = useLocation();
    const { getAccessTokenSilently } = useAuth0();
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
    const [showMonsters, setShowMonsters] = useState(false);
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

        const fetchLocation = async () => {
            try {
                const token = await getAccessTokenSilently({ audience: "https://campaignapi.com"});
                
                //Fetch campaign data if campaignID exists
                if (formData.campaignID) {
                    fetch(`http://localhost:5050/campaigns/${formData.campaignID}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    })
                        .then(response => response.json())
                        .then(data => setCampaignName(data.title))
                        .catch(error => console.error("Failed to fetch campaign: ", error));
                }

                //Fetch parent location data if it exists
                if (formData.parentLocationID) {
                    fetch(`http://localhost:5050/locations/${formData.parentLocationID}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                        .then(response => response.json())
                        .then(data => setParentLocationName(data.name))
                        .catch(error => console.error("Failed to fetch parent location: ", error));
                }

                //Fetch current location
                const response = await fetch(`http://localhost:5050/locations/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
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
                // console.log("Setting formData with:", {
                //     name: data.name,
                //     description: data.description || "",
                //     locationType: data.locationType || "Region",
                //     campaignID: data.campaignID ? data.campaignID.toString() : "",
                //     parentLocationID: data.parentLocationID ? data.parentLocationID.toString() : null,
                // });
                
            } catch (err) {
                console.error("Failed to fetch location:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLocation();
    }, [id,
        isNew,
        campaignID,
        formData.campaignID,
        parentLocationID,
        formData.parentLocationID,
        locationType,
        locationState.state?.forceRefresh,
        getAccessTokenSilently]);
    
    const handleSave = async (newLocation) => {
        setEditMode(false);
        setLocation(newLocation);
        navigate(`/locations/${newLocation._id}`);
    };    

    const handleDelete = async () => {
        if (deleting) return; //no duplicate requests

        //Are you sure?
        if (!window.confirm("Are you sure you want to delete this location?")) return;
        
        setDeleting(true);

        try {
            const token = await getAccessTokenSilently({ audience: "https://campaignapi.com"});
            const response = await fetch(`http://localhost:5050/locations/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.error || "Failed to delete location");
            }
            
            const redirectPath = parentLocationID ? `/location/${parentLocationID}` : `/campaigns/${window.localStorage.getItem("selectedCampaign")}`;
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
    if (loading || !location) return(<div><img src={loader}/> <p className="mt-16 text-brown">Loading location details...</p></div>);
    if (error) return <p className="mt-16 bg-cancel-red text-gold">{error}</p>;
    if (!location) {
        console.warn("Location data is missing, preventing incorrect render")
        return <p className="text-brown">Fetching location...</p>;
    }

    console.log("Rendering location item: ", location);
    console.log(formData.campaignID)
    return (
        <div className="p-8 border-0 rounded-lg bg-cream shadow-md text-brown shadow-amber-800 mt-16">
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
                <div className="flex flex-col">
                    <h1 className="text-3xl sancreek-regular">{location.name || "Unknown Location"}</h1>
                    <p className="text-lg italic px-4 py-2">{location.description || "No description available."}</p>
                    <p><strong>Campaign:</strong> <Link className="hover:underline" to={`/campaigns/${formData.campaignID}`}>{campaignName || "Unspecified Campaign"}</Link></p>
                    {formData.locationType !== "Plane" && (<p><strong>Located in:</strong> <Link className="hover:underline" to={`/locations/${formData.parentLocationID}`}>{parentLocationName || "Unspecified Parent Location"}</Link></p>)}
                    {/* <p><strong>Location Type:</strong> {formData.locationType}</p> */}
                    <div className="flex space-x-2 mt-4 mx-auto">
                        <button onClick={() => setEditMode(true)} className="bg-goblin-green font-bold button shadow-sm shadow-amber-700 hover:shadow-amber-900 text-gold px-4 py-2 rounded">
                            Edit Location
                        </button>
                        <button onClick={handleDelete} className="bg-cancel-red font-bold button hover:shadow-sm shadow-sm shadow-amber-700 hover:shadow-amber-900 text-gold px-4 py-2 rounded">
                            Delete Location
                        </button>
                    </div>

                    {/* Notes Section */}
                    <button onClick={() => setShowNotes(!showNotes)} className="mt-8 hover:underline font-bold text-lg">
                        Notes {showNotes ? "▲" : "▼"}
                    </button>
                    {
                        showNotes && <NotesList parentLocationID={location?._id} campaignID={formData.campaignID} />
                    }

                    {/* Events Section */}
                    <button onClick={() => setShowEvents(!showEvents)} className="mt-2 hover:underline font-bold text-lg">
                        Events {showEvents ? "▲" : "▼"}
                    </button>
                    {
                        showEvents && <EventList parentLocationID={location?._id} campaignID={formData.campaignID} />
                    }

                    {/* NPCs, Monsters & Items (Only for Regions and Sites) */}
                    {["Region", "Site"].includes(formData.locationType) && (
                        <>
                            <button onClick={() => setShowNPCs(!showNPCs)} className="mt-2 hover:underline font-bold text-lg">
                                NPCs {showNPCs ? "▲" : "▼"}
                            </button>
                            {
                                showNPCs && <NPCList parentLocationID={location?._id} campaignID={formData.campaignID} />
                            }

                            <button onClick={() => setShowMonsters(!showMonsters)} className="mt-2 hover:underline font-bold text-lg">
                                Monsters {showMonsters ? "▲" : "▼"}
                            </button>
                            {
                                showMonsters && <MonstersList parentLocationID={location?._id} campaignID={formData.campaignID} />
                            }
                            
                            <button onClick={() => setShowItems(!showItems)} className="mt-2 hover:underline font-bold text-lg">
                                Items {showItems ? "▲" : "▼"}
                            </button>
                            {
                                showItems && <ItemList parentLocationID={location?._id} campaignID={formData.campaignID} />
                            }
                        </>
                    )}

                    {/* Sublocations */}
                    <button onClick={() => setShowSublocations(!showSublocations)} className="mt-2 hover:underline font-bold text-lg">
                        {getChildLocationType(formData.locationType) === "Country" ? ("Countries") : (`${getChildLocationType(formData.locationType)}s`)} {showSublocations ? "▲" : "▼"}
                    </button>
                    {showSublocations && <LocationList
                        parentLocationID={location?._id}
                        locationType={getChildLocationType(formData.locationType)}
                        campaignID={formData.campaignID} />}

                </div>
            )}
        </div>
    );
}

/** Prop Validation for Type Safety */
LocationItem.propTypes = {
    id: PropTypes.string, // `useParams` provides `id` as a string
};