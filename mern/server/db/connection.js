// import { MongoClient, ServerApiVersion } from "mongodb";

// const uri = process.env.ATLAS_URI || "";
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// try {
//   // Connect the client to the server
//   await client.connect();
//   // Send a ping to confirm a successful connection
//   await client.db("admin").command({ ping: 1 });
//   console.log(
//    "Pinged your deployment. You successfully connected to MongoDB!"
//   );
// } catch(err) {
//   console.error(err);
// }

// let db = client.db("campaign_manager");

// export default db;

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to config.env in server/
dotenv.config({ path: path.resolve(__dirname, "../config.env") });


import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.ATLAS_URI || "";

if (!uri) {
  console.error("MongoDB connection string is missing. Check your .env file.");
  process.exit(1); // Exit if the connection string is missing
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db; // Declare `db` globally

const connectDB = async () => {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 }); // Ping to verify connection
    console.log("Connected to MongoDB Atlas!");
    db = client.db("campaign_manager"); // Assign the database instance
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if the connection fails
  }
};

// Immediately invoke the connection function
await connectDB();

export default db;
