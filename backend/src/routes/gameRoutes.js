import express from 'express';
import * as gameController from '../controllers/gameController.js';

const router = express.Router();

// GET /games/count - Récupérer le nombre total de jeux en DB
router.get('/count', gameController.getTotalGamesCount);

// GET /games/top - Jeux les plus populaires
router.get('/top', gameController.getTopGames);

// GET /games/trending - Jeux tendance
router.get('/trending', gameController.getTrendingGames);

// GET /games/search - Rechercher des jeux sur RAWG
router.get('/search', gameController.searchGamesController);

// GET /games - Tous les jeux
router.get('/', gameController.getAllGames);

// GET /games/:rawgId - Détails d'un jeu
router.get('/:rawgId', gameController.getGameDetails);

export default router;
