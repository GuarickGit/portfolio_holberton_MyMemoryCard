import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import * as likeController from '../controllers/likeController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(verifyToken);

/**
 * POST /likes
 * Ajouter un like
 * Body: { targetType, targetId }
 */
router.post('/', likeController.addLike);

/**
 * DELETE /likes
 * Supprimer un like
 * Body: { targetType, targetId }
 */
router.delete('/', likeController.removeLike);

/**
 * GET /likes/:targetType/:targetId
 * Récupérer tous les likes d'une cible
 */
router.get('/:targetType/:targetId', likeController.getLikes);

/**
 * GET /likes/:targetType/:targetId/check
 * Vérifier si l'utilisateur a liké une cible
 */
router.get('/:targetType/:targetId/check', likeController.checkLike);

export default router;
