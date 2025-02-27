import express from "express";
import { getAllNPCs, getNPCsByLocation, getNPCById, addNPC, updateNPC, deleteNPC } from "../models/npcModel.js";
import Joi from "joi";
import { sanitizeInput } from "../utils/sanitization.js";
import { ObjectId } from "mongodb";

const router = express.Router();

//Joi validation schema
const npcSchema = Joi.object({
  campaignID: Joi.string().required(),  // It's a string, like all the other routes
  locationID: Joi.string().required(),          // Required, all NPCs must have a parent location
  // characterID: Joi.number().integer().required(),  //This needs to be the ObjectId, not an int
  charName: Joi.string().required(),
  age: Joi.number().integer().min(0).required(),  // Age should be a positive integer
  race: Joi.string().required(),
  gender: Joi.string().allow(null),
  alignment: Joi.string().required(),
  className: Joi.string().optional(),
  level: Joi.number().integer().optional(),
  stats: Joi.object({
    strength: Joi.number().integer().min(1).max(20).required(),
    dexterity: Joi.number().integer().min(1).max(20).required(),
    constitution: Joi.number().integer().min(1).max(20).required(),
    intelligence: Joi.number().integer().min(1).max(20).required(),
    wisdom: Joi.number().integer().min(1).max(20).required(),
    charisma: Joi.number().integer().min(1).max(20).required()
  }).required(),
  size: Joi.string().valid("Small", "Medium", "Large").required(),
  speed: Joi.number().integer().required(),
  quirks: Joi.string().optional(),
  features: Joi.string().optional(),
  vices: Joi.string().optional(),
  virtues: Joi.string().optional(),
  ideals: Joi.string().optional(),
});


// Validate MongoDB ObjectId
const validateObjectId = (id) => ObjectId.isValid(id);

// Get all NPCs (for testing)
router.get("/", async (req, res) => {
    try {
      const npcs = await getAllNPCs();
      res.json(npcs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch NPCs" });
    }
  });
  
// Get NPCs by locationID
router.get("/location/:locationID", async (req, res) => {
  try {
      const { locationID } = req.params;

      if (!locationID) {
          return res.status(400).json({ error: "Missing locationID parameter" });
      }

      const npcs = await getNPCsByLocation(locationID);

      if (!npcs.length) {
          return res.status(404).json({ error: "No NPCs found for this location" });
      }

      res.json(npcs);
  } catch (error) {
      console.error("Failed to fetch NPCs by locationID:", error);
      res.status(500).json({ error: "Failed to fetch NPCs" });
  }
});


// Get NPC by ID with sanitization and validation
router.get("/:id", async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid NPC ID format" });
    }
    const sanitizedId = sanitizeInput(req.params.id);
    const npc = await getNPCById(sanitizedId);
    if (!npc) return res.status(404).json({ error: "NPC not found" });
    res.json(npc);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch NPC" });
  }
});

// Add a new NPC
router.post("/", async (req, res) => {
  try {
    console.log("Incoming NPC data:", req.body);
    const sanitizedData = sanitizeInput(req.body);
    const { error } = npcSchema.validate(sanitizedData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const result = await addNPC(sanitizedData);
    res.status(201).json(result);
  } catch (error) {
    console.error("Failed to add NPC:", error);
    res.status(500).json({ error: "Failed to add NPC" });
  }
});

// Update an NPC with sanitization and validation
router.put("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      if (!validateObjectId(id)) {
        return res.status(400).json({ error: "Invalid NPC ID format" });
      }
      
      const sanitizedData = sanitizeInput(req.body);
      const { error } = npcSchema.validate(sanitizedData);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
  
      const result = await updateNPC(id, sanitizedData);
      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: "No NPC found to update" });
      }
  
      res.json({ message: "NPC updated successfully", result });
    } catch (error) {
      console.error("Error updating NPC:", error);
      res.status(500).json({ error: "Failed to update NPC" });
    }
  });
  

// Delete an NPC with sanitization and validation
router.delete("/:id", async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid NPC ID format" });
    }
    const sanitizedId = sanitizeInput(req.params.id);
    const result = await deleteNPC(sanitizedId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete NPC" });
  }
});

export default router;