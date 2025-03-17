import express from "express";
import Joi from "joi";
import { addMonster, getMonstersByLocation, deleteMonster } from "../models/monsterModel.js";
import { sanitizeInput } from "../utils/sanitization.js";
// import { ObjectId } from "mongodb";

const router = express.Router();

const monsterSchema = Joi.object({
  _id: Joi.string().required(),
  campaignID: Joi.string().required(),
  parentLocationID: Joi.string().required(),
  monsterReference: Joi.string().required()
})

router.get("/location/:parentLocationID", async (req, res) => {
  try {
    const monsters = await getMonstersByLocation(req.params.parentLocationID);
    res.json(monsters);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch monsters." });
  }
});

router.post("/", async (req, res) => {
  try {
    const sanitizedData = sanitizeInput(req.body);
    const result = await addMonster(sanitizedData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to add monster." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await deleteMonster(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete monster." });
  }
});

export default router;
