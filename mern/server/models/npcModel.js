import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const collectionName = "npcs";

// Get all NPCs (for testing)
export const getAllNPCs = async () => {
  return await db.collection(collectionName).find({}).toArray();
};

// Get NPCs by location
export const getNPCsByLocation = async (locationID) => {
  try {
      return await db.collection("npcs").find({ locationID: String(locationID) }).toArray();
  } catch (error) {
      console.error("Error fetching NPCs by locationID:", error);
      throw error;
  }
};


// Get NPC by ID with ObjectId conversion
export const getNPCById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid NPC ID format");
    }
    return await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("Error fetching NPC by ID:", error);
    throw error;
  }
};

// Add a new NPC
export const addNPC = async (npcData) => {
  try {
    if (!ObjectId.isValid(npcData.characterID)) {
      throw new Error("Invalid character ID format");
    }

    // Ensure campaignID and locationID are strings
    npcData.campaignID = String(npcData.campaignID);
    npcData.locationID = String(npcData.locationID);

    const result = await db.collection(collectionName).insertOne(npcData);
    return result;
  } catch (error) {
    console.error("Error adding NPC:", error);
    throw error;
  }
};

// Update an existing NPC
export const updateNPC = async (id, npcData) => {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid NPC ID format");
      }
  
      // Ensure campaignID and locationID are strings
      npcData.campaignID = String(npcData.campaignID);
      npcData.locationID = String(npcData.locationID);
  
      const result = await db.collection(collectionName).updateOne(
        { _id: new ObjectId(id) },
        { $set: npcData }
      );
  
      return result;
    } catch (error) {
      console.error("Error updating NPC:", error);
      throw error;
    }
  };
  

// Delete an NPC
export const deleteNPC = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid NPC ID format");
    }
    return await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("Error deleting NPC:", error);
    throw error;
  }
};
