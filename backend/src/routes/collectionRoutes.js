// src/routes/collectionRoutes.js

import express from 'express';
import {
  addGameToCollection,
  getMyCollection,
  updateGameInCollection,
  removeGameFromCollection
} from '../controllers/collectionController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * Toutes les routes nécessitent d'être authentifié
 * On applique verifyToken à toutes les routes
 */
router.use(verifyToken);

/**
 * POST /collections
 * Ajoute un jeu à la collection
 * Body: { rawg_id, status, user_rating (optionnel) }
 */
router.post('/', addGameToCollection);

/**
 * GET /collections
 * Récupère la collection complète de l'utilisateur
 */
router.get('/', getMyCollection);

/**
 * PATCH /collections/:gameId
 * Met à jour un jeu dans la collection (status ou rating)
 * Body: { status, user_rating }
 */
router.patch('/:gameId', updateGameInCollection);

/**
 * DELETE /collections/:gameId
 * Supprime un jeu de la collection
 */
router.delete('/:gameId', removeGameFromCollection);

export default router;
