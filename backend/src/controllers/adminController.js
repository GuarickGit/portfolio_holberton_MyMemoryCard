import * as Admin from '../models/Admin.js';

/**
 * GET /admin/stats
 * Récupère les statistiques globales de l'application
 */
export const getStats = async (req, res) => {
  try {
    const stats = await Admin.getGlobalStats();

    return res.status(200).json({
      message: 'Statistiques récupérées avec succès',
      data: stats
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
};


/**
 * DELETE /admin/users/:id
 * Supprime un utilisateur et tout son contenu
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'admin ne se supprime pas lui-même
    if (id === req.userId) {
      return res.status(400).json({
        error: 'Vous ne pouvez pas supprimer votre propre compte admin'
      });
    }

    const deletedUser = await Admin.deleteUserById(id);

    if (!deletedUser) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    return res.status(200).json({
      message: 'Utilisateur supprimé avec succès',
      data: deletedUser
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du user:', error);
    return res.status(500).json({
      error: 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
};


/**
 * DELETE /admin/memories/:id
 * Supprime un souvenir
 */
export const deleteMemory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMemory = await Admin.deleteMemoryById(id);

    if (!deletedMemory) {
      return res.status(404).json({
        error: 'Souvenir non trouvé'
      });
    }

    return res.status(200).json({
      message: 'Souvenir supprimé avec succès',
      data: deletedMemory
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du memory:', error);
    return res.status(500).json({
      error: 'Erreur lors de la suppression du souvenir'
    });
  }
};


/**
 * GET /admin/users
 * Récupère la liste de tous les utilisateurs avec pagination
 */
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Validation des paramètres
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Paramètres invalides. Page >= 1, Limit entre 1 et 100'
      });
    }

    const result = await Admin.getAllUsers(page, limit);

    return res.status(200).json({
      message: 'Utilisateurs récupérés avec succès',
      data: result
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des users:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};


/**
 * GET /admin/users/:id
 * Récupère les détails complets d'un utilisateur
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Admin.getUserDetails(id);

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    return res.status(200).json({
      message: 'Détails utilisateur récupérés avec succès',
      data: user
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du user:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération des détails utilisateur'
    });
  }
};


/**
 * DELETE /admin/reviews/:id
 * Supprime une review
 */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReview = await Admin.deleteReviewById(id);

    if (!deletedReview) {
      return res.status(404).json({
        error: 'Review non trouvée'
      });
    }

    return res.status(200).json({
      message: 'Review supprimée avec succès',
      data: deletedReview
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la review:', error);
    return res.status(500).json({
      error: 'Erreur lors de la suppression de la review'
    });
  }
};


/**
 * DELETE /admin/comments/:id
 * Supprime un commentaire
 */
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedComment = await Admin.deleteCommentById(id);

    if (!deletedComment) {
      return res.status(404).json({
        error: 'Commentaire non trouvé'
      });
    }

    return res.status(200).json({
      message: 'Commentaire supprimé avec succès',
      data: deletedComment
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    return res.status(500).json({
      error: 'Erreur lors de la suppression du commentaire'
    });
  }
};

export default {
  getStats,
  deleteUser,
  deleteMemory,
  getUsers,      
  getUserById,
  deleteReview,
  deleteComment
};
