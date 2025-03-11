import express from "express";
import Joi from "joi";
import {
  getNpcById,
  getNpcsByLocation,
  getNpcsByCampaign,
  addNpc,
  updateNpc,
  deleteNpc
} from "../models/npcModel.js";
import { sanitizeInput } from "../utils/sanitization.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Joi validation schema for NPCs
const npcSchema = Joi.object({
  campaignID: Joi.string().required(),
  parentLocationID: Joi.string().required(),
  charName: Joi.string().required(),
  age: Joi.string().optional(),
  race: Joi.string().optional(),
  gender: Joi.string().optional(),
  alignment: Joi.string().optional(),
  className: Joi.string().optional(),
  level: Joi.number().optional(),
  size: Joi.string().optional(),
  speed: Joi.number().optional(),
  quirks: Joi.string().optional(),
  features: Joi.string().optional(),
  vices: Joi.string().optional(),
  virtues: Joi.string().optional(),
  ideals: Joi.string().optional(),
  stats: Joi.object({
    strength: Joi.number().optional(),
    dexterity: Joi.number().optional(),
    constitution: Joi.number().optional(),
    intelligence: Joi.number().optional(),
    wisdom: Joi.number().optional(),
    charisma: Joi.number().optional(),
  }).optional(),
});

// Validate MongoDB ObjectId
const validateObjectId = (id) => ObjectId.isValid(id);

// ✅ Get a single NPC by ID
router.get("/:id", async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid NPC ID format" });
    }

    const npc = await getNpcById(req.params.id);
    if (!npc) return res.status(404).json({ error: "NPC not found" });

    res.json(npc);
  } catch (error) {
    console.error("Failed to fetch NPC:", error);
    res.status(500).json({ error: "Failed to fetch NPC" });
  }
});

// ✅ Get all NPCs for a specific location
router.get("/location/:parentLocationID", async (req, res) => {
  try {
    if (!validateObjectId(req.params.parentLocationID)) {
      return res.status(400).json({ error: "Invalid location ID format" });
    }

    const npcs = await getNpcsByLocation(req.params.parentLocationID);
    res.json(npcs);
  } catch (error) {
    console.error("Failed to fetch NPCs for location:", error);
    res.status(500).json({ error: "Failed to fetch NPCs" });
  }
});

// ✅ Add a new NPC
router.post("/", async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = npcSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await addNpc(sanitizedData);
    res.status(201).json(result);
  } catch (error) {
    console.error("Failed to add NPC:", error);
    res.status(500).json({ error: "Failed to add NPC" });
  }
});

// ✅ Update an NPC
router.put("/:id", async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid NPC ID format" });
    }

    const sanitizedData = sanitizeInput(req.body);
    const { error } = npcSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await updateNpc(req.params.id, sanitizedData);
    if (result.modifiedCount === 0) return res.status(404).json({ error: "No NPC found to update" });

    const updatedNpc = await getNpcById(req.params.id);
    if (!updatedNpc) {
      return res.status(404).json({ error: "Updated NPC not found" });
    }
    res.json(updatedNpc);
  } catch (error) {
    console.error("Failed to update NPC:", error);
    res.status(500).json({ error: "Failed to update NPC" });
  }
});

// ✅ Delete an NPC
router.delete("/:id", async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid NPC ID format" });
    }

    const result = await deleteNpc(req.params.id);
    res.json(result);
  } catch (error) {
    console.error("Failed to delete NPC:", error);
    res.status(500).json({ error: "Failed to delete NPC" });
  }
});

export default router;
