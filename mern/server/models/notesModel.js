import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const collectionName = "notes";

// Get a note by ID
export const getNoteById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid note ID format");
    }

    const note = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

    return note ? { ...note, _id: note._id.toString() } : null;
  } catch (error) {
    console.error(`Error fetching note by ID ${id}:`, error);
    throw error;
  }
};

// Get all notes for a specific location
export const getNotesByLocation = async (parentLocationID) => {
  try {
    if (!ObjectId.isValid(parentLocationID)) {
      throw new Error("Invalid location ID format");
    }

    const query = { parentLocationID: new ObjectId(parentLocationID) };
    return await db.collection(collectionName).find(query).toArray();
  } catch (error) {
    console.error(`Error fetching notes for location ${parentLocationID}:`, error);
    throw error;
  }
};

// Get all high-level campaign notes (notes without a parentLocationID)
export const getCampaignNotes = async (campaignID) => {
  try {
    if (!ObjectId.isValid(campaignID)) {
      throw new Error("Invalid campaign ID format");
    }

    const query = { campaignID: new ObjectId(campaignID), parentLocationID: null };
    return await db.collection(collectionName).find(query).toArray();
  } catch (error) {
    console.error(`Error fetching high-level campaign notes for campaign ${campaignID}:`, error);
    throw error;
  }
};

//Get all notes from a campaign - DOES NOT WORK
// export const getAllNotesByCampaign = async (campaignID) => {
//   try {
//     let query = { campaignID };

//     if (ObjectId.isValid(campaignID)) {
//       query = { campaignID: new ObjectId(campaignID) };
//     }

//     return await db.collection(collectionName).find(query).toArray();
//   } catch (error) {
//     console.error(`Error fetching all notes for campaign ${campaignID}:`, error);
//     throw error;
//   }
// };

  


// Add a new note
export const addNote = async (noteData) => {
  try {
    if (!noteData.campaignID || noteData.isEvent === undefined || !noteData.title || !noteData.body) {
      throw new Error("Note must have a campaignID, title, body, and isEvent field.");
    }

    if (ObjectId.isValid(noteData.campaignID)) {
      noteData.campaignID = new ObjectId(noteData.campaignID);
    }

    if (noteData.parentLocationID && ObjectId.isValid(noteData.parentLocationID)) {
      noteData.parentLocationID = new ObjectId(noteData.parentLocationID);
    } else {
      noteData.parentLocationID = null; // Ensure campaign notes have a null parentLocationID
    }

    const result = await db.collection(collectionName).insertOne(noteData);
    return { ...noteData, _id: result.insertedId.toString() };
  } catch (error) {
    console.error("Error adding note:", error);
    throw error;
  }
};

// Update a note
export const updateNote = async (id, noteData) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid note ID format");
    }

    if (noteData.campaignID && ObjectId.isValid(noteData.campaignID)) {
      noteData.campaignID = new ObjectId(noteData.campaignID);
    }

    if (noteData.parentLocationID && ObjectId.isValid(noteData.parentLocationID)) {
      noteData.parentLocationID = new ObjectId(noteData.parentLocationID);
    } else {
      noteData.parentLocationID = null; // Ensure campaign notes have a null parentLocationID
    }

    const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: noteData }
    );

    return result;
  } catch (error) {
    console.error(`Error updating note ID ${id}:`, error);
    throw error;
  }
};

// Delete a note
export const deleteNote = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid note ID format");
    }

    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    console.error(`Error deleting note ID ${id}:`, error);
    throw error;
  }
};
