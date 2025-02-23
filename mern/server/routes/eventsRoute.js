import express from "express";
import Joi from "joi";
import { getEventsByLocation, getEventById, addEvent, updateEvent, deleteEvent } from "../models/eventsModel.js";
import { sanitizeInput } from "../utils/sanitization.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Joi validation schema for events
const eventSchema = Joi.object({
  campaignID: Joi.string().required(),
  parentLocationID: Joi.string().required(),
  isEvent: Joi.boolean().required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
});

// Validate MongoDB ObjectId
const validateObjectId = (id) => ObjectId.isValid(id);

// Get a single event by ID
router.get("/:id", async (req, res) => {
    try {
      if (!validateObjectId(req.params.id)) {
        return res.status(400).json({ error: "Invalid event ID format" });
      }
  
      const event = await getEventById(req.params.id);
      if (!event) return res.status(404).json({ error: "Event not found" });
  
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

// Get all events for a location
router.get("/location/:parentLocationID", async (req, res) => {
  try {
    if (!validateObjectId(req.params.parentLocationID)) {
      return res.status(400).json({ error: "Invalid location ID format" });
    }

    const events = await getEventsByLocation(req.params.parentLocationID);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Add a new event
router.post("/", async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const { error } = eventSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await addEvent(sanitizedData);
    res.status(201).json(result);
  } catch (error) {
    console.error("Failed to add event:", error);
    res.status(500).json({ error: "Failed to add event" });
  }
});

// Update an event
router.put("/:id", async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid event ID format" });
    }

    const sanitizedData = sanitizeInput(req.body);
    const { error } = eventSchema.validate(sanitizedData);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await updateEvent(req.params.id, sanitizedData);
    if (result.modifiedCount === 0) return res.status(404).json({ error: "No event found to update" });

    res.json({ message: "Event updated successfully", result });
  } catch (error) {
    res.status(500).json({ error: "Failed to update event" });
  }
});

// Delete an event
router.delete("/:id", async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid event ID format" });
    }

    const result = await deleteEvent(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
