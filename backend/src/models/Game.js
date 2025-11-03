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


/**
 * Récupère les détails d'un jeu avec ses statistiques
 * Si le jeu n'existe pas en BDD, le crée automatiquement depuis RAWG + IGDB
 * @param {Number} rawgId - ID RAWG du jeu
 * @returns {Object} Détails du jeu avec stats
 */
export const getGameWithStats = async (rawgId) => {
  try {
    // 1. Chercher le jeu en BDD
    let result = await pool.query(`
      SELECT
        g.*,
        COUNT(DISTINCT c.id) as total_in_collections,
        COUNT(DISTINCT CASE WHEN c.status = 'playing' THEN c.id END) as playing_count,
        COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN c.id END) as completed_count,
        COUNT(DISTINCT CASE WHEN c.status = 'wishlist' THEN c.id END) as wishlist_count,
        COUNT(DISTINCT CASE WHEN c.status = 'abandoned' THEN c.id END) as abandoned_count,
        COUNT(DISTINCT r.id) as total_reviews,
        COALESCE(AVG(r.rating), 0) as average_user_rating,
        COUNT(DISTINCT m.id) as total_memories
      FROM games g
      LEFT JOIN collections c ON g.id = c.game_id
      LEFT JOIN reviews r ON g.id = r.game_id
      LEFT JOIN memories m ON g.id = m.game_id
      WHERE g.rawg_id = $1
      GROUP BY g.id
    `, [rawgId]);

    // 2. Si le jeu n'existe pas, le créer automatiquement
    if (result.rows.length === 0) {
      console.log(`Jeu ${rawgId} non trouvé en BDD, création automatique...`);

      // Créer le jeu avec findOrCreate (RAWG + IGDB)
      await findOrCreate(rawgId);

      // Refaire la requête maintenant que le jeu existe
      result = await pool.query(`
        SELECT
          g.*,
          COUNT(DISTINCT c.id) as total_in_collections,
          COUNT(DISTINCT CASE WHEN c.status = 'playing' THEN c.id END) as playing_count,
          COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN c.id END) as completed_count,
          COUNT(DISTINCT CASE WHEN c.status = 'wishlist' THEN c.id END) as wishlist_count,
          COUNT(DISTINCT CASE WHEN c.status = 'abandoned' THEN c.id END) as abandoned_count,
          COUNT(DISTINCT r.id) as total_reviews,
          COALESCE(AVG(r.rating), 0) as average_user_rating,
          COUNT(DISTINCT m.id) as total_memories
        FROM games g
        LEFT JOIN collections c ON g.id = c.game_id
        LEFT JOIN reviews r ON g.id = r.game_id
        LEFT JOIN memories m ON g.id = m.game_id
        WHERE g.rawg_id = $1
        GROUP BY g.id
      `, [rawgId]);
    }

    const game = result.rows[0];

    return {
      id: game.id,
      rawg_id: game.rawg_id,
      name: game.name,
      background_image: game.background_image,
      cover_url: game.cover_url,
      released: game.released,
      rating: parseFloat(game.rating),
      platforms: game.platforms,
      genres: game.genres,
      stats: {
        total_in_collections: parseInt(game.total_in_collections),
        playing_count: parseInt(game.playing_count),
        completed_count: parseInt(game.completed_count),
        wishlist_count: parseInt(game.wishlist_count),
        abandoned_count: parseInt(game.abandoned_count),
        total_reviews: parseInt(game.total_reviews),
        average_user_rating: parseFloat(parseFloat(game.average_user_rating).toFixed(2)),
        total_memories: parseInt(game.total_memories)
      }
    };

  } catch (error) {
    console.error('Erreur dans getGameWithStats:', error.message);
    throw error;
  }
};


/**
 * Récupère tous les jeux triés par popularité globale
 * Popularité = nombre total de collections + reviews + memories
 * @param {Number} limit - Nombre de jeux à retourner (optionnel)
 * @param {Number} offset - Offset pour la pagination (optionnel)
 * @returns {Array} Liste des jeux avec leur score de popularité
 */
export const getAllGamesByPopularity = async (limit = null, offset = 0) => {
  try {
    let query = `
      SELECT
        g.id,
        g.rawg_id,
        g.name,
        g.background_image,
        g.cover_url,
        g.released,
        g.rating,
        COUNT(DISTINCT c.id) as collection_count,
        COUNT(DISTINCT r.id) as review_count,
        COUNT(DISTINCT m.id) as memory_count,
        (COUNT(DISTINCT c.id) + COUNT(DISTINCT r.id) + COUNT(DISTINCT m.id)) as popularity_score
      FROM games g
      LEFT JOIN collections c ON g.id = c.game_id
      LEFT JOIN reviews r ON g.id = r.game_id
      LEFT JOIN memories m ON g.id = m.game_id
      GROUP BY g.id
      ORDER BY popularity_score DESC, g.name ASC
    `;

    const params = [];

    // Ajouter LIMIT si fourni
    if (limit !== null) {
      params.push(limit);
      query += ` LIMIT $${params.length}`;
    }

    // Ajouter OFFSET
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    return result.rows.map(game => ({
      ...game,
      collection_count: parseInt(game.collection_count),
      review_count: parseInt(game.review_count),
      memory_count: parseInt(game.memory_count),
      popularity_score: parseInt(game.popularity_score)
    }));

  } catch (error) {
    console.error('Erreur dans getAllGamesByPopularity:', error.message);
    throw error;
  }
};

export default {
  findGameByRawgId,
  findGameById,
  findOrCreate,
  createGame,
  getTopGames,
  getTrendingGames,
  getGameWithStats,
  getAllGamesByPopularity
};
