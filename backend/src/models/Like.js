import pool from '../config/index.js';

/**
 * Crée un nouveau like
 * @param {string} userId - ID de l'utilisateur
 * @param {string} targetType - Type de cible ('review' ou 'memory')
 * @param {string} targetId - ID de la cible
 * @returns {object} Le like créé
 */
export const createLike = async (userId, targetType, targetId) => {
  const query = `
    INSERT INTO likes (user_id, target_type, target_id)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, target_type, target_id, created_at
  `;

  const values = [userId, targetType, targetId];
  const result = await pool.query(query, values);

  return result.rows[0];
};


/**
 * Supprime un like
 * @param {string} userId - ID de l'utilisateur
 * @param {string} targetType - Type de cible ('review' ou 'memory')
 * @param {string} targetId - ID de la cible
 * @returns {object|null} Le like supprimé ou null si non trouvé
 */
export const deleteLike = async (userId, targetType, targetId) => {
  const query = `
    DELETE FROM likes
    WHERE user_id = $1 AND target_type = $2 AND target_id = $3
    RETURNING id, user_id, target_type, target_id, created_at
  `;

  const values = [userId, targetType, targetId];
  const result = await pool.query(query, values);

  return result.rows[0] || null;
};


/**
 * Récupère tous les likes d'une cible spécifique
 * @param {string} targetType - Type de cible ('review' ou 'memory')
 * @param {string} targetId - ID de la cible
 * @returns {array} Liste des likes
 */
export const getLikesByTarget = async (targetType, targetId) => {
  const query = `
    SELECT l.id, l.user_id, l.target_type, l.target_id, l.created_at,
           u.username, u.avatar_url
    FROM likes l
    JOIN users u ON l.user_id = u.id
    WHERE l.target_type = $1 AND l.target_id = $2
    ORDER BY l.created_at DESC
  `;

  const values = [targetType, targetId];
  const result = await pool.query(query, values);

  return result.rows;
};


/**
 * Compte le nombre de likes d'une cible spécifique
 * @param {string} targetType - Type de cible ('review' ou 'memory')
 * @param {string} targetId - ID de la cible
 * @returns {number} Nombre de likes
 */
export const getLikesCountByTarget = async (targetType, targetId) => {
  const query = `
    SELECT COUNT(*) as count
    FROM likes
    WHERE target_type = $1 AND target_id = $2
  `;

  const values = [targetType, targetId];
  const result = await pool.query(query, values);

  // PostgreSQL retourne le count sous forme de string "23", donc parseInt
  return parseInt(result.rows[0].count);
};


/**
 * Vérifie si un utilisateur a déjà liké une cible
 * @param {string} userId - ID de l'utilisateur
 * @param {string} targetType - Type de cible ('review' ou 'memory')
 * @param {string} targetId - ID de la cible
 * @returns {boolean} true si l'utilisateur a liké, false sinon
 */
export const checkUserLiked = async (userId, targetType, targetId) => {
  const query = `
    SELECT EXISTS(
      SELECT 1 FROM likes
      WHERE user_id = $1 AND target_type = $2 AND target_id = $3
    ) as liked
  `;

  const values = [userId, targetType, targetId];
  const result = await pool.query(query, values);

  // PostgreSQL retourne directement un boolean
  return result.rows[0].liked;
};
