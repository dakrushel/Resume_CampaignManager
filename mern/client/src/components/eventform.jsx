import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth0 } from "@auth0/auth0-react";

export default function EventForm({ campaignID, parentLocationID, existingEvent, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: existingEvent?.title || "",
    body: existingEvent?.body || "",
    campaignID: existingEvent?.campaignID || campaignID || "",
    parentLocationID: existingEvent?.parentLocationID || parentLocationID || null,
  });

  const [campaigns, setCampaigns] = useState([]);
  const [parentLocationType, setParentLocationType] = useState("");
  const [parentLocations, setParentLocations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { getAccessTokenSilently } = useAuth0();

  // Fetch campaigns for the dropdown
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
          console.error("Failed to fetch campaigns: ", error);
      }
    }
    fetchCampaigns();
  }, [getAccessTokenSilently]);

  // Fetch parent locations based on campaignID and parentLocationType
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
        console.error("Failed to fetch parent locations:", error);
      }
    }
    fetchParentLocations();
  }, [formData.campaignID, parentLocationType, getAccessTokenSilently]);

  // Update formData if props change
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      campaignID: campaignID || prevData.campaignID,
      parentLocationID: parentLocationID || prevData.parentLocationID,
    }));
  }, [campaignID, parentLocationID]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updated = { ...prevData, [name]: value };
      if (name === "campaignID") {
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
      isEvent: true,
      title: formData.title.trim(),
      body: formData.body.trim(),
    };

    if (!finalFormData.title || !finalFormData.body) {
      setError("Event title and body are required.");
      setSaving(false);
      return;
    }

    try {
      const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
      const response = await fetch(
        existingEvent
          ? `http://localhost:5050/events/${existingEvent._id}`
          : "http://localhost:5050/events",
        {
          method: existingEvent ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(finalFormData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${existingEvent ? "update" : "create"} event`);
      }

      let eventData;
      if (existingEvent) {
        // Fetch updated event data
        const updatedResponse = await fetch(`http://localhost:5050/events/${existingEvent._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!updatedResponse.ok) {
          throw new Error("Failed to fetch updated event data");
        }
        eventData = await updatedResponse.json();
      } else {
        eventData = await response.json();
      }

      if (typeof onSave === "function") {
        onSave(eventData);
      }
    } catch (error) {
      console.error("Error saving event:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 border-0 rounded-lg bg-cream shadow-md shadow-amber-800">
      <h2 className="text-xl font-bold">{existingEvent ? "Edit Event" : "New Event"}</h2>
      {error && <p className="text-red-800">{error}</p>}
      <form onSubmit={handleSave} className="space-y-3">
        <label>Campaign:</label>
        <select
          name="campaignID"
          value={formData.campaignID}
          onChange={handleChange}
          className="border border-brown outline-none p-2 w-full rounded bg-cream hover:cursor-pointer hover:shadow-sm hover:shadow-amber-800"
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
          className="border border-brown outline-none p-2 w-full rounded bg-cream hover:cursor-pointer hover:shadow-sm hover:shadow-amber-800"
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
          className="border border-brown outline-none p-2 w-full rounded bg-cream hover:cursor-pointer hover:shadow-sm hover:shadow-amber-800"
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
          placeholder="Event Title"
          required
          className="border border-brown p-2 w-full rounded bg-cream 
                    placeholder-yellow-700 outline-none 
                    hover:shadow-sm hover:shadow-amber-800
                    focus:shadow-sm focus:shadow-amber-600"
        />
        <textarea
          name="body"
          value={formData.body}
          onChange={handleChange}
          placeholder="Describe the event..."
          required
          className="border border-brown p-2 w-full rounded bg-cream 
                    placeholder-yellow-700 outline-none 
                    hover:shadow-sm hover:shadow-amber-800
                    focus:shadow-sm focus:shadow-amber-600"
        />
        <div className="flex space-x-2">
          <button type="submit" className={saving ? "bg-tan font-bold text-brown px-4 py-2 rounded" : "button font-bold bg-goblin-green text-gold px-4 py-2 rounded hover:shadow-sm hover:shadow-amber-800"}>
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

EventForm.propTypes = {
  campaignID: PropTypes.string.isRequired,
  parentLocationID: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  existingEvent: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
