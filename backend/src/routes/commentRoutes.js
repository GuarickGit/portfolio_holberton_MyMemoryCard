import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import * as commentController from '../controllers/commentController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(verifyToken);

/**
 * POST /comments
 * Créer un commentaire
 * Body: { targetType, targetId, content }
 */
router.post('/', commentController.createComment);

/**
 * GET /comments/:targetType/:targetId
 * Récupérer tous les commentaires d'une cible
 */
router.get('/:targetType/:targetId', commentController.getComments);

/**
 * PUT /comments/:commentId
 * Modifier un commentaire
 * Body: { content }
 */
router.put('/:commentId', commentController.updateComment);

/**
 * DELETE /comments/:commentId
 * Supprimer un commentaire
 */
router.delete('/:commentId', commentController.deleteComment);

export default router;
