import pool from '../config/index.js';

/**
 * Crée un nouveau commentaire
 * @param {string} userId - ID de l'utilisateur
 * @param {string} targetType - Type de cible ('review' ou 'memory')
 * @param {string} targetId - ID de la cible
 * @param {string} content - Contenu du commentaire
 * @returns {object} Le commentaire créé avec les infos de l'utilisateur
 */
export const createComment = async (userId, targetType, targetId, content) => {
  const query = `
    INSERT INTO comments (user_id, target_type, target_id, content)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, target_type, target_id, content, created_at
  `;

  const values = [userId, targetType, targetId, content];
  const result = await pool.query(query, values);

  // Stocke le commentaire créé
  const comment = result.rows[0];

  // Récupère les infos de l'utilisateur (username + avatar)
  // On fait cette requête séparée pour avoir un objet complet à retourner au frontend
  const userQuery = `
    SELECT username, avatar_url
    FROM users
    WHERE id = $1
  `;

  const userResult = await pool.query(userQuery, [userId]);

  // Fusionne le commentaire avec les infos utilisateur
  // Permet au frontend d'afficher directement le commentaire sans requête supplémentaire
  return {
    ...comment,
    username: userResult.rows[0].username,
    avatar_url: userResult.rows[0].avatar_url
  };
};


/**
 * Récupère tous les commentaires d'une cible spécifique
 * @param {string} targetType - Type de cible ('review' ou 'memory')
 * @param {string} targetId - ID de la cible
 * @returns {array} Liste des commentaires avec infos utilisateurs
 */
export const getCommentsByTarget = async (targetType, targetId) => {
   // Récupère les commentaires avec une jointure sur users pour avoir username et avatar
   const query = `
    SELECT c.id, c.user_id, c.target_type, c.target_id, c.content, c.created_at,
           u.username, u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.target_type = $1 AND c.target_id = $2
    ORDER BY c.created_at DESC
   `;

   const values = [targetType, targetId];
   const result = await pool.query(query, values);

   // Retourne un tableau de commentaires (peut être vide [] si aucun commentaire)
   return result.rows;
};


/**
 * Modifie un commentaire existant
 * @param {string} commentId - ID du commentaire
 * @param {string} userId - ID de l'utilisateur (pour vérifier la propriété)
 * @param {string} content - Nouveau contenu
 * @returns {object|null} Le commentaire modifié ou null si non trouvé/non autorisé
 */
export const updateComment = async (commentId, userId, content) => {
  // Met à jour uniquement si l'utilisateur est l'auteur du commentaire
  const query = `
    UPDATE comments
    SET content = $1
    WHERE id = $2 AND user_id = $3
    RETURNING id, user_id, target_type, target_id, content, created_at
  `;

  const values = [content, commentId, userId];
  const result = await pool.query(query, values);

  // Vérification de l'existence du commentaire et du propriétaire
  if (result.rows.length === 0) {
    return null;
  }

  // Enrichit avec les infos utilisateur
  const comment = result.rows[0];

  const userQuery = `
    SELECT username, avatar_url
    FROM users
    WHERE id = $1
  `;

  const userResult = await pool.query(userQuery, [userId]);

  return {
    ...comment,
    username: userResult.rows[0].username,
    avatar_url: userResult.rows[0].avatar_url
  };
};


/**
 * Supprime un commentaire
 * @param {string} commentId - ID du commentaire
 * @param {string} userId - ID de l'utilisateur (pour vérifier la propriété)
 * @returns {object|null} Le commentaire supprimé ou null si non trouvé/non autorisé
 */
export const deleteComment = async (commentId, userId) => {
  // Supprime uniquement si l'utilisateur est l'auteur du commentaire
  const query = `
    DELETE FROM comments
    WHERE id = $1 AND user_id = $2
    RETURNING id, user_id, target_type, target_id, content, created_at
  `;

  const values = [commentId, userId];
  const result = await pool.query(query, values);

  return result.rows[0] || null;
};
