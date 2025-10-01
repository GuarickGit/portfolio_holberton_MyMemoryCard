import { findUserById } from "../models/User.js";

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
