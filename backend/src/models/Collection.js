import pool from '../config/index.js';

/**
 * Vérifie si un jeu est déjà dans la collection d'un utilisateur
 * @param {string} userId - L'ID de l'utilisateur
 * @param {number} gameId - L'ID du jeu
 * @returns {Object|null} - L'entrée de collection si elle existe, null sinon
 */
export const findCollectionEntry = async (userId, gameId) => {
  try {
    const query = 'SELECT * FROM collections WHERE user_id = $1 AND game_id = $2';
    const result = await pool.query(query, [userId, gameId]);

    return result.rows.length > 0 ? result.rows[0] : null;

  } catch (error) {
    console.error('Erreur dans findCollectionEntry:', error.message);
    throw error;
  }
};


/**
 * Ajoute un jeu à la collection d'un utilisateur
 * @param {string} userId - L'ID de l'utilisateur
 * @param {number} gameId - L'ID du jeu
 * @param {string} status - Le statut du jeu (playing, completed, wishlist, not_started)
 * @param {number|null} userRating - La note de l'utilisateur (optionnelle)
 * @returns {Object} - L'entrée de collection créée
 */
export const addToCollection = async (userId, gameId, status, userRating = null) => {
  try {
    const query = `
      INSERT INTO collections (user_id, game_id, status, user_rating)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [userId, gameId, status, userRating];
    const result = await pool.query(query, values);

    return result.rows[0];

  } catch (error) {
    console.error('Erreur dans addToCollection:', error.message);
    throw error;
  }
};


/**
 * Récupère toute la collection d'un utilisateur avec les infos des jeux
 * @param {string} userId - L'ID de l'utilisateur
 * @returns {Array} - Tableau des jeux dans la collection
 */
export const getUserCollection = async (userId) => {
  try {
    const query = `
      SELECT
        collections.id,
        collections.status,
        collections.user_rating,
        collections.created_at,
        games.id as game_id,
        games.rawg_id,
        games.name,
        games.background_image,
        games.cover_url,
        games.released,
        games.rating,
        games.platforms,
        games.genres
      FROM collections
      INNER JOIN games ON collections.game_id = games.id
      WHERE collections.user_id = $1
      ORDER BY collections.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    return result.rows;

  } catch (error) {
    console.error('Erreur dans getUserCollection:', error.message);
    throw error;
  }
};


/**
 * Met à jour un jeu dans la collection (status ou rating)
 * @param {string} userId - L'ID de l'utilisateur
 * @param {number} gameId - L'ID du jeu
 * @param {Object} updates - Objet contenant les champs à mettre à jour
 * @returns {Object|null} - L'entrée mise à jour ou null
 */
export const updateCollectionEntry = async (userId, gameId, updates) => {
  try {
    // Construction dynamique de la requête UPDATE
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Pour chaque champ à mettre à jour
    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex}`);
      values.push(updates.status);
      paramIndex++;
    }

    if (updates.user_rating !== undefined) {
      fields.push(`user_rating = $${paramIndex}`);
      values.push(updates.user_rating);
      paramIndex++;
    }

    // Si aucun champ à mettre à jour, retourner null
    if (fields.length === 0) {
      return null;
    }

    // Ajouter user_id et game_id à la fin du tableau values
    values.push(userId, gameId);

    const query = `
      UPDATE collections
      SET ${fields.join(', ')}
      WHERE user_id = $${paramIndex} AND game_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    return result.rows.length > 0 ? result.rows[0] : null;

  } catch (error) {
    console.error('Erreur dans updateCollectionEntry', error.message);
    throw error;
  }
};


/**
 * Supprime un jeu de la collection d'un utilisateur
 * @param {string} userId - L'ID de l'utilisateur
 * @param {number} gameId - L'ID du jeu
 * @returns {boolean} - true si supprimé, false sinon
 */
export const removeFromCollection = async (userId, gameId) => {
  try {
    const query = 'DELETE FROM collections WHERE user_id = $1 AND game_id = $2 RETURNING *';
    const result = await pool.query(query, [userId, gameId]);

    return result.rows.length > 0;

  } catch (error) {
    console.error('Erreur dans removeFromCollection:', error.message);
    throw error;
  }
};


/**
 * Récupère le status d'un jeu dans la collection d'un utilisateur
 * @param {string} userId - L'ID de l'utilisateur
 * @param {number} rawgId - L'ID RAWG du jeu
 * @returns {Object|null} - { status, user_rating } ou null si pas dans la collection
 */
export const getGameStatusByRawgId = async (userId, rawgId) => {
  try {
    const query = `
      SELECT collections.status, collections.user_rating
      FROM collections
      INNER JOIN games ON collections.game_id = games.id
      WHERE collections.user_id = $1 AND games.rawg_id = $2
    `;

    const result = await pool.query(query, [userId, rawgId]);

    return result.rows.length > 0 ? result.rows[0] : null;

  } catch (error) {
    console.error('Erreur dans getGameStatusByRawgId:', error.message);
    throw error;
  }
};
