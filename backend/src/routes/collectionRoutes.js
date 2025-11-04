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
 * ROUTES PUBLIQUES (sans verifyToken)
 */

/**
 * GET /collections/user/:userId
 * Récupère la collection publique d'un utilisateur spécifique
 */
router.get('/user/:userId', getPublicCollection);

/**
 * ROUTES PROTÉGÉES (avec verifyToken)
 */

/**
 * GET /collections/game/:rawgId/status
 * Vérifie si le jeu est dans la collection et retourne son status
 */
router.get('/game/:rawgId/status', verifyToken, getGameStatus);

/**
 * POST /collections
 * Ajoute un jeu à la collection
 * Body: { rawg_id, status, user_rating (optionnel) }
 */
router.post('/', verifyToken, addGameToCollection);

/**
 * GET /collections
 * Récupère la collection complète de l'utilisateur
 */
router.get('/', verifyToken, getMyCollection);

/**
 * PATCH /collections/:rawgId
 * Met à jour un jeu dans la collection (status ou rating)
 * Body: { status, user_rating }
 */
router.patch('/:rawgId', verifyToken, updateGameInCollection);

/**
 * DELETE /collections/:rawgId
 * Supprime un jeu de la collection
 */
router.delete('/:rawgId', verifyToken, removeGameFromCollection);

export default router;
