import express from "express";
import Joi from "joi";
import db from "../db/connection.js";
import { getLocationsByCampaign, getLocationById, getLocationsByParent, addLocation, updateLocation, addChildToLocation, removeChildFromLocation, deleteLocation } from "../models/locationModel.js";
import { sanitizeInput } from "../utils/sanitization.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// **Joi validation schema for locations (Ensure ObjectId validation)**
const locationSchema = Joi.object({
  campaignID: Joi.string()
    .custom((value, helpers) => {
      if (!ObjectId.isValid(value)) return helpers.error("any.invalid");
      return value;
    })
    .required(),

  parentLocationID: Joi.string()
    .allow(null, "")
    .custom((value, helpers) => {
      if (value && !ObjectId.isValid(value)) return helpers.error("any.invalid");
      return value;
    })
    .optional(),

  locationType: Joi.string().valid("Plane", "Realm", "Country", "Region", "Site").required(),
  name: Joi.string().required(),
  description: Joi.string().optional(),

  children: Joi.when("locationType", {
    is: "Site",
    then: Joi.array().items(Joi.string()).required(), // You can change to Joi.object() if needed
    otherwise: Joi.forbidden()
  }),

  nestDepth: Joi.when("locationType", {
    is: "Site",
    then: Joi.number().integer().min(0).required(),
    otherwise: Joi.forbidden()
  }),
});

// **Validate MongoDB ObjectId (Used for incoming IDs)**
const validateObjectId = (id) => ObjectId.isValid(id);

// **GET all locations for a specific campaign**
router.get("/campaign/:campaignID", async (req, res) => {
  try {
    if (!validateObjectId(req.params.campaignID)) {
      return res.status(400).json({ error: "Invalid campaign ID format" });
    }

    const campaignID = new ObjectId(req.params.campaignID);
    const locations = await getLocationsByCampaign(campaignID);
    res.json(locations);
  } catch (error) {
    console.error("Failed to fetch locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// **GET multiple locations for black magic
router.get("/many", async (req, res) => {
  try {
    const ids = req.query.ids;
    if (!ids || ids.length === 0) {
      return res.status(400).json({ error: "No IDs provided" });
    }

    const parsedIDs = Array.isArray(ids) ? ids : [ids];
    const objectIDs = parsedIDs.map(id => new ObjectId(id));
    const children = await db.collection("locations").find({ _id: { $in: objectIDs } }).toArray();
    
    res.json(children);
  } catch (error) {
    console.error("Failed to fetch multiple locations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// **GET locations by campaignID and locationType**
router.get("/campaign/:campaignID/type/:locationType", async (req, res) => {
  try {
      const { campaignID, locationType } = req.params;

      // Validate locationType to avoid invalid queries
      const validTypes = ["Plane", "Realm", "Country", "Region", "Site"];
      if (!validTypes.includes(locationType)) {
          return res.status(400).json({ error: "Invalid location type." });
      }

      const query = {
          campaignID: ObjectId.isValid(campaignID) ? new ObjectId(campaignID) : campaignID,
          locationType: locationType,  // Ensuring we filter by locationType
      };

      const locations = await db.collection("locations").find(query).toArray();

      // Convert ObjectId to string before sending the response
      res.json(locations.map(loc => ({ ...loc, _id: loc._id.toString() })));
  } catch (error) {
      console.error("Failed to fetch locations:", error);
      res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// **GET a single location by ID**
router.get("/:id", async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid location ID format" });
    }

    const location = await getLocationById(new ObjectId(req.params.id));
    if (!location) return res.status(404).json({ error: "Location not found" });

    res.json(location);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch location" });
  }
});

// **GET locations by parentLocationID (for nested locations)**
router.get("/parent/:parentLocationID", async (req, res) => {
  try {
    if (!validateObjectId(req.params.parentLocationID)) {
      return res.status(400).json({ error: "Invalid parent location ID format" });
    }

    const parentLocationID = new ObjectId(req.params.parentLocationID);
    const locations = await getLocationsByParent(parentLocationID);
    res.json(locations);
  } catch (error) {
    console.error("Failed to fetch nested locations:", error);
    res.status(500).json({ error: "Failed to fetch nested locations" });
  }
});

// **POST: Add a new location**
router.post("/", async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);

    // Validate using Joi (Ensures `campaignID` and `parentLocationID` are ObjectId strings)
    const { error } = locationSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: "Invalid location data." });

    sanitizedData.campaignID = new ObjectId(sanitizedData.campaignID);

    if (sanitizedData.parentLocationID) {
      sanitizedData.parentLocationID = new ObjectId(sanitizedData.parentLocationID);
    }

    const result = await addLocation(sanitizedData);
    res.status(201).json(result);
  } catch (error) {
    console.error("Failed to add location:", error);
    res.status(500).json({ error: "Failed to add location" });
  }
});

// **PUT: Update a location**
router.put("/:id", async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid location ID format" });
    }

    const sanitizedData = sanitizeInput(req.body);

    // Validate using Joi
    const { error } = locationSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: "Invalid location data." });

    sanitizedData.campaignID = new ObjectId(sanitizedData.campaignID);

    if (sanitizedData.parentLocationID) {
      sanitizedData.parentLocationID = new ObjectId(sanitizedData.parentLocationID);
    }

    const result = await updateLocation(new ObjectId(req.params.id), sanitizedData);
    if (result.modifiedCount === 0) return res.status(404).json({ error: "No location found to update" });

    res.json({ message: "Location updated successfully", result });
  } catch (error) {
    console.error("Failed to update location:", error);
    res.status(500).json({ error: "Failed to update location" });
  }
});

// **PATCH to add Site ID to parent Site**
router.patch("/:id/add-child", async (req, res) => {
  try {
    const parentID = req.params.id;
    const { childID } = req.body;

    if (!childID) {
      return res.status(400).json({ error: "Missing childID in request body" });
    }

    const result = await addChildToLocation(parentID, childID);
    res.json(result);
  } catch (error) {
    console.error("Failed to add child:", error);
    res.status(500).json({ error: error.message });
  }
});

// **PATCH to remove a Site ID from a parent Site**
router.patch("/:id/remove-child", async (req, res) => {
  try {
    const parentID = req.params.id;
    const { childID } = req.body;

    if (!childID) {
      return res.status(400).json({ error: "Missing childID in request body" });
    }

    const result = await removeChildFromLocation(parentID, childID);
    res.json(result);
  } catch (error) {
    console.error("Failed to remove child:", error);
    res.status(500).json({ error: error.message });
  }
});


// **DELETE: Remove a location**
router.delete("/:id", async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid location ID format" });
    }

    const result = await deleteLocation(new ObjectId(req.params.id));
    res.json(result);
  } catch (error) {
    console.error("Failed to delete location:", error);
    res.status(500).json({ error: "Failed to delete location" });
  }
});

export default router;
