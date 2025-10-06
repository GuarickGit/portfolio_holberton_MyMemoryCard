import { searchGames } from '../services/rawgService.js';

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
