import pool from '../config/index.js';

/**
 * Modèle Admin - Fonctions SQL pour les opérations administrateur
 */

/**
 * Récupère les statistiques globales de l'application
 * @returns {Object} Statistiques (users, games, memories, reviews)
 */
export const getGlobalStats = async () => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM games) AS total_games,
      (SELECT COUNT(*) FROM memories) AS total_memories,
      (SELECT COUNT(*) FROM reviews) AS total_reviews,
      (SELECT COUNT(*) FROM collections) AS total_collections
  `);

  return result.rows[0];
};


/**
 * Supprime un utilisateur et TOUT son contenu associé
 * @param {String} userId - UUID de l'utilisateur à supprimer
 * @returns {Object} Résultat de la suppression
 */
export const deleteUserById = async (userId) => {
  const client = await pool.connect();
  // On récupère une connexion dédiée (pas le pool)
  // Pour garantir que toutes les requêtes
  // utilisent la MÊME connexion et sont dans la MÊME transaction

  try {
    await client.query('BEGIN');
    // Démarre la transaction
    // Toutes les requêtes suivantes sont "en attente"

    // Supprime les reviews de l'utilisateur
    await client.query('DELETE FROM reviews WHERE user_id = $1', [userId]);

    // Supprime les memories de l'utilisateur
    await client.query('DELETE FROM memories WHERE user_id = $1', [userId]);

    // Supprime les collections de l'utilisateur
    await client.query('DELETE FROM collections WHERE user_id = $1', [userId]);

    // Supprime les follows (following et followers)
    await client.query('DELETE FROM follows WHERE follower_id = $1 OR following_id = $1', [userId]);

    // Supprime l'utilisateur lui-même
    const result = await client.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, username, email',
      [userId]
    );

    // Ensemble d'opérations SQL qui doivent toutes réussir ou toutes échouer
    // Principe ACID (Atomicity, Consistency, Isolation, Durability)
    await client.query('COMMIT');
    // Valide TOUTES les modifications
    // C'est seulement maintenant qu'elles sont appliquées en BDD

    return result.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    // Annule TOUTES les modifications
    // La BDD revient à l'état avant le BEGIN
    throw error;
  } finally {
    client.release();
    // IMPORTANT : libère la connexion pour qu'elle
    // retourne dans le pool et soit réutilisable
  }
};

/**
 * Supprime un souvenir (memory) par son ID
 * @param {String} memoryId - UUID du souvenir à supprimer
 * @returns {Object} Souvenir supprimé
 */
export const deleteMemoryById = async (memoryId) => {
  const result = await pool.query(
    'DELETE FROM memories WHERE id = $1 RETURNING id, user_id, game_id, content',
    [memoryId]
  );

  return result.rows[0];
};


/**
 * Récupère la liste de tous les utilisateurs avec pagination
 * @param {Number} page - Numéro de la page (défaut: 1)
 * @param {Number} limit - Nombre d'utilisateurs par page (défaut: 20)
 * @returns {Object} Liste des users + métadonnées de pagination
 */
export const getAllUsers = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  // Compte le nombre total d'utilisateurs
  const countResult = await pool.query('SELECT COUNT(*) FROM users');
  const totalUsers = parseInt(countResult.rows[0].count);

  // Récupère les utilisateurs (sans password_hash pour la sécurité)
  const result = await pool.query(`
    SELECT
      id,
      username,
      email,
      role,
      bio,
      avatar_url,
      exp,
      level,
      created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  return {
    users: result.rows,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers: totalUsers,
      usersPerPage: limit
    }
  };
};


/**
 * Récupère les détails complets d'un utilisateur (pour modération)
 * @param {String} userId - UUID de l'utilisateur
 * @returns {Object} Détails complets du user + ses contenus
 */
export const getUserDetails = async (userId) => {
  // Infos de base du user (sans password_hash)
  const userResult = await pool.query(`
    SELECT
      id,
      username,
      email,
      role,
      bio,
      avatar_url,
      banner_url,
      exp,
      level,
      created_at
    FROM users
    WHERE id = $1
  `, [userId]);

  if (userResult.rows.length === 0) {
    return null;
  }

  const user = userResult.rows[0];

  // Statistiques du user
  const statsResult = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM memories WHERE user_id = $1) AS total_memories,
      (SELECT COUNT(*) FROM reviews WHERE user_id = $1) AS total_reviews,
      (SELECT COUNT(*) FROM collections WHERE user_id = $1) AS total_collections,
      (SELECT COUNT(*) FROM follows WHERE follower_id = $1) AS total_following,
      (SELECT COUNT(*) FROM follows WHERE following_id = $1) AS total_followers
  `, [userId]);

  return {
    ...user,
    stats: statsResult.rows[0]
  };
};


/**
 * Supprime une review par son ID
 * @param {String} reviewId - UUID de la review à supprimer
 * @returns {Object} Review supprimée
 */
export const deleteReviewById = async (reviewId) => {
  const result = await pool.query(
    'DELETE FROM reviews WHERE id = $1 RETURNING id, user_id, game_id, rating, content',
    [reviewId]
  );

  return result.rows[0];
};


/**
 * Supprime un commentaire par son ID
 * @param {String} commentId - UUID du commentaire à supprimer
 * @returns {Object} Commentaire supprimé
 */
export const deleteCommentById = async (commentId) => {
  const result = await pool.query(
    'DELETE FROM comments WHERE id = $1 RETURNING id, user_id, target_type, target_id, content',
    [commentId]
  );

  return result.rows[0];
};

export default {
  getGlobalStats,
  deleteUserById,
  deleteMemoryById,
  getAllUsers,
  getUserDetails,
  deleteReviewById,
  deleteCommentById
};
