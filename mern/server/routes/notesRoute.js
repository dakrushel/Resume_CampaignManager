import express from "express";
import Joi from "joi";
import { getNoteById, getNotesByLocation, getCampaignNotes, addNote, updateNote, deleteNote } from "../models/notesModel.js";
import { sanitizeInput } from "../utils/sanitization.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Joi validation schema for notes
const noteSchema = Joi.object({
  campaignID: Joi.string().required(),
  parentLocationID: Joi.string().allow(null),
  isEvent: Joi.boolean().required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
});

// Validate MongoDB ObjectId
const validateObjectId = (id) => ObjectId.isValid(id);

// Get a single note by ID
router.get("/:id", async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid note ID format" });
    }

    const note = await getNoteById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch note" });
  }
});

// Get all notes for a specific location
router.get("/location/:parentLocationID", async (req, res) => {
  try {
    if (!validateObjectId(req.params.parentLocationID)) {
      return res.status(400).json({ error: "Invalid location ID format" });
    }

    const notes = await getNotesByLocation(req.params.parentLocationID);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes for location" });
  }
});

// Get all high-level campaign notes (notes without a parentLocationID)
router.get("/campaign/:campaignID", async (req, res) => {
  try {
    if (!validateObjectId(req.params.campaignID)) {
      return res.status(400).json({ error: "Invalid campaign ID format" });
    }

    const notes = await getCampaignNotes(req.params.campaignID);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch high-level campaign notes" });
  }
});

//Get all notes for a campaign - DOES NOT WORK
// router.get("/campaign/:campaignID/all", async (req, res) => {
//   try {
//     if (!validateObjectId(req.params.campaignID)) {
//       return res.status(400).json({ error: "Invalid campaign ID format" });
//     }

//     const notes = await getAllNotesByCampaign(req.params.campaignID);
//     res.json(notes);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch all campaign notes" });
//   }
// });


// Add a new note
router.post("/", async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = noteSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await addNote(sanitizedData);
    res.status(201).json(result);
  } catch (error) {
    console.error("Failed to add note:", error);
    res.status(500).json({ error: "Failed to add note" });
  }
});

// Update a note
router.put("/:id", async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid note ID format" });
    }

    const sanitizedData = sanitizeInput(req.body);
    const { error } = noteSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await updateNote(req.params.id, sanitizedData);
    if (result.modifiedCount === 0) return res.status(404).json({ error: "No note found to update" });

    res.json({ message: "Note updated successfully", result });
  } catch (error) {
    res.status(500).json({ error: "Failed to update note" });
  }
});

// Delete a note
router.delete("/:id", async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid note ID format" });
    }

    const result = await deleteNote(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
