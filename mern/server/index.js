import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = 5173;
const API_BASE_URL = "https://www.dnd5eapi.co/api";

// Middleware
app.use(cors());
app.use(express.json());

// Route to fetch all races
app.get("/api/races", async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/races`);
    res.json(response.data.results); // Return race list
  } catch (error) {
    res.status(500).json({ message: "Error fetching races" });
  }
});

// Route to fetch a specific race by index
app.get("/api/races/:index", async (req, res) => {
  try {
    const { index } = req.params;
    const response = await axios.get(`${API_BASE_URL}/races/${index}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: `Error fetching race: ${index}` });
  }
});

// Route to fetch all classes
app.get("/api/classes", async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/classes`);
    res.json(response.data.results); // Return class list
  } catch (error) {
    res.status(500).json({ message: "Error fetching classes" });
  }
});

// Route to fetch a specific class by index
app.get("/api/classes/:index", async (req, res) => {
  try {
    const { index } = req.params;
    const response = await axios.get(`${API_BASE_URL}/classes/${index}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: `Error fetching class: ${index}` });
  }
});

// Route to fetch all spells
app.get("/api/spells", async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/spells`);
    res.json(response.data.results); // Return spell list
  } catch (error) {
    res.status(500).json({ message: "Error fetching spells" });
  }
});

// Route to fetch a specific spell by index
app.get("/api/spells/:index", async (req, res) => {
  try {
    const { index } = req.params;
    const response = await axios.get(`${API_BASE_URL}/spells/${index}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: `Error fetching spell: ${index}` });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});