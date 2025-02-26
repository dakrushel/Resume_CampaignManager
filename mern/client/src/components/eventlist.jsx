import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import EventItem from "./eventitem";
import EventForm from "./eventform";
import { useAuth0 } from "@auth0/auth0-react";

export default function EventList({ parentLocationID, campaignID }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { getAccessTokenSilently } = useAuth0();

  const fetchEvents = useCallback(async () => {
    if (!campaignID) {
      setError("Missing campaignID. Cannot fetch events.");
      return;
    }
    setLoading(true);
    try {
      const token = await getAccessTokenSilently({ audience: "https://campaignapi.com" });
      const endpoint = parentLocationID
        ? `http://localhost:5050/events/location/${parentLocationID}`
        : `http://localhost:5050/events/campaign/${campaignID}`;
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error fetching events: ${response.statusText}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid response: Expected an array of events.");
      }
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [campaignID, parentLocationID, getAccessTokenSilently]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSaveEvent = async (savedEvent) => {
    if (!savedEvent || !savedEvent._id) {
      console.error("Invalid savedEvent received:", savedEvent);
      return;
    }
    setEvents((prevEvents) => {
      const eventExists = prevEvents.some((event) => event._id === savedEvent._id);
      return eventExists
        ? prevEvents.map((event) => (event._id === savedEvent._id ? savedEvent : event))
        : [...prevEvents, savedEvent];
    });
    setShowForm(false);
    await fetchEvents();
  };

  const handleUpdateEvent = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => (event._id === updatedEvent._id ? updatedEvent : event))
    );
  };

  const handleDeleteEvent = (deletedEventID) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event._id !== deletedEventID));
  };

  if (loading) return <p className="text-gray-600">Loading events...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-2 bg-yellow-200 rounded-lg">
      {events.length === 0 && !showForm ? (
        <p>No events available. Try creating one!</p>
      ) : (
        events.map((event) => (
          <EventItem
            key={event._id}
            event={event}
            campaignID={campaignID}
            parentLocationID={parentLocationID}
            onEventUpdate={handleUpdateEvent}
            onEventDelete={handleDeleteEvent}
          />
        ))
      )}
      {showForm ? (
        <EventForm
          campaignID={campaignID}
          parentLocationID={parentLocationID}
          onSave={(savedEvent) => {
            if (!savedEvent || !savedEvent._id) {
              console.error("Invalid savedEvent received:", savedEvent);
              return;
            }
            handleSaveEvent(savedEvent);
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button onClick={() => setShowForm(true)} className="bg-green-600 text-white px-4 py-2 rounded mt-4">
          +
        </button>
      )}
    </div>
  );
}

EventList.propTypes = {
  parentLocationID: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  campaignID: PropTypes.string.isRequired,
};
