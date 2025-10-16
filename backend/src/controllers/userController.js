import { findUserById, updateUser, getUserPublicProfile, searchUsers, getUserStats } from "../models/User.js";

/**
 * Récupère les informations de l'utilisateur connecté
 * @route GET /users/me
 */
export const getMe = async (req, res) => {
  try {
    // req.userId a été ajouté par le middleware authMiddleware
    const userId = req.userId;

    // Récupère l'utilisateur depuis la DB
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: "Utilisateur non trouvé."
      });
    }

    // Renvois les infos de l'utilisateur (sans le password_hash)
    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        banner_url: user.banner_url,
        bio: user.bio,
        exp: user.exp,
        level: user.level,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    res.status(500).json({
      error: "Erreur serveur lors de la récupération du profil."
    });
  }
};


/**
 * Met à jour le profil de l'utilisateur connecté
 * @route PUT /users/me
 * @body { username?, bio?, avatar_url?, banner_url? }
 */
export const updateMe = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, bio, avatar_url, banner_url } = req.body;

    // Construit l'objet des données à mettre à jour
    const updateData = {};

    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (banner_url !== undefined) updateData.banner_url = banner_url;

    // Vérifie qu'il y a au moins un champ à mettre à jour
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "Aucune donnée à mettre à jour."
      });
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await updateUser(userId, updateData);

    // Retourne l'utilisateur mis à jour
    res.status(200).json({
      message: "Profil mis à jour avec succès",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar_url: updatedUser.avatar_url,
        banner_url: updatedUser.banner_url,
        bio: updatedUser.bio,
        exp: updatedUser.exp,
        level: updatedUser.level,
        created_at: updatedUser.created_at
      }
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);

    // Gestion de l'erreur de username déjà pris
    if (error.code === '23505') {  // Contrainte UNIQUE violée
      return res.status(409).json({
        error: "Ce nom d'utilisateur est déjà utilisé."
      });
    }

    res.status(500).json({
      error: "Erreur serveur lors de la mise à jour du profil."
    });
  }
};


/**
 * Récupère le profil public d'un utilisateur
 * @route GET /users/:userId
 */
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Récupére le profil public avec statistiques
    const profile = await getUserPublicProfile(userId);

    if (!profile) {
      return res.status(404).json({
        error: "Utilisateur non trouvé."
      });
    }

    // Retourne le profil public
    res.status(200).json({
      user: profile
    });

  } catch (error) {
    console.error("Erreur lors de la récupération du profil public :", error);
    res.status(500).json({
      error: "Erreur serveur lors de la récupération du profil."
    });
  }
};


/**
 * GET /users/search
 * Recherche des utilisateurs par username
 */
export const searchUsersController = async (req, res) => {
  try {
    const { q } = req.query;

    // Validation : query param 'q' obligatoire
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        error: 'Le paramètre de recherche "q" est obligatoire'
      });
    }

    // Validation : minimum 2 caractères
    if (q.trim().length < 2) {
      return res.status(400).json({
        error: 'La recherche doit contenir au moins 2 caractères'
      });
    }

    // Limite optionnelle (défaut: 10, max: 50)
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const users = await searchUsers(q.trim(), limit);

    return res.status(200).json({
      count: users.length,
      results: users
    });

  } catch (error) {
    console.error('Erreur dans searchUsersController:', error.message);
    return res.status(500).json({
      error: 'Erreur serveur lors de la recherche d\'utilisateurs'
    });
  }
};


/**
 * GET /users/:userId/stats
 * Récupère les statistiques complètes d'un utilisateur
 */
export const getUserStatsController = async (req, res) => {
  try {
    const { userId } = req.params;

    // Vérifier que l'utilisateur existe
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    // Récupérer les stats
    const stats = await getUserStats(userId);

    return res.status(200).json({
      user_id: userId,
      username: user.username,
      stats: stats
    });

  } catch (error) {
    console.error('Erreur dans getUserStatsController:', error.message);
    return res.status(500).json({
      error: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
};
