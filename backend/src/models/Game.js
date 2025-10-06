import pool from '../config/index.js';

/**
 * Vérifie si un jeu existe déjà en base par son rawg_id
 * @param {number} rawgId - L'ID du jeu chez RAWG
 * @returns {Object|null} - L'objet jeu s'il existe, null sinon
 */
export const findGameByRawgId = async (rawgId) => {
  try {
    const query = 'SELECT * FROM games WHERE rawg_id = $1';
    const result = await pool.query(query, [rawgId]);

    // Si le jeu existe, retourne la première ligne
    return result.rows.length > 0 ? result.rows[0] : null;

  } catch (error) {
    console.error('Erreur dans findGameByRawgId:', error.message);
    throw error;
  }
};


/**
 * Crée un nouveau jeu en base de données
 * @param {Object} gameData - Les données du jeu depuis RAWG
 * @returns {Object} - Le jeu créé avec son ID
 */
export const createGame = async (gameData) => {
  try {
    const query = `
      INSERT INTO games (rawg_id, name, background_image, released, rating, platforms, genres)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      gameData.id,  // rawg_id
      gameData.name,
      gameData.background_image,
      gameData.released,
      gameData.rating,
      JSON.stringify(gameData.platforms),  // platforms (converti en JSON)
      JSON.stringify(gameData.genres)  // genres (converti en JSON)
    ];

    const result = await pool.query(query, values);

    return result.rows[0];

  } catch (error) {
    console.error('Erreur dans createGame:', error.message);
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
