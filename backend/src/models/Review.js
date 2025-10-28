import pool from '../config/index.js';

/**
 * Crée une nouvelle review
 * @param {string} userId - ID de l'utilisateur
 * @param {number} rawgId - ID RAWG du jeu
 * @param {number} rating - Note (1-5)
 * @param {string} content - Contenu de la review
 * @returns {object} La review créée
 */
export const createReview = async (userId, rawgId, rating, title, content, spoiler = false) => {
  // Récupère le game.id à partir du rawg_id
  const gameQuery = `SELECT id FROM games WHERE rawg_id = $1`;
  const gameResult = await pool.query(gameQuery, [rawgId]);

  if (gameResult.rows.length === 0) {
    throw new Error('Le jeu n\'existe pas dans la base de données');
  }

  const gameId = gameResult.rows[0].id;

  // Crée la review avec le game.id
  const query = `
    INSERT INTO reviews (user_id, game_id, rating, title, content, spoiler)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, user_id, game_id, rating, title, content, spoiler, created_at
    `;

    const values = [userId, gameId, rating, title, content, spoiler];
    const result = await pool.query(query,values);

    return result.rows[0];
};


/**
 * Récupère le feed global des reviews
 * @param {string} sort - Type de tri ('recent' ou 'top_rated')
 * @param {number} limit - Nombre de résultats
 * @param {number} offset - Décalage pour la pagination
 * @returns {array} Liste des reviews
 */
export const getAllReviews = async (sort = 'recent', limit = 20, offset = 0) => {
  let query = `
    SELECT
      r.id,
      r.user_id,
      r.game_id,
      r.rating,
      r.title,
      r.spoiler,
      r.content,
      r.created_at,
      u.username,
      u.avatar_url,
      g.name AS game_name,
      g.cover_url AS game_image,
      g.released,
      (SELECT COUNT(*) FROM likes WHERE target_type = 'review' AND target_id = r.id) as likes_count,
      (SELECT COUNT(*) FROM comments WHERE target_type = 'review' AND target_id = r.id) as comments_count
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    JOIN games g ON r.game_id = g.id
  `;

  // Tri selon le paramètre
  if (sort === 'top_rated') {
    query += ` ORDER BY r.rating DESC, r.created_at DESC`;
  } else {
    query += ` ORDER BY r.created_at DESC`;
  }

  query += ` LIMIT $1 OFFSET $2`;

  const values = [limit, offset];
  const result = await pool.query(query, values);

  return result.rows;
};


/**
 * Récupère les reviews d'un jeu spécifique
 * @param {number} rawgId - ID RAWG du jeu
 * @param {number} limit - Nombre de résultats
 * @param {number} offset - Décalage pour la pagination
 * @returns {array} Liste des reviews du jeu
 */
export const getReviewsByGame = async (rawgId, limit = 20, offset = 0) => {
  // Récupère le game.id
  const gameQuery = `SELECT id FROM games WHERE rawg_id = $1`;
  const gameResult = await pool.query(gameQuery, [rawgId]);

  if (gameResult.rows.length === 0) {
    return []; // Aucune review si le jeu n'existe pas
  }

  const gameId = gameResult.rows[0].id;

  const query = `
    SELECT
      r.id,
      r.user_id,
      r.game_id,
      r.rating,
      r.title,
      r.spoiler,
      r.content,
      r.created_at,
      u.username,
      u.avatar_url,
      g.name AS game_name,
      g.cover_url AS game_image,
      g.released,
      (SELECT COUNT(*) FROM likes WHERE target_type = 'review' AND target_id = r.id) as likes_count,
      (SELECT COUNT(*) FROM comments WHERE target_type = 'review' AND target_id = r.id) as comments_count
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    JOIN games g ON r.game_id = g.id
    WHERE r.game_id = $1
    ORDER BY r.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const values = [gameId, limit, offset];
  const result = await pool.query(query, values);

  return result.rows;
};


/**
 * Récupère les reviews d'un utilisateur spécifique
 * @param {string} userId - ID de l'utilisateur
 * @param {number} limit - Nombre de résultats
 * @param {number} offset - Décalage pour la pagination
 * @returns {array} Liste des reviews de l'utilisateur
 */
export const getReviewsByUser = async (userId, limit = 20, offset = 0) => {
  const query = `
    SELECT
      r.id,
      r.user_id,
      r.game_id,
      r.rating,
      r.title,
      r.spoiler,
      r.content,
      r.created_at,
      u.username,
      u.avatar_url,
      g.name AS game_name,
      g.cover_url AS game_image,
      g.released,
      (SELECT COUNT(*) FROM likes WHERE target_type = 'review' AND target_id = r.id) as likes_count,
      (SELECT COUNT(*) FROM comments WHERE target_type = 'review' AND target_id = r.id) as comments_count
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    JOIN games g ON r.game_id = g.id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const values = [userId, limit, offset];
  const result = await pool.query(query, values);

  return result.rows;
};


/**
 * Modifie le contenu et/ou la note d'une review
 * @param {string} reviewId - ID de la review
 * @param {object} updates - Objet contenant les champs à mettre à jour { rating?, content? }
 * @returns {object} La review mise à jour
 */
export const updateReview = async (reviewId, updates) => {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  // Ajoute rating si fourni
  if (updates.rating !== undefined) {
    fields.push(`rating = $${paramIndex}`);
    values.push(updates.rating);
    paramIndex++;
  }

  // Ajoute content si fourni
  if (updates.content !== undefined) {
    fields.push(`content = $${paramIndex}`);
    values.push(updates.content);
    paramIndex++;
  }

  // Si aucun champ à mettre à jour
  if (fields.length === 0) {
    throw new Error('Aucun champ à mettre à jour');
  }

  // Construit la requête dynamiquement
  const query = `
    UPDATE reviews
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, user_id, game_id, rating, content, created_at
  `;

  values.push(reviewId);

  const result = await pool.query(query, values);
  return result.rows[0];
};


/**
 * Supprime une review
 * @param {string} reviewId - ID de la review
 * @returns {object} La review supprimée
 */
export const deleteReview = async (reviewId) => {
  const query = `
    DELETE FROM reviews
    WHERE id = $1
    RETURNING id, user_id, game_id, rating, content, created_at
  `;

  const values = [reviewId];
  const result = await pool.query(query, values);

  return result.rows[0];
};


/**
 * Récupère une review par son ID
 * @param {string} reviewId - ID de la review
 * @returns {object} La review trouvée
 */
export const getReviewsById = async (reviewId) => {
  const query = `
    SELECT
      r.id,
      r.user_id,
      r.game_id,
      r.rating,
      r.title,
      r.spoiler,
      r.content,
      r.created_at,
      u.username,
      u.avatar_url,
      g.name AS game_name,
      g.cover_url AS game_image,
      g.released,
      (SELECT COUNT(*) FROM likes WHERE target_type = 'review' AND target_id = r.id) as likes_count,
      (SELECT COUNT(*) FROM comments WHERE target_type = 'review' AND target_id = r.id) as comments_count
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    JOIN games g ON r.game_id = g.id
    WHERE r.id = $1
  `;

  const values = [reviewId];
  const result = await pool.query(query, values);

  return result.rows[0];
};
