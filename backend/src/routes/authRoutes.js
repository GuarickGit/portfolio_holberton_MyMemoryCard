import express from "express";


import { signup, login, logout } from "../controllers/authController.js";

// Création du router
const router = express.Router();

// Définition des routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
