import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import LocationList from "./locationlist";
import SitesList from "./locationlistsites";
import NotesList from "./noteslist";
import CharacterList from "./characterlist";
import { useAuth0 } from "@auth0/auth0-react";
import SanitizeData from "../utils/santitization.mjs";


export default function CampaignOverview() {
    const userId = window.localStorage.getItem("userId")
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === "new";
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(!isNew);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(isNew);
    const [saving, setSaving] = useState(false); // Prevent duplicate submissions
    const [showNotes, setShowNotes] = useState(false);
    const [showCharacters, setShowCharacters] = useState(false);
    const [showPlanes, setShowPlanes] = useState(false);
    const [showRealms, setShowRealms] = useState(false);
    const [showCountries, setShowCountries] = useState(false);
    const [showRegions, setShowRegions] = useState(false);
    const [showSites, setShowSites] = useState(false);
    const [formData, setFormData] = useState({ title: "", description: "", createdBy: userId});
    const { getAccessTokenSilently } = useAuth0();

    window.localStorage.setItem("selectedCampaign", id)
    
    

    useEffect(() => {
        if (isNew) return;

        const fetchCampaign = async () => {
            try {
                const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
                // console.log(token)
                const response = await fetch(`http://localhost:5050/campaigns/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error(`Error fetching campaign: ${response.statusText}`);
                const data = await response.json();
                setCampaign(data);
                setFormData({ title: data.title, description: data.description || "", createdBy: data.createdBy });
            } catch (err) {
                console.error("Failed to fetch campaign:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [id, isNew, getAccessTokenSilently]);

    const handleChange = (e) => {
        let sanitized = SanitizeData(e.target.value)
        setFormData({ ...formData, [e.target.name]: sanitized });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (saving) return; // Prevent double submission
        setSaving(true);

        try {
            const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
            const response = await fetch("http://localhost:5050/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error("Failed to create campaign");

            const createdCampaign = await response.json();
            navigate(`/campaigns/${createdCampaign._id || createdCampaign.insertedId}`);
        } catch (error) {
            console.error(error);
            setError("Failed to create campaign.");
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = () => {
        return campaign && (formData.title !== campaign.title || formData.description !== campaign.description);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!hasChanges()) {
            setEditMode(false);
            return;
        }

        try {
            const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
            const response = await fetch(`http://localhost:5050/campaigns/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...formData, createdBy: campaign.createdBy || userId }),
            });
            if (!response.ok) throw new Error("Failed to update campaign");

            setCampaign({ ...campaign, ...formData });
        } catch (error) {
            console.error(error);
            setError("Failed to update campaign.");
        } finally {
            setEditMode(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this campaign?")) return;
        
        try {
          const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
          const response = await fetch(`http://localhost:5050/campaigns/${id}`, { 
            method: "DELETE",
            headers: {  // Fixed: headers should be an object
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
      
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          
          navigate("/campaigns");
        } catch (error) {
          console.error("Delete campaign failed:", {
            error: error.message,
            campaignId: id
          });
          setError(error.message || "Failed to delete campaign.");
        }
      };

    const handleCancel = () => {
        navigate("/campaigns");
    };

    if (loading) return <p className="text-lg text-brown">Loading campaign details...</p>;
    if (error)
        return (
            <div className="mt-16 p-4 bg-cream text-red-800 text-lg p-2 rounded">
                <p className="mb-4">Error: {error}. Sorry! </p>
                <Link to="/campaigns" className="button bg-goblin-green text-gold font-bold px-4 py-2 rounded mb-4">Take me back</Link>
            </div>
        );

    // console.log("CampaignOverview - campaignID: ", id);

    return (
        <div className="p-8 bg-cream rounded-lg shadow-md shadow-amber-800 mt-16 text-brown">
            {editMode ? (
                <form className="space-y-3">
                <h2 className="text-2xl text-brown underline sancreek-regular mb-4">Create New Campaign</h2>
                <label
                    className="text-xl text-brown inline text-left"
                    htmlFor="title">
                    Name*
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="border border-brown text-brown p-2 w-full rounded bg-cream mb-4 outline-none"
                    required
                />
                <label className="text-brown text-xl mt-8">
                    Description*
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="border border-brown text-brown p-2 w-full rounded bg-cream outline-none"
                    required
                />
                <p className="text-brown">* indicates a required field</p>
                <div className="flex space-x-2">
                    <button 
                        onClick={isNew ? handleSave : handleUpdate} 
                        className={`px-4 py-2 rounded button ${saving ? "bg-tan" : "bg-goblin-green text-gold"}`}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                    <button 
                        onClick={handleCancel} 
                        className="bg-cancel-red text-gold button px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </form>
            ) : (
                <>
                    <h1 className="text-3xl sancreek-regular">{campaign?.title}</h1>
                    <p className="text-lg px-4 py-2 italic">{campaign?.description || "No description available."}</p>
                    <div className="flex space-x-2 mt-4 items-center justify-center mb-4">
                        {!isNew && (
                            <>
                                <button onClick={() => setEditMode(true)} className="button bg-goblin-green text-gold font-bold px-4 py-2 rounded shadow-sm shadow-amber-700">
                                    Edit Campaign
                                </button>
                                <button onClick={handleDelete} className="button bg-cancel-red text-gold px-4 py-2 font-bold rounded shadow-sm shadow-amber-700">
                                    Delete Campaign
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}


            <div className="flex flex-col">
                {/* Notes Section */}
                <button onClick={() => setShowNotes(!showNotes)} className="mt-2 text-lg hover:underline font-semibold">
                    Notes {showNotes ? "▲" : "▼"}
                </button>
                {
                    showNotes && <NotesList campaignID={id} />
                }

                {/* Player Characters */}
                <button onClick={() => setShowCharacters(!showCharacters)} className="text-lg hover:underline font-semibold">
                    Player Characters {showCharacters ? "▲" : "▼"}
                </button>
                {showCharacters && <CharacterList campaignID={id} />}
            </div>

            {!isNew && (
                <>
                    <div>
                        <button onClick={() => setShowPlanes(!showPlanes)} className="text-lg hover:underline font-semibold">
                            Planes {showPlanes ? "▲" : "▼"}
                        </button>
                        {showPlanes && <LocationList parentLocationID={null} locationType="Plane" campaignID={id} isOverview={true}/>}
                    </div>

                    <div>
                        <button onClick={() => setShowRealms(!showRealms)} className="text-lg hover:underline font-semibold">
                            Realms {showRealms ? "▲" : "▼"}
                        </button>
                        {showRealms && <LocationList parentLocationID={null} locationType="Realm" campaignID={id} isOverview={true} />}
                    </div>

                    <div>
                        <button onClick={() => setShowCountries(!showCountries)} className="text-lg hover:underline font-semibold">
                            Countries {showCountries ? "▲" : "▼"}
                        </button>
                        {showCountries && <LocationList parentLocationID={null} locationType="Country" campaignID={id} isOverview={true} />}
                    </div>

                    <div>
                        <button onClick={() => setShowRegions(!showRegions)} className="text-lg hover:underline font-semibold">
                            All Regions {showRegions ? "▲" : "▼"}
                        </button>
                        {showRegions && <LocationList parentLocationID={null} locationType="Region" campaignID={id} isOverview={true} />}
                    </div>

                    <div>
                        <button onClick={() => setShowSites(!showSites)} className="text-lg hover:underline font-semibold">
                            Sites and Sub-Sites by Regions {showSites ? "▲" : "▼"}
                        </button>
                        {showSites && <SitesList campaignID={id} />}
                    </div>
                </>
            )}
        </div>
    );
}
