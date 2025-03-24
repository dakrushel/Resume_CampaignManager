// Migration: removes (undoes) children and nestDepth to Site locations
// Safe to re-run; only updates if fields are missing

import db from "../db/connection.js";

const undoFixSites = async () => {
  try {
    const locations = db.collection("locations");

    const result = await locations.updateMany(
      { locationType: "Site" },
      {
        $unset: { children: "", nestDepth: "" }
        //Even though they get set as children: [] and nestDepth: 0
        //The value here doesn't matter but empty string are MongoDB
        //Convention (so says ChatGPT)
      }
    );

    console.log(`🔄 Rolled back ${result.modifiedCount} Site locations.`);
    process.exit(0);
  } catch (err) {
    console.error("Rollback failed:", err);
    process.exit(1);
  }
};

undoFixSites();
