import pool from '../config/index.js';

/**
 * Crée un nouveau souvenir
 * @param {string} userId - ID de l'utilisateur
 * @param {number} gameId - ID RAWG du jeu
 * @param {string} content - Contenu du souvenir
 * @returns {object} Le souvenir créé
 */
export const createMemory = async (userId, rawgId, title, content, spoiler = false) => {
  // Récupère le game.id à partir du rawg_id
  const gameQuery = `SELECT id FROM games WHERE rawg_id = $1`;
  const gameResult = await pool.query(gameQuery, [rawgId]);

  if (gameResult.rows.length === 0) {
    throw new Error('Le jeu n\'existe pas dans la base de données');
  }

  const gameId = gameResult.rows[0].id;

  const query = `
    INSERT INTO memories (user_id, game_id, title, content, spoiler)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, user_id, game_id, title, content, spoiler, created_at
    `;

    const values = [userId, gameId, title, content, spoiler];
    const result = await pool.query(query, values);

    return result.rows[0];
};


/**
 * Récupère tous les souvenirs (feed global)
 * @param {string} sort - Type de tri ('recent' ou 'popular')
 * @param {number} limit - Nombre de résultats
 * @param {number} offset - Décalage pour la pagination
 * @returns {array} Liste des souvenirs
 */
export const getAllMemories = async (sort = 'recent', limit = 20, offset = 0) => {
  let query = `
    SELECT
      m.id,
      m.user_id,
      m.game_id,
      m.title,
      m.spoiler,
      m.content,
      m.created_at,
      u.username,
      u.avatar_url,
      g.name AS game_name,
      g.cover_url AS game_image,
      (SELECT COUNT(*) FROM likes WHERE target_type = 'memory' AND target_id = m.id) as likes_count,
      (SELECT COUNT(*) FROM comments WHERE target_type = 'memory' AND target_id = m.id) as comments_count
    FROM memories m
    JOIN users u ON m.user_id = u.id
    JOIN games g ON m.game_id = g.id
    `;

    query += ` ORDER BY m.created_at DESC`;  // Du plus récent au plus ancien

    query += ` LIMIT $1 OFFSET $2`;  // LIMIT = Nbre maximum de résultats
                                     // OFFSET = Nbre de résultat à sauter.
                                     // Ex: 0 pour la première page, 20 pour la deuxième page, etc

    const values = [limit, offset];
    const result = await pool.query(query, values);

    return result.rows;
};


/**
 * Récupère tous les souvenirs liés à un jeu (par rawg_id)
 * @param {Number} rawgId - ID RAWG du jeu
 * @returns {Array} Liste des souvenirs du jeu
 */
export const getMemoriesByGame = async (rawgId, limit = 20, offset = 0) => {
  try {
    const query = `
      SELECT
        m.id,
        m.user_id,
        m.game_id,
        m.title,
        m.spoiler,
        m.content,
        m.created_at,
        u.username,
        u.avatar_url,
        u.level,
        g.name as game_name,
        g.cover_url as game_image,
        g.rawg_id,
        (SELECT COUNT(*) FROM likes WHERE target_type = 'memory' AND target_id = m.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE target_type = 'memory' AND target_id = m.id) as comments_count
      FROM memories m
      INNER JOIN users u ON m.user_id = u.id
      INNER JOIN games g ON m.game_id = g.id
      WHERE g.rawg_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [rawgId, limit, offset]);
    return result.rows;

  } catch (error) {
    console.error('Erreur dans getMemoriesByGame:', error.message);
    throw error;
  }
};


/**
 * Récupère les souvenirs d'un utilisateur spécifique
 * @param {string} userId - ID de l'utilisateur
 * @param {number} limit - Nombre de résultats
 * @param {number} offset - Décalage pour la pagination
 * @returns {array} Liste des souvenirs de l'utilisateur
 */
export const getMemoriesByUser = async (userId, limit = 20, offset = 0) => {
  const query = `
    SELECT
      m.id,
      m.user_id,
      m.game_id,
      m.title,
      m.spoiler,
      m.content,
      m.created_at,
      u.username,
      u.avatar_url,
      g.name AS game_name,
      g.background_image AS game_image,
      (SELECT COUNT(*) FROM likes WHERE target_type = 'memory' AND target_id = m.id) as likes_count,
      (SELECT COUNT(*) FROM comments WHERE target_type = 'memory' AND target_id = m.id) as comments_count
    FROM memories m
    JOIN users u ON m.user_id = u.id
    JOIN games g ON m.game_id = g.id
    WHERE m.user_id = $1
    ORDER BY m.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  // WHERE m.user_id = $1 → Filtre sur un utilisateur spécifique

  const values = [userId, limit, offset];
  const result = await pool.query(query, values);

  return result.rows;
};


/**
 * Modifie le contenu d'un souvenir
 * @param {string} memoryId - ID du souvenir
 * @param {string} content - Nouveau contenu
 * @returns {object} Le souvenir mis à jour
 */
export const updateMemory = async (memoryId, content) => {
  const query = `
    UPDATE memories
    SET content = $1
    WHERE id = $2
    RETURNING id, user_id, game_id, content, created_at
  `;

  const values = [content, memoryId];
  const result = await pool.query(query, values);

  return result.rows[0];
};


/**
 * Supprime un souvenir
 * @param {string} memoryId - ID du souvenir
 * @returns {object} Le souvenir supprimé
 */
export const deleteMemory = async (memoryId) => {
  const query = `
    DELETE FROM memories
    WHERE id = $1
    RETURNING id, user_id, game_id, content, created_at
  `;

  const values = [memoryId];
  const result = await pool.query(query, values);

  return result.rows[0];
};


/**
 * Récupère un souvenir par son ID
 * @param {string} memoryId - ID du souvenir
 * @returns {object} Le souvenir trouvé
 */
export const getMemoryById = async (memoryId) => {
  const query = `
    SELECT
      m.id,
      m.user_id,
      m.game_id,
      m.title,
      m.spoiler,
      m.content,
      m.created_at,
      u.username,
      u.avatar_url,
      g.name AS game_name,
      g.cover_url AS game_image,
      g.background_image,
      (SELECT COUNT(*) FROM likes WHERE target_type = 'memory' AND target_id = m.id) as likes_count,
      (SELECT COUNT(*) FROM comments WHERE target_type = 'memory' AND target_id = m.id) as comments_count
    FROM memories m
    JOIN users u ON m.user_id = u.id
    JOIN games g ON m.game_id = g.id
    WHERE m.id = $1
  `;

  const values = [memoryId];
  const result = await pool.query(query, values);

  return result.rows[0];
};
