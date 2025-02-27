import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth0 } from "@auth0/auth0-react";

export default function NoteForm({ campaignID, parentLocationID, existingNote, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        title: existingNote?.title || "",
        body: existingNote?.body || "",
        campaignID: existingNote?.campaignID || campaignID || "", // Ensure campaignID is set
        parentLocationID: existingNote?.parentLocationID || parentLocationID || null, // Ensure parentLocationID is set
    });

    const [campaigns, setCampaigns] = useState([]);
    const [parentLocationType, setParentLocationType] = useState("");
    const [parentLocations, setParentLocations] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const { getAccessTokenSilently } = useAuth0();

  // Fetch campaigns for the campaign dropdown
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
                setCampaigns(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch campaigns: ", error);
        }
    }
    fetchCampaigns();
  }, [getAccessTokenSilently]);

  // When campaignID and parentLocationType are set, fetch possible parent locations
  useEffect(() => {
    if (!formData.campaignID || !parentLocationType) {
      setParentLocations([]);
      return;
    }
    async function fetchParentLocations() {
        try {
            const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
            const response = await fetch(`http://localhost:5050/locations/campaign/${formData.campaignID}/type/${parentLocationType}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setParentLocations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch parent locations: ", error);
        }
    }
    fetchParentLocations();
  }, [formData.campaignID, parentLocationType, getAccessTokenSilently]);

    // Update formData when props change
    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            campaignID: campaignID || prevData.campaignID, 
            parentLocationID: parentLocationID || prevData.parentLocationID
        }));
    }, [campaignID, parentLocationID]);

    // console.log("NoteForm - campaignID:", formData.campaignID);
    // console.log("NoteForm - parentLocationID:", formData.parentLocationID);


    // const handleChange = (e) => {
    //     setFormData({ ...formData, [e.target.name]: e.target.value });
    // };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
          const updated = { ...prevData, [name]: value };
          if (name === "campaignID") {
            // Reset parent location selection if campaign changes
            updated.parentLocationID = "";
            setParentLocationType("");
          }
          return updated;
        });
      };

    const handleSave = async (e) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);

        const finalFormData = {
            campaignID: formData.campaignID,
            parentLocationID: formData.parentLocationID,
            isEvent: false,
            title: formData.title.trim(),
            body: formData.body.trim(),
        };

        if (!finalFormData.title || !finalFormData.body) {
            setError("Note body is required.");
            setSaving(false);
            return;
        }

        console.log("Saving note...");
        // console.log("Existing note ID: ", existingNote?._id);  // Debugging
        // console.log("Request payload: ", JSON.stringify(finalFormData, null, 2));

        try {
            const token = await getAccessTokenSilently({ audience: "https://campaignapi.com"});
            const response = await fetch(
                existingNote
                    ? `http://localhost:5050/notes/${existingNote._id}`
                    : "http://localhost:5050/notes",
                {
                    method: existingNote ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                     },
                    body: JSON.stringify(finalFormData),
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to ${existingNote ? "update" : "create"} note`);
            }

            // const apiResponse = await response.json();
            // console.log("Note saved successfully:", apiResponse);

            let noteData;
            if (existingNote) {
                //Now fetch the updated note to ensure the correct data is passed
                const updatedNoteResponse = await fetch(`http://localhost:5050/notes/${existingNote?._id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!updatedNoteResponse.ok) {
                    throw new Error("Failed to fetch updated note data");
                }
                noteData = await updatedNoteResponse.json();
            } else {
                //For new notes, use the response data directly
                noteData = await response.json();
            }



            if (typeof onSave === "function") {
                // console.log("Calling onSave with: ", updatedNote);
                onSave(noteData);
            } else {
                // console.error("Error: onSave is not a function")
            }
            // onSave(savedNote);
        } catch (error) {
            console.error("Error in handleSave: ", error);
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-white shadow-md">
            <h2 className="text-xl font-bold">{existingNote ? "Edit Note" : "New Note"}</h2>
            {error && <p className="text-red-500">{error}</p>}

            <form onSubmit={handleSave} className="space-y-3">
            <label>Campaign:</label>
                <select
                  name="campaignID"
                  value={formData.campaignID}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                >
                  <option value="">Select a Campaign</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign._id} value={campaign._id}>
                      {campaign.title}
                    </option>
                  ))}
                </select>
                <label>Parent Location Type:</label>
                <select
                  name="parentLocationType"
                  value={parentLocationType}
                  onChange={(e) => setParentLocationType(e.target.value)}
                  className="border p-2 w-full rounded"
                >
                  <option value="">Select a Location Type</option>
                  <option value="Plane">Plane</option>
                  <option value="Realm">Realm</option>
                  <option value="Country">Country</option>
                  <option value="Region">Region</option>
                  <option value="Site">Site</option>
                </select>
                <label>Parent Location:</label>
                <select
                  name="parentLocationID"
                  value={formData.parentLocationID}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                >
                  <option value="">Select a Parent Location</option>
                  {parentLocations.map((location) => (
                    <option key={location._id} value={location._id}>
                      {location.name}
                    </option>
                  ))}
                </select>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Note Title"
                    required
                    className="border p-2 w-full rounded"
                />
                <textarea
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    placeholder="Write your note here..."
                    required
                    className="border p-2 w-full rounded"
                />

                <div className="flex space-x-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
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

NoteForm.propTypes = {
    campaignID: PropTypes.string.isRequired,
    parentLocationID: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
    existingNote: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};