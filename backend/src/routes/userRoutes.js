import express from "express";
import { getMe, updateMe, getUserProfile } from "../controllers/userController.js"
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * GET /users/me
 * Récupère le profil de l'utilisateur connecté
 */
router.get("/me", verifyToken, getMe);

/**
 * PUT /users/me
 * Met à jour le profil de l'utilisateur connecté
 */
router.put("/me", verifyToken, updateMe);

/**
 * GET /users/:userId
 * Récupère le profil public d'un utilisateur
 */
router.get("/:userId", verifyToken, getUserProfile);

export default router;
