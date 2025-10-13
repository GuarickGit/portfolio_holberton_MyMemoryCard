import pool from "../config/index.js";

/**
 * Crée un nouvel utilisateur dans la base de données
 * @param {string} username - Nom d'utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} passwordHash - Mot de passe déjà hashé
 * @returns {Object} L'utilisateur créé (sans le password)
 */

export const createUser = async (username, email, passwordHash) => {
  // Définit la requête SQL avec des placeholders ($1, $2, $3)
  // (Protection contre les injections SQL)
  const query = `
    INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, username, email, avatar_url, banner_url, bio, exp, level, created_at
    `;

  // Définit les valeurs à insérer (dans l'ordre des placeholders)
  const values = [username, email, passwordHash];

  try {
    // Exécute la requête
    const result = await pool.query(query, values);

    // Retourne le premier résultat (l'utilisateur créé)
    return result.rows[0];

  } catch (error) {
    // En cas d'erreur, on la relance pour que le controller la gère
    throw error;
  }
};


/**
 * Trouve un utilisateur par son email
 * @param {string} email - Email à rechercher
 * @returns {Object|null} L'utilisateur trouvé ou null
 */

export const findUserByEmail = async (email) => {
  // Requête SQL pour chercher par email
  const query = `
    SELECT id, username, email, password_hash, avatar_url, banner_url, bio, exp, level, created_at
    FROM users
    WHERE email = $1
    `;

    const values = [email];

    try {
      // Exécuter la requête
      const result = await pool.query(query, values);

      // Si aucun résultat, retourner null
      if (result.rows.length === 0) {
        return null;
      }

      // Sinon, retourner l'utilisateur
      return result.rows[0];

    } catch (error) {
      // En cas d'erreur, on la relance pour que le controller la gère
      throw error;
    }
};


/**
 * Trouve un utilisateur par son ID
 * @param {string} id - ID de l'utilisateur (UUID)
 * @returns {Object|null} L'utilisateur trouvé ou null
 */
export const findUserById = async (id) => {
  const query = `
    SELECT id, username, email, avatar_url, banner_url, bio, exp, level, created_at
    FROM users
    WHERE id = $1
    `;

    const values = [id];

    try {
      // Exécuter la requête
      const result = await pool.query(query, values);

      // Si aucun résultat, retourner null
      if (result.rows.length === 0) {
        return null;
      }

      // Sinon, retourner l'utilisateur
      return result.rows[0];

    } catch (error) {
      // En cas d'erreur, on la relance pour que le controller la gère
      throw error;
    }
};


/**
 * Met à jour les informations d'un utilisateur
 * @param {string} id - ID de l'utilisateur
 * @param {Object} updateData - Données à mettre à jour { username, bio, avatar_url, banner_url }
 * @returns {Object} L'utilisateur mis à jour
 */


export const updateUser = async (id, updateData) => {
  // Construire dynamiquement la requête en fonction des champs à mettre à jour
  const fields = [];
  const values = [];
  let paramIndex = 1;

  // Pour chaque champ dans updateData, on ajoute à la requête
  // Note : `$${paramIndex}` → premier $ pour PostgreSQL, ${} pour interpolation JS
  if (updateData.username !== undefined) {
    fields.push(`username = $${paramIndex}`);
    values.push(updateData.username);
    paramIndex++;
  }

  if (updateData.bio !== undefined) {
    fields.push(`bio = $${paramIndex}`);
    values.push(updateData.bio);
    paramIndex++;
  }

    if (updateData.avatar_url !== undefined) {
    fields.push(`avatar_url = $${paramIndex}`);
    values.push(updateData.avatar_url);
    paramIndex++;
  }

  if (updateData.banner_url !== undefined) {
    fields.push(`banner_url = $${paramIndex}`);
    values.push(updateData.banner_url);
    paramIndex++;
  }

  // Si aucun champ à mettre à jour, on retourne l'utilisateur tel quel
  if (fields.length === 0) {
    return await findUserById(id);
  }

  // Ajouter l'ID à la fin des valeurs
  values.push(id);

  // Construire la requête finale
  const query = `
    UPDATE users
    SET ${fields.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING id, username, email, avatar_url, banner_url, bio, exp, level, created_at
    `;

    try {
      // Exécuter la requête
      const result = await pool.query(query, values);

      // Retourner l'utilisateur
      return result.rows[0];

    } catch (error) {
      // En cas d'erreur, on la relance pour que le controller la gère
      throw error;
    }
};


/**
 * Récupère le profil public d'un utilisateur avec ses statistiques
 * @param {string} userId - ID de l'utilisateur
 * @returns {Object|null} Profil public avec stats ou null
 */
export const getUserPublicProfile = async (userId) => {
  const query = `
    SELECT
      u.id,
      u.username,
      u.avatar_url,
      u.banner_url,
      u.bio,
      u.exp,
      u.level,
      u.created_at,
      (SELECT COUNT(*) FROM collections WHERE user_id = u.id) as games_count,
      (SELECT COUNT(*) FROM memories WHERE user_id = u.id) as memories_count,
      (SELECT COUNT(*) FROM reviews WHERE user_id = u.id) as reviews_count
    FROM users u
    WHERE u.id = $1
  `;

  const values = [userId];

  try {
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      ...user,
      games_count: parseInt(user.games_count),
      memories_count: parseInt(user.memories_count),
      reviews_count: parseInt(user.reviews_count)
    };

  } catch (error) {
    throw error;
  }
};


/**
 * Ajoute de l'XP à un utilisateur et recalcule son niveau
 * @param {string} userId - ID de l'utilisateur
 * @param {number} xpAmount - Quantité d'XP à ajouter
 * @returns {Object} L'utilisateur mis à jour avec nouveau XP et niveau
 */
export const addXpToUser = async (userId, xpAmount) => {
  // Ajoute l'XP
  const query = `
    UPDATE users
    SET exp = exp + $1
    WHERE id = $2
    RETURNING id, username, email, avatar_url, banner_url, bio, exp, level, created_at
  `;

  const values = [xpAmount, userId];

  try {
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    // Importe la fonction de calcul de niveau
    const { calculateLevel } = await import('../utils/xpHelper.js');

    // Calcule le nouveau niveau
    const newLevel = calculateLevel(user.exp);

    // Si le niveau a changé, le mettre à jour en base
    if (newLevel !== user.level) {
      const updateLevelQuery = `
        UPDATE users
        SET level = $1
        WHERE id = $2
        RETURNING id, username, email, avatar_url, banner_url, bio, exp, level, created_at
      `;

      const updateLevelResult = await pool.query(updateLevelQuery, [newLevel, userId]);
      return updateLevelResult.rows[0];
    }

    // Sinon retourne l'utilisateur avec XP mis à jour
    return user;

  } catch (error) {
    throw error;
  }
};
