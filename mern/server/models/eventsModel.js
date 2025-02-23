import db from "../db/connection.js";
import { ObjectId } from "mongodb";

// const collectionName = "notes";
const collectionName = "events";

// Get all events for a specific location
export const getEventsByLocation = async (parentLocationID) => {
  try {
    if (!ObjectId.isValid(parentLocationID)) {
      throw new Error("Invalid location ID format");
    }

    const query = { parentLocationID: new ObjectId(parentLocationID), isEvent: true };
    return await db.collection(collectionName).find(query).toArray();
  } catch (error) {
    console.error(`Error fetching events for campaign ${parentLocationID}:`, error);
    throw error;
  }
};

// Get event by ID
export const getEventById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid event ID format");
    }

    const event = await db.collection(collectionName).findOne({
      _id: new ObjectId(id),
      isEvent: true,
    });

    return event ? { ...event, _id: event._id.toString() } : null;
  } catch (error) {
    console.error(`Error fetching event by ID ${id}:`, error);
    throw error;
  }
};

// Add a new event
export const addEvent = async (eventData) => {
  try {
    if (!eventData.campaignID || !eventData.title || !eventData.body) {
      throw new Error("Event must have a campaignID, title, and body");
    }

    eventData.isEvent = true; // Ensure it's always an event

    if (ObjectId.isValid(eventData.campaignID)) {
      eventData.campaignID = new ObjectId(eventData.campaignID);
    }

    if (eventData.parentLocationID && ObjectId.isValid(eventData.parentLocationID)) {
      eventData.parentLocationID = new ObjectId(eventData.parentLocationID);
    } else {
      eventData.parentLocationID = null;
    }

    const result = await db.collection(collectionName).insertOne(eventData);
    return { ...eventData, _id: result.insertedId.toString() };
  } catch (error) {
    console.error("Error adding event:", error);
    throw error;
  }
};

// Update an event
export const updateEvent = async (id, eventData) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid event ID format");
    }

    if (eventData.campaignID && ObjectId.isValid(eventData.campaignID)) {
      eventData.campaignID = new ObjectId(eventData.campaignID);
    }

    if (eventData.parentLocationID && ObjectId.isValid(eventData.parentLocationID)) {
      eventData.parentLocationID = new ObjectId(eventData.parentLocationID);
    } else {
      eventData.parentLocationID = null;
    }

    eventData.isEvent = true; // Ensure it's still an event

    const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id), isEvent: true },
      { $set: eventData }
    );

    return result;
  } catch (error) {
    console.error(`Error updating event ID ${id}:`, error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid event ID format");
    }

    const result = await db.collection(collectionName).deleteOne({
      _id: new ObjectId(id),
      isEvent: true,
    });

    return result;
  } catch (error) {
    console.error(`Error deleting event ID ${id}:`, error);
    throw error;
  }
};
