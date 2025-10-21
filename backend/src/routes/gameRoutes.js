import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import * as gameController from '../controllers/gameController.js';

const router = express.Router();

// GET /games/top - Jeux les plus populaires
router.get('/top', gameController.getTopGames);

// GET /games/trending - Jeux tendance
router.get('/trending', gameController.getTrendingGames);

// GET /games/search - Rechercher des jeux sur RAWG
router.get('/search', gameController.searchGamesController);

// GET /games/:rawgId - Détails d'un jeu
router.get('/:rawgId', gameController.getGameDetails);

export default router;
