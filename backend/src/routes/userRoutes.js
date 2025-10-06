import express from "express";
import { getMe } from "../controllers/userController.js"
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route protégée : l'utilisateur doit être authentifié
router.get("/me", verifyToken, getMe) // Le middleware s'éxécute AVANT le controller

export default router;
