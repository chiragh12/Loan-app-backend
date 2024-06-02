import express from "express";
import { loginAdmin } from "../controllers/loginController.js";

const router = express.Router();

// Route to handle admin login
router.post("/login", loginAdmin);

export default router;
