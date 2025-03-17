import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const collectionName = "monsters";

export const addMonster = async (monsterData) => {
  try {
    if (!monsterData.campaignID || !monsterData.parentLocationID || !monsterData.monsterReference) {
      throw new Error("Monster must have a campaignID, parentLocationID, and monsterReference.");
    }

    monsterData.campaignID = new ObjectId(monsterData.campaignID);
    monsterData.parentLocationID = new ObjectId(monsterData.parentLocationID);

    const result = await db.collection(collectionName).insertOne(monsterData);
    return { ...monsterData, _id: result.insertedId.toString() };
  } catch (error) {
    console.error("Error adding Monster:", error);
    throw error;
  }
};

export const getMonstersByLocation = async (parentLocationID) => {
  try {
    return await db.collection(collectionName).find({ parentLocationID: new ObjectId(parentLocationID) }).toArray();
  } catch (error) {
    console.error("Error fetching Monsters:", error);
    throw error;
  }
};

export const deleteMonster = async (id) => {
  try {
    return await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("Error deleting Monster:", error);
    throw error;
  }
};
