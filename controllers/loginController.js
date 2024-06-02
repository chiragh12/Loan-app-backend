import Admin from "../models/adminSchema.js";
import jwt from "jsonwebtoken";

// Function to handle admin login
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res
        .status(404)
        .send({ success: false, message: "Admin not found" });
    }

    if (admin.password !== password) {
      return res
        .status(401)
        .send({ success: false, message: "Incorrect password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d", // Token expires in 7days
      }
    );

    res.status(200).send({ success: true, token, admin });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).send({ success: false, message: "Server error" });
  }
};
