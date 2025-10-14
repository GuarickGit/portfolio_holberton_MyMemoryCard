import * as FollowModel from '../models/Follow.js';

/**
 * Suivre un utilisateur
 * POST /follows/:userId
 */
export const follow = async (req, res) => {
  try {
    const { userId } = req.params;  // Utilisateur à suivre
    const followerId = req.userId;  // Utilisateur connecté (depuis JWT)

    // Vérifie qu'on n'essaie pas de se suivre soi-même
    if (followerId === userId) {
      return res.status(400).json({
        error: 'Vous ne pouvez pas vous suivre vous-même'
      });
    }

    // Créer le follow
    const follow = await FollowModel.followUser(followerId, userId);

    res.status(201).json({
      message: 'Utilisateur suivi avec succès',
      follow
    });

  } catch (error) {
    // Gestion de l'erreur de doublon (contrainte UNIQUE)
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Vous suivez déjà cet utilisateur'
      });
    }

    // Gestion de l'erreur si l'utilisateur à suivre n'existe pas
    if (error.code === '23503') {
      return res.status(404).json({
        error: 'Utilisateur introuvable'
      });
    }

    console.error('Erreur lors du follow:', error);
    res.status(500).json({
      error: 'Erreur serveur lors du follow'
    });
  }
};


/**
 * Ne plus suivre un utilisateur
 * DELETE /follows/:userId
 */
export const unfollow = async (req, res) => {
  try {
    const { userId } = req.params;  // Utilisateur à ne plus suivre
    const followerId = req.userId;  // Utilisateur connecté

    // Supprimer le follow
    const deletedFollow = await FollowModel.unfollowUser(followerId, userId);

    if (!deletedFollow) {
      return res.status(404).json({
        error: 'Vous ne suivez pas cet utilisateur'
      });
    }

    res.status(200).json({
      message: 'Utilisateur retiré de vos abonnements',
      follow: deletedFollow
    });

  } catch (error) {
    console.error('Erreur lors de l\'unfollow:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de l\'unfollow'
    });
  }
};


/**
 * Récupère les abonnés d'un utilisateur
 * GET /follows/:userId/followers
 */
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const followers = await FollowModel.getFollowers(userId);

    res.status(200).json({
      count: followers.length,
      followers
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des abonnés:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des abonnés'
    });
  }
};


/**
 * Récupère les abonnements d'un utilisateur
 * GET /follows/:userId/following
 */
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const following = await FollowModel.getFollowing(userId);

    res.status(200).json({
      count: following.length,
      following
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des abonnements:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des abonnements'
    });
  }
};


/**
 * Vérifie si l'utilisateur connecté suit un autre utilisateur
 * GET /follows/:userId/check
 */
export const checkFollow = async (req, res) => {
  try {
    const { userId } = req.params;  // Utilisateur à vérifier
    const followerId = req.userId;  // Utilisateur connecté

    const isFollowing = await FollowModel.checkIfFollowing(followerId, userId);

    res.status(200).json({
      isFollowing
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du follow:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la vérification'
    });
  }
};
