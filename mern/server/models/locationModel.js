import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const collectionName = "locations";

// **Get all locations for a specific campaign (Convert `_id`, `campaignID`, and `parentLocationID` to strings)**
export const getLocationsByCampaign = async (campaignID) => {
  try {
    if (!ObjectId.isValid(campaignID)) {
      throw new Error("Invalid campaign ID format");
    }

    const query = { campaignID: new ObjectId(campaignID) };
    const locations = await db.collection(collectionName).find(query).toArray();

    return locations.map(location => ({
      ...location,
      _id: location._id.toString(),
      campaignID: location.campaignID.toString(),
      parentLocationID: location.parentLocationID ? location.parentLocationID.toString() : null,
    }));
  } catch (error) {
    console.error(`Error fetching locations for campaign ${campaignID}:`, error);
    throw error;
  }
};

// **Get locations by campaignID and locationType**
export const getLocationsByCampaignAndType = async (campaignID, locationType) => {
  try {
    if (!ObjectId.isValid(campaignID)) {
      throw new Error("Invalid campaign ID format");
    }

    const query = { campaignID: new ObjectId(campaignID), locationType };
    const locations = await db.collection(collectionName).find(query).toArray();

    return locations.map(location => ({
      ...location,
      _id: location._id.toString(),
      campaignID: location.campaignID.toString(),
      parentLocationID: location.parentLocationID ? location.parentLocationID.toString() : null,
    }));
  } catch (error) {
    console.error(`Error fetching locations for campaign ${campaignID} of type ${locationType}:`, error);
    throw error;
  }
};

// **Get a location by ID**
export const getLocationById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid location ID format");
    }

    const location = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

    return location
      // ? {
      //     ...location,
      //     _id: location._id.toString(),
      //     campaignID: location.campaignID.toString(),
      //     parentLocationID: location.parentLocationID ? location.parentLocationID.toString() : null,
      //   }
      ? {
        ...location,
        _id: location._id.toString(),
        campaignID: location.campaignID instanceof ObjectId ? location.campaignID.toString() : location.campaignID,
        parentLocationID: location.parentLocationID instanceof ObjectId ? location.parentLocationID.toString() : location.parentLocationID || null,
      }
      : null;
  } catch (error) {
    console.error(`Error fetching location by ID: ${id}`, error);
    throw error;
  }
};

// **Get locations by parentLocationID**
export const getLocationsByParent = async (parentLocationID) => {
  try {
    if (!ObjectId.isValid(parentLocationID)) {
      throw new Error("Invalid parent location ID format");
    }

    const query = { parentLocationID: new ObjectId(parentLocationID) };
    const locations = await db.collection(collectionName).find(query).toArray();

    return locations.map(location => ({
      ...location,
      _id: location._id.toString(),
      campaignID: location.campaignID.toString(),
      parentLocationID: location.parentLocationID ? location.parentLocationID.toString() : null,
    }));
  } catch (error) {
    console.error(`Error fetching locations by parentLocationID: ${parentLocationID}`, error);
    throw error;
  }
};

// **Add a new location**
export const addLocation = async (locationData) => {
  try {
    if (!ObjectId.isValid(locationData.campaignID)) {
      throw new Error("Invalid campaign ID format");
    }

    locationData.campaignID = new ObjectId(locationData.campaignID);

    if (locationData.parentLocationID && ObjectId.isValid(locationData.parentLocationID)) {
      locationData.parentLocationID = new ObjectId(locationData.parentLocationID);
    } else {
      locationData.parentLocationID = null;
    }

    // Only retain children and nestDepth if type is "Site"
    if (locationData.locationType === "Site") {
      locationData.children = Array.isArray(locationData.children) ? locationData.children : [];
      locationData.nestDepth = typeof locationData.nestDepth === "number" ? locationData.nestDepth : 0;
    } else {
      delete locationData.children;
      delete locationData.nestDepth;
    }

    const result = await db.collection(collectionName).insertOne(locationData);

    return {
      ...locationData,
      _id: result.insertedId.toString(),
      campaignID: locationData.campaignID.toString(),
      parentLocationID: locationData.parentLocationID ? locationData.parentLocationID.toString() : null,
    };
  } catch (error) {
    console.error("Error adding location:", error);
    throw error;
  }
};

// **Update a location**
export const updateLocation = async (id, locationData) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid location ID format");
    }

    if (!ObjectId.isValid(locationData.campaignID)) {
      throw new Error("Invalid campaign ID format");
    }

    locationData.campaignID = new ObjectId(locationData.campaignID);

    if (locationData.parentLocationID && ObjectId.isValid(locationData.parentLocationID)) {
      locationData.parentLocationID = new ObjectId(locationData.parentLocationID);
    } else {
      locationData.parentLocationID = null;
    }

    // Enforce schema consistency for Site vs non-Site
    if (locationData.locationType === "Site") {
      locationData.children = Array.isArray(locationData.children) ? locationData.children : [];
      locationData.nestDepth = typeof locationData.nestDepth === "number" ? locationData.nestDepth : 0;
    } else {
      delete locationData.children;
      delete locationData.nestDepth;
    }    

    const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: locationData }
    );

    if (result.matchedCount === 0) {
      throw new Error("No location found to update");
    }

    return { message: "Location updated successfully", result };
  } catch (error) {
    console.error(`Error updating location ID ${id}:`, error);
    throw error;
  }
};

// **Add a child site to a parent site
export const addChildToLocation = async (parentID, childID) => {
  if (!ObjectId.isValid(parentID) || !ObjectId.isValid(childID)) {
    throw new Error("Invalid ID format");
  }

  const result = await db.collection("locations").updateOne(
    { _id: new ObjectId(parentID) },
    { $addToSet: { children: new ObjectId(childID) } }
  );

  if (result.matchedCount === 0) {
    throw new Error("No parent location found");
  }

  return { message: "Child added", result };
};

// **Remove a child site from a parent site
export const removeChildFromLocation = async (parentID, childID) => {
  if (!ObjectId.isValid(parentID) || !ObjectId.isValid(childID)) {
    throw new Error("Invalid ID format");
  }

  const result = await db.collection("locations").updateOne(
    { _id: new ObjectId(parentID) },
    { $pull: { children: new ObjectId(childID) } }
  );

  if (result.matchedCount === 0) {
    throw new Error("No parent location found");
  }

  return { message: "Child removed", result };
};


// **Delete a location**
export const deleteLocation = async (id) => {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid location ID format");
    }

    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new Error("No location found to delete");
    }

    return { message: "Location deleted successfully", result };
  } catch (error) {
    console.error(`Error deleting location ID ${id}:`, error);
    throw error;
  }
};
