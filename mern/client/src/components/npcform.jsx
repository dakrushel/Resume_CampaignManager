import { useState, } from "react";
import PropTypes from "prop-types";
import { useAuth0 } from "@auth0/auth0-react";
import { randGen } from "../utils/RandomGeneration/commonNPCGenerator";

export default function NpcForm({ campaignID, parentLocationID, existingNpc, onSave, onCancel, isNew }) {
    const [formData, setFormData] = useState({
        charName: existingNpc?.charName || "",
        age: existingNpc?.age || 0,
        race: existingNpc?.race || "",
        gender: existingNpc?.gender || "",
        alignment: existingNpc?.alignment || "",
        className: existingNpc?.className || "",
        level: existingNpc?.level || 1,
        size: existingNpc?.size || "Medium",
        speed: existingNpc?.speed || 30,
        quirks: existingNpc?.quirks || "",
        features: existingNpc?.features || "",
        vices: existingNpc?.vices || "",
        virtues: existingNpc?.virtues || "",
        ideals: existingNpc?.ideals || "",
        stats: existingNpc?.stats || {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
        },
        campaignID: existingNpc?.campaignID || campaignID || "",
        parentLocationID: existingNpc?.parentLocationID || parentLocationID || null,
    });
    const statFields = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const { getAccessTokenSilently } = useAuth0();

    const generateNPC = () => {
        const generatedNpc = randGen(); // Generate a random NPC
        setFormData((prevData) => ({
            ...prevData,
            ...generatedNpc, // Overwrite existing fields with the generated NPC
        }));
    };
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (statFields.includes(name)) return; //Cannot be allowed to handle stat block
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleStatChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            stats: { ...prevData.stats, [name]: parseInt(value, 10) || 0 },
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);
    
        // Debug log
        console.log("npcform - formData before:", formData);
    
        try {
            const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
    
            // Clone and sanitize stats
            const sanitizedStats = { ...formData.stats };
    
            for (let stat of statFields) {
                if (typeof sanitizedStats[stat] !== "number" || isNaN(sanitizedStats[stat])) {
                    sanitizedStats[stat] = 10;
                }
            }
    
            const npcPayload = {
                ...formData,
                stats: sanitizedStats,
            };
    
            const endpoint = existingNpc
                ? `http://localhost:5050/npcs/${existingNpc._id}`
                : "http://localhost:5050/npcs";
    
            const method = existingNpc ? "PUT" : "POST";
    
            console.log("npcform - formData to save:", npcPayload);
    
            const response = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(npcPayload),
            });
    
            if (!response.ok) {
                const errText = await response.text(); // Get detailed error from backend
                throw new Error(`Failed to ${existingNpc ? "update" : "create"} NPC: ${errText}`);
            }
    
            const npcData = await response.json();
            console.log("Updated NPC received:", npcData);
            onSave(npcData);
        } catch (error) {
            console.error("Error saving NPC:", error);
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };
    

    return (
        <div className="p-4 border-0 rounded-lg bg-cream shadow-md">
            <h2 className="text-xl font-bold">{existingNpc ? "Edit NPC" : "New NPC"}</h2>
            {error && <p className="bg-light-tan text-red-800">{error}</p>}

            <form onSubmit={handleSave} className="flex flex-col p-4">

                <label className="font-bold text-lg">Name:</label>
                <input
                    type="text"
                    name="charName"
                    value={formData.charName}
                    onChange={handleChange}
                    placeholder="NPC Name"
                    required
                    className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                    hover:shadow-sm hover:shadow-amber-800
                    focus:shadow-sm focus:shadow-amber-600"
                />

                <div className="mt-4 flex space-x-4 align-middle">
                  <div className="flex-1 flex-col">
                    <label className="font-bold">Race:</label>
                    <input
                        type="text"
                        name="race"
                        value={formData.race}
                        onChange={handleChange}
                        placeholder="Elf, human, etc"
                        className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                        hover:shadow-sm hover:shadow-amber-800
                        focus:shadow-sm focus:shadow-amber-600"
                    />
                  </div>

                  <div className="flex-1 flex-col">
                    <label className="font-bold">Age:</label>
                    <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="age"
                        className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                        hover:shadow-sm hover:shadow-amber-800
                        focus:shadow-sm focus:shadow-amber-600"
                    />
                  </div>

                  <div className="flex-1 flex-col">
                    <label className="font-bold">Gender:</label>
                    <input
                        type="text"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        placeholder="Gender"
                        className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                        hover:shadow-sm hover:shadow-amber-800
                        focus:shadow-sm focus:shadow-amber-600"
                    />
                  </div>
                </div>

                <div className="mt-4 flex space-x-4">
                  <div className="flex-1 flex-col">
                    <label className="font-bold">Class:</label>
                    <input
                        type="text"
                        name="className"
                        value={formData.className}
                        onChange={handleChange}
                        placeholder="Class"
                        className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                        hover:shadow-sm hover:shadow-amber-800
                        focus:shadow-sm focus:shadow-amber-600"
                    />
                  </div>

                  <div className="flex-1 flex-col">
                    <label className="font-bold">Alignment:</label>
                    <input
                        type="text"
                        name="alignment"
                        value={formData.alignment}
                        onChange={handleChange}
                        placeholder="Alignment"
                        className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                        hover:shadow-sm hover:shadow-amber-800
                        focus:shadow-sm focus:shadow-amber-600"
                    />
                  </div>

                  <div className="flex-1 flex-col">
                    <label className="font-bold">Level:</label>
                    <input
                        type="number"
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                        hover:shadow-sm hover:shadow-amber-800
                        focus:shadow-sm focus:shadow-amber-600"
                    />
                  </div>
                </div>


                <div className="mt-4 flex space-x-4">
                  <div className="flex-1 flex-col">
                    <label className="font-bold">Size:</label>
                    <input
                        type="text"
                        name="size"
                        value={formData.size}
                        onChange={handleChange}
                        placeholder="Medium, Large, etc"
                        className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                        hover:shadow-sm hover:shadow-amber-800
                        focus:shadow-sm focus:shadow-amber-600"
                    />
                  </div>

                  <div className="flex-1 flex-col">
                    <label className="font-bold">Speed:</label>
                    <input
                        type="number"
                        name="speed"
                        value={formData.speed}
                        onChange={handleChange}
                        className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                        hover:shadow-sm hover:shadow-amber-800
                        focus:shadow-sm focus:shadow-amber-600"
                    />
                  </div>
                </div>

                
                {/* Stats */}
                <h3 className="font-bold text-lg mt-4">Stats</h3>
                    <div className="mt-2 flex space-x-4">
                    {["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].map((stat) => (
                        <div key={stat}>
                            <label className="font-bold">{stat.toUpperCase()}:</label>
                            <input
                                type="number"
                                name={stat}
                                value={formData.stats[stat]}
                                onChange={handleStatChange}
                                className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                                hover:shadow-sm hover:shadow-amber-800
                                focus:shadow-sm focus:shadow-amber-600"
                            />
                        </div>
                    ))}
                    </div>

                <h3 className="font-bold text-lg mt-4">Traits</h3>
                <div className="mt-4 flex space-x-4">
                  <div className="flex-1 flex-col">
                    <label className="font-bold">Quirks:</label>
                    <input
                        type="text"
                        name="quirks"
                        placeholder="Only dances on Tuesday, believes the world is a donut, etc"
                        value={formData.quirks}
                        onChange={handleChange}
                        className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                        hover:shadow-sm hover:shadow-amber-800
                        focus:shadow-sm focus:shadow-amber-600"
                    />
                  </div>

                  <div className="flex-1 flex-col">
                    <label className="font-bold">Features:</label>
                    <input
                        type="text"
                        name="features"
                        placeholder="Tall, Strong, Wears an eyepatch, etc"
                        value={formData.features}
                        onChange={handleChange}
                        className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                        hover:shadow-sm hover:shadow-amber-800
                        focus:shadow-sm focus:shadow-amber-600"
                    />
                  </div>
                </div>

                <div className="mt-4 flex space-x-4">
                  <div className="flex-1 flex-col">
                    <label className="font-bold">Vices:</label>
                    <input
                        type="text"
                        name="vices"
                        placeholder="Lustful, Greedy, etc"
                        value={formData.vices}
                        onChange={handleChange}
                        className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                        hover:shadow-sm hover:shadow-amber-800
                        focus:shadow-sm focus:shadow-amber-600"
                    />
                  </div>

                  <div className="flex-1 flex-col">
                    <label className="font-bold">Virtues:</label>
                    <input
                        type="text"
                        name="virtues"
                        value={formData.virtues}
                        onChange={handleChange}
                        placeholder="Patient, Kind, etc"
                        className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                        hover:shadow-sm hover:shadow-amber-800
                        focus:shadow-sm focus:shadow-amber-600"
                    />
                  </div>

                  <div className="flex-1 flex-col">
                    <label className="font-bold">Ideals:</label>
                    <input
                        type="text"
                        name="ideals"
                        value={formData.ideals}
                        onChange={handleChange}
                        placeholder="Ideals"
                        className="border border-brown p-2 w-full rounded bg-cream placeholder-yellow-700 outline-none 
                        hover:shadow-sm hover:shadow-amber-800
                        focus:shadow-sm focus:shadow-amber-600"
                    />
                  </div>
                </div>

                <div className="flex mt-4 space-x-2">
                    <button type="submit" className={saving ? "bg-tan text-brown px-4 py-2 rounded" : "bg-goblin-green button font-bold text-gold px-4 py-2 rounded"}>
                        {saving ? "Saving..." : "Save"}
                    </button>
                    <button type="button" onClick={onCancel} className="bg-cancel-red button font-bold text-gold px-4 py-2 rounded">
                        Cancel
                    </button>
                    {isNew && (
                        <button type="button" onClick={generateNPC} className="bg-goblin-green button font-bold text-gold px-4 py-2 rounded">
                            Generate
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

NpcForm.propTypes = {
    campaignID: PropTypes.string.isRequired,
    parentLocationID: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
    existingNpc: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isNew: PropTypes.bool.isRequired
};