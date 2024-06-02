import express from "express";
import { addUser, getAllUsers } from "../controllers/userController.js";

const router = express.Router();

// Route to create a new user
router.post("/register", addUser);

// Route to get all users
router.get("/getallusers", getAllUsers);

export default router;
