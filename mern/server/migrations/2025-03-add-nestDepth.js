// Migration: Adds children and nestDepth to Site locations
// Safe to re-run; only updates if fields are missing

// Run in any terminal open in mern/server with:
//      node migrations/2025-03-add-nestDepth.js

import db from "../db/connection.js";

const fixSites = async () => {
  try {
    const locations = db.collection("locations");

    const result = await locations.updateMany(
      {
        locationType: "Site",
        $or: [
          { children: { $exists: false } },
          { nestDepth: { $exists: false } },
        ],
      },
      {
        $set: {
          children: [],
          nestDepth: 0,
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} Site locations.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to update Sites:", err);
    process.exit(1);
  }
};

fixSites();
