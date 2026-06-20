import express from "express";
import User from "../models/userModel.js";

const router = express.Router();

// GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await User.find(
      {},
      "_id username email"
    );

    return res.status(200).json(users);
  } catch (error) {
    console.error(
      "Error fetching users:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;