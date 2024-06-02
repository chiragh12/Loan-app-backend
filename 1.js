import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/adminSchema.js";

// Load environment variables from .env file
dotenv.config();

// Function to connect to the database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

// Function to insert an admin
const insertAdmin = async () => {
  const adminDetails = {
    username: "admin",
    password: "admin",
  };

  try {
    const admin = new Admin(adminDetails);
    await admin.save();
    console.log("Admin created successfully");
  } catch (error) {
    console.error("Error creating admin:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Connect to the database and insert the admin
connectDB().then(insertAdmin);
