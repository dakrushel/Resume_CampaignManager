import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import db from "./db/connection.js";
import { auth } from "express-oauth2-jwt-bearer"

import characters from "./routes/pcRoute.js";
import npcs from "./routes/npcRoute.js";
import campaigns from "./routes/campaignsRoute.js";
import monsters from "./routes/monsters.js";
import notes from "./routes/notesRoute.js";
import events from "./routes/eventsRoute.js";
import items from "./routes/items.js";
import locations from "./routes/locationsRoute.js";

const PORT = process.env.PORT || 5050;
const app = express();

//Middleware
app.use(helmet({
  //We'll try this for now
  contentSecurityPolicy: false,  // Disable CSP if it's causing issues in development
  crossOriginResourcePolicy: { policy: "cross-origin" },  // Allow resources to load from other domains
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },  // Better referrer security
  xXssProtection: true,  // Prevent reflected XSS attacks  
}));

app.use(cors());
app.use(express.json());

//Rate limiting DoS and Brute Force shield
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 500,   //100 requests per IP per WindowMS was a little to low for development
  handler: (req, res, next) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ error: "Too many requests. Please try again later." });
  },
});

app.use(limiter);

// Configure Auth0 JWT middleware
const checkJWT = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
})

app.use(checkJWT)

app.use("/npcs", npcs);
app.use("/characters", characters);
app.use("/campaigns", campaigns);
app.use("/monsters", monsters);
app.use("/notes", notes);
app.use("/events", events);
app.use("/locations", locations);
app.use("/items", items);

// Test route to verify security headers and rate limiting
// app.get("/test-security", (req, res) => {
//   res.json({
//     message: "Security and rate limiting are active!",
//     headers: req.headers,
//   });
// });

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});