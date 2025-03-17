import express from "express";
import Joi from "joi";
import { addItem, getItemsByLocation, deleteItem } from "../models/itemModel.js";
import { sanitizeInput } from "../utils/sanitization.js";

const router = express.Router();

const itemSchema = Joi.object({
  _id: Joi.string().required(),
  campaignID: Joi.string().required(),
  parentLocationID: Joi.string().required(),
  itemReference: Joi.string().required()
});

router.get("/location/:parentLocationID", async (req, res) => {
    try {
        const items = await getItemsByLocation(req.params.parentLocationID);
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch items." });
    }
});

router.post("/", async (req, res) => {
    try {
        const sanitizedData = sanitizeInput(req.body);
        const result = await addItem(sanitizedData);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to add item." });
    }
});

router.put("/:id/location", async (req, res) => {
  try {
      const { error } = Joi.object({
          newLocationID: Joi.string().required()
      }).validate(req.body);

      if (error) return res.status(400).json({ error: error.details[0].message });

      const result = await updateItemLocation(req.params.id, req.body.newLocationID);
      res.json(result);
  } catch (error) {
      res.status(500).json({ error: "Failed to update item location." });
  }
});

router.delete("/:id", async (req, res) => {
    try {
        const result = await deleteItem(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to delete item." });
    }
});

export default router;
