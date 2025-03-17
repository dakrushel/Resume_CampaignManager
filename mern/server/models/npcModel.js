import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const collectionName = "npcs";

// Validate MongoDB ObjectId
const validateObjectId = (id) => ObjectId.isValid(id);

// Get NPC by ID
export const getNpcById = async (id) => {
  try {
    if (!validateObjectId(id)) {
      throw new Error("Invalid NPC ID format");
    }

    const npc = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

    return npc ? { ...npc, _id: npc._id.toString() } : null;
  } catch (error) {
    console.error(`Error fetching NPC by ID ${id}:`, error);
    throw error;
  }
};

// Get all NPCs for a specific location
export const getNpcsByLocation = async (parentLocationID) => {
  try {
    if (!validateObjectId(parentLocationID)) {
      throw new Error("Invalid location ID format");
    }

    const query = { parentLocationID: new ObjectId(parentLocationID) };
    return await db.collection(collectionName).find(query).toArray();
  } catch (error) {
    console.error(`Error fetching NPCs for location ${parentLocationID}:`, error);
    throw error;
  }
};

// Get all NPCs for a campaign
export const getNpcsByCampaign = async (campaignID) => {
  try {
    if (!validateObjectId(campaignID)) {
      throw new Error("Invalid campaign ID format");
    }

    const query = { campaignID: new ObjectId(campaignID) };
    return await db.collection(collectionName).find(query).toArray();
  } catch (error) {
    console.error(`Error fetching NPCs for campaign ${campaignID}:`, error);
    throw error;
  }
};

// Add a new NPC
export const addNpc = async (npcData) => {
  try {
    if (!npcData.campaignID || !npcData.parentLocationID || !npcData.charName) {
      throw new Error("NPC must have a campaignID, parentLocationID, and charName.");
    }

    if (ObjectId.isValid(npcData.campaignID)) {
      npcData.campaignID = new ObjectId(npcData.campaignID);
    }

    if (ObjectId.isValid(npcData.parentLocationID)) {
      npcData.parentLocationID = new ObjectId(npcData.parentLocationID);
    }

    const result = await db.collection(collectionName).insertOne(npcData);
    return { ...npcData, _id: result.insertedId.toString() };
  } catch (error) {
    console.error("Error adding NPC:", error);
    throw error;
  }
};

// Update an NPC
export const updateNpc = async (id, npcData) => {
  try {
    if (!validateObjectId(id)) {
      throw new Error("Invalid NPC ID format");
    }

    if (npcData.campaignID && ObjectId.isValid(npcData.campaignID)) {
      npcData.campaignID = new ObjectId(npcData.campaignID);
    }

    if (npcData.parentLocationID && ObjectId.isValid(npcData.parentLocationID)) {
      npcData.parentLocationID = new ObjectId(npcData.parentLocationID);
    }

    const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: npcData }
    );

    return result;
  } catch (error) {
    console.error(`Error updating NPC ID ${id}:`, error);
    throw error;
  }
};

// Delete an NPC
export const deleteNpc = async (id) => {
  try {
    if (!validateObjectId(id)) {
      throw new Error("Invalid NPC ID format");
    }

    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    console.error(`Error deleting NPC ID ${id}:`, error);
    throw error;
  }
};
