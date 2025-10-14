import pool from '../config/index.js';

/**
 * Suivre un utilisateur
 * @param {string} followerId - ID de l'utilisateur qui suit
 * @param {string} followingId - ID de l'utilisateur suivi
 * @returns {Object} Le follow créé
 */
export const followUser = async (followerId, followingId) => {
  const query = `
    INSERT INTO follows (follower_id, following_id)
    VALUES ($1, $2)
    RETURNING id, follower_id, following_id, created_at
  `;

  const values = [followerId, followingId];
  const result = await pool.query(query, values);

  return result.rows[0];
};


/**
 * Ne plus suivre un utilisateur
 * @param {string} followerId - ID de l'utilisateur qui suit
 * @param {string} followingId - ID de l'utilisateur suivi
 * @returns {Object|null} Le follow supprimé ou null
 */
export const unfollowUser = async (followerId, followingId) => {
  const query = `
    DELETE FROM follows
    WHERE follower_id = $1 AND following_id = $2
    RETURNING id, follower_id, following_id, created_at
  `;

  const values = [followerId, followingId];
  const result = await pool.query(query, values);

  return result.rows[0] || null;
};


/**
 * Récupère la liste des abonnés d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Array} Liste des abonnés avec infos
 */
export const getFollowers = async (userId) => {
  const query = `
    SELECT
      f.id,
      f.follower_id,
      f.created_at,
      u.username,
      u.avatar_url,
      u.level
    FROM follows f
    JOIN users u ON f.follower_id = u.id
    WHERE f.following_id = $1
    ORDER BY f.created_at DESC
  `;

  const values = [userId];
  const result = await pool.query(query, values);

  return result.rows;
};


/**
 * Récupère la liste des abonnements d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Array} Liste des abonnements avec infos
 */
export const getFollowing = async (userId) => {
  const query = `
    SELECT
      f.id,
      f.following_id,
      f.created_at,
      u.username,
      u.avatar_url,
      u.level
    FROM follows f
    JOIN users u ON f.following_id = u.id
    WHERE f.follower_id = $1
    ORDER BY f.created_at DESC
  `;

  const values = [userId];
  const result = await pool.query(query, values);

  return result.rows;
};


/**
 * Vérifie si un utilisateur suit un autre utilisateur
 * @param {string} followerId - ID de l'utilisateur qui suit
 * @param {string} followingId - ID de l'utilisateur suivi
 * @returns {boolean} true si suit, false sinon
 */
export const checkIfFollowing = async (followerId, followingId) => {
  const query = `
    SELECT EXISTS(
      SELECT 1 FROM follows
      WHERE follower_id = $1 AND following_id = $2
    ) as is_following
  `;

  const values = [followerId, followingId];
  const result = await pool.query(query, values);

  return result.rows[0].is_following;
};
