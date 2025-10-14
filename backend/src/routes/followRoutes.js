import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import * as followController from '../controllers/followController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(verifyToken);

/**
 * POST /follows/:userId
 * Suivre un utilisateur
 */
router.post('/:userId', followController.follow);

/**
 * DELETE /follows/:userId
 * Ne plus suivre un utilisateur
 */
router.delete('/:userId', followController.unfollow);

/**
 * GET /follows/:userId/followers
 * Récupérer les abonnés d'un utilisateur
 */
router.get('/:userId/followers', followController.getFollowers);

/**
 * GET /follows/:userId/following
 * Récupérer les abonnements d'un utilisateur
 */
router.get('/:userId/following', followController.getFollowing);

/**
 * GET /follows/:userId/check
 * Vérifier si on suit un utilisateur
 */
router.get('/:userId/check', followController.checkFollow);

export default router;
