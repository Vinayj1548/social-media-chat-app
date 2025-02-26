import User from "../models/userModel.js";
import express from "express"

const router = express.Router()

router.get("/users" , async (req , res)=>{
    try {
        const users = await User.find({}, "id username email"); // Fetch selected fields
        return res.status(200).json(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: "Server error" }); // Use `return` to stop execution
      }
})

export default router;