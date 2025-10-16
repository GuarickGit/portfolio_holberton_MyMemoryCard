import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import * as gameController from '../controllers/gameController.js';

const router = express.Router();

// GET /games/top - Jeux les plus populaires
router.get('/top', verifyToken, gameController.getTopGames);

// GET /games/trending - Jeux tendance
router.get('/trending', verifyToken, gameController.getTrendingGames);

// GET /games/search - Rechercher des jeux sur RAWG
router.get('/search', verifyToken, gameController.searchGamesController);

export default router;
