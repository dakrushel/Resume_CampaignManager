import express from "express";
import { getAllCharacters, getCharacterById, getCharactersByCampaignID, addCharacter, updateCharacter, deleteCharacter } from "../models/characterModel.js";
import Joi from "joi";
import { sanitizeInput } from "../utils/sanitization.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Joi validation schema
const characterSchema = Joi.object({
  campaignID: Joi.string().required(),
  name: Joi.string().required(),
  alignment: Joi.string().required(),
  race: Joi.string().required(),
  class: Joi.string().required(),
  speed: Joi.number().required(),
  hitDice: Joi.string().required(),
  proficiencies: Joi.array().items(Joi.string()),
  stats: Joi.object({
    strength: Joi.number().min(1).max(30).required(),
    dexterity: Joi.number().min(1).max(30).required(),
    constitution: Joi.number().min(1).max(30).required(),
    intelligence: Joi.number().min(1).max(30).required(),
    wisdom: Joi.number().min(1).max(30).required(),
    charisma: Joi.number().min(1).max(30).required(),
  }).required(),
  size: Joi.string().required(),
  size_description: Joi.string().optional(),
  languages: Joi.array().items(Joi.string()),
  language_desc: Joi.string().optional(),
  traits: Joi.array().items(Joi.string()),
  startingProficiencies: Joi.array().items(Joi.string()),
  classProficiencies: Joi.array().items(Joi.string()),
  level: Joi.number().required(),
  classFeatures: Joi.array().items(
    Joi.object({
      index: Joi.string().required(),
      name: Joi.string().required(),
      url: Joi.string().optional(),
      level: Joi.number().optional()
    })
  ).optional(),
  selectedSpells: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      level: Joi.number().required(),
      school: Joi.string().required(),
      desc: Joi.string().optional(),
    })
  ),
  spellSlots: Joi.object().pattern(
    Joi.string().pattern(/^level_\d+$/),
    Joi.number().integer().min(0)
  ).optional(),
  usedSlots: Joi.object().pattern(
    Joi.string().pattern(/^level_\d+$/),
    Joi.number().integer().min(0)
  ).optional(),
});

// Validate MongoDB ObjectId
const validateObjectId = (id) => ObjectId.isValid(id);

// Get all characters
router.get("/", async (req, res) => {
  try {
    const characters = await getAllCharacters();
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch characters" });
  }
});

// Get character by ID
router.get("/:id", async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid Character ID format" });
    }
    const sanitizedId = sanitizeInput(req.params.id);
    const character = await getCharacterById(sanitizedId);
    if (!character) return res.status(404).json({ error: "Character not found" });
    res.json(character);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch character" });
  }
});

// Get characters by campaign ID
router.get("/campaign/:campaignID", async (req, res) => {
    try {
      const { campaignID } = req.params;
      if (!campaignID) {
        return res.status(400).json({ error: "Missing campaignID parameter" });
      }
  
      const characters = await getCharactersByCampaignID(campaignID);
      if (!characters.length) {
        return res.status(404).json({ error: "No characters found for this campaign" });
      }
  
      res.json(characters);
    } catch (error) {
      console.error("Failed to fetch characters by campaignID:", error);
      res.status(500).json({ error: "Failed to fetch characters" });
    }
  });

// Add a new character
router.post("/", async (req, res) => {
  try {
    console.log("Incoming character data:", req.body);
    
    const sanitizedData = sanitizeInput(req.body);
    const { error } = characterSchema.validate(sanitizedData);
    
    if (error) {
      console.error("Validation error details:", error.details);
      return res.status(400).json({ 
        error: "Validation failed",
        message: error.details[0].message,
        details: error.details 
      });
    }

    const result = await addCharacter(sanitizedData);
    res.status(201).json(result);
  } catch (error) {
    console.error("Failed to add character:", error);
    res.status(500).json({ 
      error: "Failed to add character",
      message: error.message 
    });
  }
});
  

// Update a character
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!validateObjectId(id)) {
      return res.status(400).json({ error: "Invalid Character ID format" });
    }

    const sanitizedData = sanitizeInput(req.body);
    const { error } = characterSchema.validate(sanitizedData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await updateCharacter(id, sanitizedData);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "No character found to update" });
    }

    res.json({ message: "Character updated successfully", result });
  } catch (error) {
    console.error("Error updating character:", error);
    res.status(500).json({ error: "Failed to update character" });
  }
});

// Delete a character
router.delete("/:id", async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid Character ID format" });
    }
    const sanitizedId = sanitizeInput(req.params.id);
    const result = await deleteCharacter(sanitizedId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete character" });
  }
});

export default router;
