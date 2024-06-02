import User from "../models/userSchema.js";

export const addUser = async (req, res) => {
  const { name, phone, cnic, address } = req.body;

  if (!name || !phone || !cnic || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ cnic });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this CNIC already exists",
      });
    }

    // Create new user
    const user = new User({ name, phone, cnic, address });
    await user.save();
    res
      .status(201)
      .send({ success: true, message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Function to get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send({
      success: true,
      users,
      message: "All users fetched Successfully",
    });
  } catch (error) {
    res.status(500).send({ message: "Server error", error: error.message });
  }
};
