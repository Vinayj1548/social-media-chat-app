import express from "express";
import { registerUser, loginUser, logoutUser , deleteUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.delete("/delete", deleteUser);


export default router;
