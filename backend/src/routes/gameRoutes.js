import express from 'express';
import { searchGamesController } from '../controllers/gameController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * GET /games/search?q=zelda&page=1&page_size=20
 * Recherche des jeux via l'API RAWG
 * Nécessite d'être authentifié
 */
router.get('/search', verifyToken, searchGamesController);

export default router;
