import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import * as commentController from '../controllers/commentController.js';

const router = express.Router();

/**
 * ROUTES PUBLIQUES (sans verifyToken)
 */

/**
 * GET /comments/:targetType/:targetId
 * Récupérer tous les commentaires d'une cible
 */
router.get('/:targetType/:targetId', commentController.getComments);

/**
 * ROUTES PROTÉGÉES (avec verifyToken)
 */

/**
 * POST /comments
 * Créer un commentaire
 * Body: { targetType, targetId, content }
 */
router.post('/', verifyToken, commentController.createComment);

/**
 * PUT /comments/:commentId
 * Modifier un commentaire
 * Body: { content }
 */
router.put('/:commentId', verifyToken, commentController.updateComment);

/**
 * DELETE /comments/:commentId
 * Supprimer un commentaire
 */
router.delete('/:commentId', verifyToken, commentController.deleteComment);

export default router;
