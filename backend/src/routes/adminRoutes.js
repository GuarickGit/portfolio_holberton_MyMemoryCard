// src/routes/adminRoutes.js

import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/adminMiddleware.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

/**
 * Toutes les routes admin sont protégées par :
 * 1. verifyToken → vérifie que l'utilisateur est authentifié (JWT valide)
 * 2. isAdmin → vérifie que l'utilisateur a le role 'admin'
 */

// ==================== STATISTIQUES ====================
// GET /admin/stats - Statistiques globales
router.get('/stats', verifyToken, isAdmin, adminController.getStats);

// ==================== GESTION UTILISATEURS ====================
// GET /admin/users - Liste de tous les utilisateurs (pagination)
router.get('/users', verifyToken, isAdmin, adminController.getUsers);

// GET /admin/users/:id - Détails d'un utilisateur
router.get('/users/:id', verifyToken, isAdmin, adminController.getUserById);

// DELETE /admin/users/:id - Supprimer un utilisateur
router.delete('/users/:id', verifyToken, isAdmin, adminController.deleteUser);

// ==================== MODÉRATION CONTENU ====================
// DELETE /admin/memories/:id - Supprimer un souvenir
router.delete('/memories/:id', verifyToken, isAdmin, adminController.deleteMemory);

// DELETE /admin/reviews/:id - Supprimer une review
router.delete('/reviews/:id', verifyToken, isAdmin, adminController.deleteReview);

// DELETE /admin/comments/:id - Supprimer un commentaire
router.delete('/comments/:id', verifyToken, isAdmin, adminController.deleteComment);

export default router;
