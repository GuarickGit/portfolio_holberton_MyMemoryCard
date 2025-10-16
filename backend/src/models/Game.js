import pool from '../config/index.js';
import * as rawgService from '../services/rawgService.js';
import * as igdbService from '../services/igdbService.js';

/**
 * Vérifie si un jeu existe déjà en base par son rawg_id
 * @param {number} rawgId - L'ID du jeu chez RAWG
 * @returns {Object|null} - L'objet jeu s'il existe, null sinon
 */
export const findGameByRawgId = async (rawgId) => {
  try {
    const query = 'SELECT * FROM games WHERE rawg_id = $1';
    const result = await pool.query(query, [rawgId]);

    return result.rows.length > 0 ? result.rows[0] : null;

  } catch (error) {
    console.error('Erreur dans findGameByRawgId:', error.message);
    throw error;
  }
};

/**
 * Récupère un jeu par son ID interne
 * @param {number} id - L'ID du jeu en base
 * @returns {Object|null} - L'objet jeu s'il existe, null sinon
 */
export const findGameById = async (id) => {
  try {
    const query = 'SELECT * FROM games WHERE id = $1';
    const result = await pool.query(query, [id]);

    return result.rows.length > 0 ? result.rows[0] : null;

  } catch (error) {
    console.error('Erreur dans findGameById:', error.message);
    throw error;
  }
};

/**
 * Trouve un jeu par son rawg_id, ou le crée s'il n'existe pas
 * Récupère automatiquement la cover depuis IGDB lors de la création
 * @param {Number} rawgId - ID RAWG du jeu
 * @returns {Object} Le jeu (existant ou nouvellement créé)
 */
export const findOrCreate = async (rawgId) => {
  try {
    // 1. Vérifier si le jeu existe déjà en BDD
    const existingGame = await findGameByRawgId(rawgId);

    // Si le jeu existe déjà, on le retourne directement
    if (existingGame) {
      return existingGame;
    }

    // 2. Si le jeu n'existe pas, récupérer ses détails depuis RAWG
    console.log(`Jeu non trouvé en BDD, récupération depuis RAWG (ID: ${rawgId})...`);
    const gameDetails = await rawgService.getGameDetails(rawgId);

    // 3. Récupérer la cover depuis IGDB
    let coverUrl = null;
    try {
      console.log(`Recherche cover IGDB pour: "${gameDetails.name}"...`);
      coverUrl = await igdbService.getCoverByGameName(gameDetails.name);

      if (coverUrl) {
        console.log(`✅ Cover IGDB trouvée pour "${gameDetails.name}": ${coverUrl}`);
      } else {
        console.log(`⚠️ Cover IGDB non trouvée pour "${gameDetails.name}", utilisation du background RAWG`);
      }
    } catch (error) {
      console.error(`❌ Erreur IGDB pour "${gameDetails.name}":`, error.message);
      // On continue même si IGDB échoue
    }

    // 4. Créer le jeu dans la BDD avec les données RAWG + cover IGDB
    const query = `
      INSERT INTO games (rawg_id, name, background_image, cover_url, released, rating, platforms, genres)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      rawgId,
      gameDetails.name,
      gameDetails.background_image,
      coverUrl, // Cover IGDB (peut être null)
      gameDetails.released,
      gameDetails.rating,
      JSON.stringify(gameDetails.platforms),
      JSON.stringify(gameDetails.genres)
    ];

    const result = await pool.query(query, values);

    console.log(`✅ Jeu "${gameDetails.name}" créé en BDD avec ${coverUrl ? 'cover IGDB' : 'background RAWG'}`);

    return result.rows[0];

  } catch (error) {
    console.error('Erreur dans findOrCreate:', error.message);
    throw error;
  }
};

/**
 * Crée un nouveau jeu en base de données (fonction legacy, préférer findOrCreate)
 * @param {Object} gameData - Les données du jeu depuis RAWG
 * @returns {Object} - Le jeu créé avec son ID
 */
export const createGame = async (gameData) => {
  try {
    const query = `
      INSERT INTO games (rawg_id, name, background_image, cover_url, released, rating, platforms, genres)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      gameData.id,
      gameData.name,
      gameData.background_image,
      null, // Pas de cover IGDB dans cette fonction legacy
      gameData.released,
      gameData.rating,
      JSON.stringify(gameData.platforms),
      JSON.stringify(gameData.genres)
    ];

    const result = await pool.query(query, values);

    return result.rows[0];

  } catch (error) {
    console.error('Erreur dans createGame:', error.message);
    throw error;
  }
};


/**
 * Récupère les jeux les plus populaires (les plus dans les collections)
 * @param {Number} limit - Nombre de jeux à retourner (défaut: 10)
 * @returns {Array} Liste des jeux populaires avec leur nombre d'ajouts
 */
export const getTopGames = async (limit = 10) => {
  try {
    const result = await pool.query(`
      SELECT
        g.id,
        g.rawg_id,
        g.name,
        g.background_image,
        g.cover_url,
        g.released,
        g.rating,
        COUNT(c.id) AS collection_count
      FROM games g
      INNER JOIN collections c ON g.id = c.game_id
      GROUP BY g.id
      ORDER BY collection_count DESC, g.name ASC
      LIMIT $1
    `, [limit]);

    return result.rows.map(game => ({
      ...game,
      collection_count: parseInt(game.collection_count)
    }));

  } catch (error) {
    console.error('Erreur dans getTopGames:', error.message);
    throw error;
  }
};


/**
 * Récupère les jeux tendance (ajoutés plusieurs fois récemment)
 * @param {Number} days - Nombre de jours à considérer (défaut: 30)
 * @param {Number} limit - Nombre de jeux à retourner (défaut: 10)
 * @param {Number} minAdds - Nombre minimum d'ajouts pour être "trending" (défaut: 2)
 * @returns {Array} Liste des jeux trending
 */
export const getTrendingGames = async (days = 30, limit = 10, minAdds = 2) => {
  try {
    const result = await pool.query(`
      SELECT
        g.id,
        g.rawg_id,
        g.name,
        g.background_image,
        g.cover_url,
        g.released,
        g.rating,
        COUNT(c.id) as recent_adds,
        MAX(c.created_at) as last_added
      FROM games g
      INNER JOIN collections c ON g.id = c.game_id
      WHERE c.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY g.id
      HAVING COUNT(c.id) >= $1
      ORDER BY recent_adds DESC, last_added DESC, g.name ASC
      LIMIT $2
    `, [minAdds, limit]);

    return result.rows.map(game => ({
      ...game,
      recent_adds: parseInt(game.recent_adds)
    }));

  } catch (error) {
    console.error('Erreur dans getTrendingGames:', error.message);
    throw error;
  }
};

export default {
  findGameByRawgId,
  findGameById,
  findOrCreate,
  createGame,
  getTopGames,
  getTrendingGames
};
