import { searchGames } from '../services/rawgService.js';
import * as Game from '../models/Game.js';

/**
 * Recherche des jeux via l'API RAWG
 * GET /games/search?q=zelda&page=1&page_size=20
 */
export const searchGamesController = async (req, res) => {
  try {
    // Récupère les paramêtres de la requête
    const { q, page = 1, page_size = 20 } = req.query;

    // Validation : le paramètre 'q' est obligatoire
    if (!q || q.trim() === '') {
      return res.status(400).json({
        error: 'Le paramètre de recherche "q" est obligatoire'
      });
    }

    // Appel au service RAWG
    const results = await searchGames(q, page, page_size);

    // Si l'API RAWG a échoué
    if (!results) {
      return res.status(503).json({
        error: 'Le service RAWG est temporairement indisponible'
      });
    }

    // Retourn les résultats
    return res.status(200).json({
      count: results.count,
      next: results.next,
      previous: results.previous,
      results: results.results
    });

  } catch (error) {
    console.error('Erreur dans searchGamesController:', error.message);
    return res.status(500).json({
      error: 'Erreur serveur lors de la recherche de jeux'
    });
  }
};


/**
 * GET /games/top
 * Récupère les jeux les plus populaires de la plateforme
 */
export const getTopGames = async (req, res) => {
  try {
    // Limite optionnelle (défaut: 10, max: 50)
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const topGames = await Game.getTopGames(limit);

    return res.status(200).json({
      count: topGames.length,
      games: topGames
    });

  } catch (error) {
    console.error('Erreur dans getTopGames:', error.message);
    return res.status(500).json({
      error: 'Erreur lors de la récupération des jeux populaires'
    });
  }
};


/**
 * GET /games/trending
 * Récupère les jeux tendance (ajoutés récemment par plusieurs users)
 */
export const getTrendingGames = async (req, res) => {
  try {
    // Paramètres optionnels
    const days = Math.min(parseInt(req.query.days) || 30, 90);  // Max 90 jours
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Max 50 jeux
    const minAdds = parseInt(req.query.min_adds) || 2;

    let trendingGames = await Game.getTrendingGames(days, limit, minAdds);

    // Fallback : si aucun jeu avec minAdds, on essaie avec minAdds = 1
    if (trendingGames.length === 0 && minAdds > 1) {
      console.log(`Aucun jeu trending avec min_adds=${minAdds}, tentative avec min_adds=1`);
      trendingGames = await Game.getTrendingGames(days, limit, 1);
    }

    return res.status(200).json({
      count: trendingGames.length,
      period_days: days,
      min_adds: minAdds,
      games: trendingGames
    });

  } catch (error) {
    console.error('Erreur dans getTrendingGames:', error.message);
    return res.status(500).json({
      error: 'Erreur lors de la récupération des jeux tendance'
    });
  }
};


/**
 * GET /games/:rawgId
 * Récupère les détails d'un jeu avec ses statistiques
 */
export const getGameDetails = async (req, res) => {
  try {
    const rawgId = parseInt(req.params.rawgId);

    // Validation
    if (isNaN(rawgId)) {
      return res.status(400).json({
        error: 'ID de jeu invalide'
      });
    }

    const gameDetails = await Game.getGameWithStats(rawgId);

    return res.status(200).json({
      game: gameDetails
    });

  } catch (error) {
    console.error('Erreur dans getGameDetails:', error.message);

    // Gestion d'erreur si le jeu n'existe pas sur RAWG
    if (error.message.includes('404') || error.message.includes('Not found')) {
      return res.status(404).json({
        error: 'Ce jeu n\'existe pas sur RAWG'
      });
    }

    return res.status(500).json({
      error: 'Erreur lors de la récupération des détails du jeu'
    });
  }
};
