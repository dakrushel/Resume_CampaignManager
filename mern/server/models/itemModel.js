import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const collectionName = "items";

export const addItem = async (itemData) => {
    try {
        if (!itemData.campaignID || !itemData.parentLocationID || !itemData.itemReference) {
            throw new Error("Item must have a campaignID, parentLocationID, and itemReference.");
        }

        itemData.campaignID = new ObjectId(itemData.campaignID);
        itemData.parentLocationID = new ObjectId(itemData.parentLocationID);

        const result = await db.collection(collectionName).insertOne(itemData);
        return { ...itemData, _id: result.insertedId.toString() };
    } catch (error) {
        console.error("Error adding Item:", error);
        throw error;
    }
};

export const getItemsByLocation = async (parentLocationID) => {
    try {
        return await db.collection(collectionName).find({ parentLocationID: new ObjectId(parentLocationID) }).toArray();
    } catch (error) {
        console.error("Error fetching Items:", error);
        throw error;
    }
};

export const updateItemLocation = async (id, newLocationID) => {
    try {
        const result = await db.collection(collectionName).updateOne(
            { _id: new ObjectId(id) },
            { $set: { parentLocationID: new ObjectId(newLocationID) } }
        );
        return result;
    } catch (error) {
        console.error("Error updating item location:", error);
        throw error;
    }
};

export const deleteItem = async (id) => {
    try {
        return await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
        console.error("Error deleting Item:", error);
        throw error;
    }
};
