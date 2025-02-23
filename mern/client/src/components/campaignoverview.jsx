import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LocationList from "./locationlist";
import NotesList from "./noteslist";

export default function CampaignOverview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === "new";

    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(!isNew);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(isNew);
    const [formData, setFormData] = useState({ title: "", description: "", createdBy: "DungeonMaster123" });
    const [saving, setSaving] = useState(false); // Prevent duplicate submissions
    const [showNotes, setShowNotes] = useState(false);

    const [showPlanes, setShowPlanes] = useState(false);
    const [showRealms, setShowRealms] = useState(false);
    const [showCountries, setShowCountries] = useState(false);
    const [showRegions, setShowRegions] = useState(false);

    useEffect(() => {
        if (isNew) return;

        const fetchCampaign = async () => {
            try {
                const response = await fetch(`http://localhost:5050/campaigns/${id}`);
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
    }, [id, isNew]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (saving) return; // Prevent double submission
        setSaving(true);

        try {
            const response = await fetch("http://localhost:5050/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
            const response = await fetch(`http://localhost:5050/campaigns/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, createdBy: campaign.createdBy || "DungeonMaster123" }),
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
            const response = await fetch(`http://localhost:5050/campaigns/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete campaign");
            navigate("/campaigns");
        } catch (error) {
            console.error(error);
            setError("Failed to delete campaign.");
        }
    };

    const handleCancel = () => {
        navigate("/campaigns");
    };

    if (loading) return <p className="text-lg text-gray-600">Loading campaign details...</p>;
    if (error)
        return (
            <div className="bg-red-200 text-red-800 p-2 rounded">
                <p>Error: {error}</p>
            </div>
        );

    console.log("CampaignOverview - campaignID: ", id);

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            {editMode ? (
                <form className="space-y-3">
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="border p-2 w-full rounded"
                        required
                    />
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="border p-2 w-full rounded"
                    />
                    <div className="flex space-x-2">
                        <button 
                            onClick={isNew ? handleSave : handleUpdate} 
                            className={`px-4 py-2 rounded ${saving ? "bg-gray-400" : "bg-blue-600 text-white"}`}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                        <button 
                            onClick={handleCancel} 
                            className="bg-gray-400 text-white px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <h1 className="text-3xl font-bold">{campaign?.title}</h1>
                    <p className="text-lg italic">{campaign?.description || "No description available."}</p>
                    <div className="flex space-x-2 mt-4">
                        {!isNew && (
                            <>
                                <button onClick={() => setEditMode(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
                                    Edit
                                </button>
                                <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
                                    Delete Campaign
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* Notes Section */}
            <button onClick={() => setShowNotes(!showNotes)} className="mt-2 text-blue-600 underline">
                Notes {showNotes ? "▲" : "▼"}
            </button>
            {
                showNotes && <NotesList campaignID={id} />
            }

            {!isNew && (
                <>
                    <div className="mt-6">
                        <button onClick={() => setShowPlanes(!showPlanes)} className="text-lg font-semibold">
                            Planes {showPlanes ? "▲" : "▼"}
                        </button>
                        {showPlanes && <LocationList parentLocationID={null} locationType="Plane" campaignID={id} isOverview={true}/>}
                    </div>

                    <div>
                        <button onClick={() => setShowRealms(!showRealms)} className="text-lg font-semibold">
                            Realms {showRealms ? "▲" : "▼"}
                        </button>
                        {showRealms && <LocationList parentLocationID={null} locationType="Realm" campaignID={id} isOverview={true} />}
                    </div>

                    <div>
                        <button onClick={() => setShowCountries(!showCountries)} className="text-lg font-semibold">
                            Countries {showCountries ? "▲" : "▼"}
                        </button>
                        {showCountries && <LocationList parentLocationID={null} locationType="Country" campaignID={id} isOverview={true} />}
                    </div>

                    <div>
                        <button onClick={() => setShowRegions(!showRegions)} className="text-lg font-semibold">
                            All Regions {showRegions ? "▲" : "▼"}
                        </button>
                        {showRegions && <LocationList parentLocationID={null} locationType="Region" campaignID={id} isOverview={true} />}
                    </div>
                </>
            )}
        </div>
    );
}
