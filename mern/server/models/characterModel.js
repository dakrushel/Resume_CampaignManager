import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const collectionName = "characters";

// Get all characters
export const getAllCharacters = async () => {
  return await db.collection(collectionName).find({}).toArray();
};

// Get character by ID
export const getCharacterById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid Character ID format");
    }
    return await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("Error fetching character by ID:", error);
    throw error;
  }
};

// Get characters by campaign ID
export const getCharactersByCampaignID = async (campaignID) => {
    try {
      return await db.collection(collectionName).find({ campaignID: String(campaignID) }).toArray();
    } catch (error) {
      console.error("Error fetching characters by campaignID:", error);
      throw error;
    }
  };

// Add a new character
export const addCharacter = async (characterData) => {
    try {
      if (!characterData.campaignID) {
        throw new Error("campaignID is required for characters");
      }
      characterData.campaignID = String(characterData.campaignID); // Ensure campaignID is a string
  
      const result = await db.collection(collectionName).insertOne(characterData);
      return result;
    } catch (error) {
      console.error("Error adding character:", error);
      throw error;
    }
  };

// Update an existing character
export const updateCharacter = async (id, characterData) => {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid Character ID format");
      }
      if (!characterData.campaignID) {
        throw new Error("campaignID is required for characters");
      }
      
      characterData.campaignID = String(characterData.campaignID); // Ensure campaignID is a string
  
      const result = await db.collection(collectionName).updateOne(
        { _id: new ObjectId(id) },
        { $set: characterData }
      );
  
      return result;
    } catch (error) {
      console.error("Error updating character:", error);
      throw error;
    }
  };

// Delete a character
export const deleteCharacter = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid Character ID format");
    }
    return await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("Error deleting character:", error);
    throw error;
  }
};
