import express from 'express';
import {
  addGameToCollection,
  getMyCollection,
  updateGameInCollection,
  removeGameFromCollection,
  getGameStatus,
  getPublicCollection
} from '../controllers/collectionController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * Toutes les routes nécessitent d'être authentifié
 * On applique verifyToken à toutes les routes
 */
router.use(verifyToken);

/**
 * GET /collections/game/:rawgId/status
 * Vérifie si le jeu est dans la collection et retourne son status
 */
router.get('/game/:rawgId/status', getGameStatus);

/**
 * GET /collections/user/:userId
 * Récupère la collection publique d'un utilisateur spécifique
 */
router.get('/user/:userId', getPublicCollection);

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
 * PATCH /collections/:rawgId
 * Met à jour un jeu dans la collection (status ou rating)
 * Body: { status, user_rating }
 */
router.patch('/:rawgId', updateGameInCollection);

/**
 * DELETE /collections/:rawgId
 * Supprime un jeu de la collection
 */
router.delete('/:rawgId', removeGameFromCollection);

export default router;
