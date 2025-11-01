import * as LikeModel from '../models/Like.js';

/**
 * Ajoute un like à une cible (review ou memory)
 * POST /likes
 * Body: { targetType, targetId }
 */
export const addLike = async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.userId;  // Récupéré depuis le middleware JWT

    // Vérification des champs obligatoires
    if (!targetType || !targetId) {
      return res.status(400).json({
        error: 'targetType et targetId sont requis'
      });
    }

    // Créer le like
    const like = await LikeModel.createLike(userId, targetType, targetId);

    // Retourne le like créé
    return res.status(201).json({
      message: 'Like ajouté avec succès',
      like
    });

  } catch (error) {
    // Gestion des erreurs (Unicité)
    if (error.code === '23505') {  // Code PostgreSQL pour violation UNIQUE
      return res.status(409).json({
        error: 'Vous avez déjà liké ce contenu'
      });
    }

    // Erreur serveur
    console.error('Erreur lors de l\'ajout du like:', error);
    return res.status(500).json({
      error: 'Erreur serveur lors de l\'ajout du like'
    });
  }
};


/**
 * Supprime un like d'une cible
 * DELETE /likes
 * Body: { targetType, targetId }
 */
export const removeLike = async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.userId;  // Récupéré depuis le middleware JWT

    // Vérification des champs obligatoires
    if (!targetType || !targetId) {
      return res.status(400).json({
        error: 'targetType et targetId sont requis'
      });
    }

    // Supprime le like
    const deletedLike = await LikeModel.deleteLike(userId, targetType, targetId);

    // Si le like n'existait pas
    if (!deletedLike) {
      return res.status(404).json({
        error: 'Like non trouvé'
      });
    }

    // Succès
    return res.status(200).json({
      message: 'Like supprimé avec succès',
      like: deletedLike
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du like', error);
    return res.status(500).json({
      error: 'Erreur serveur lors de la supprression du like'
    });
  }
};


/**
 * Récupère tous les likes d'une cible
 * GET /likes/:targetType/:targetId
 */
export const getLikes = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    // Vérification que targetType est valide
    if (!['review', 'memory'].includes(targetType)) {
      return res.status(400).json({
        error: 'targetType doit être "review" ou "memory"'
      });
    }

    // Récupère les likes avec infos des utilisateurs
    const likes = await LikeModel.getLikesByTarget(targetType, targetId);

    // Récupère aussi le nombre total de likes
    const likesCount = await LikeModel.getLikesCountByTarget(targetType, targetId);

    // Retourne les données
    return res.status(200).json({
      count: likesCount,
      likes
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des likes:', error);
    return res.status(500).json({
      error: 'Erreur serveur lors de la récupération des likes'
    });
  }
};


/**
 * Vérifie si l'utilisateur a liké une cible
 * GET /likes/:targetType/:targetId/check
 */
export const checkLike = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const userId = req.userId;  // Récupéré depuis le middleware JWT

    // Vérification que targetType est valide
    if (!['review', 'memory'].includes(targetType)) {
      return res.status(400).json({
        error: 'targetType doit être "review" ou "memory"'
      });
    }

    // Vérifie si l'utilisateur a liké
    const hasLiked = await LikeModel.checkUserLiked(userId, targetType, targetId);

    // Retourne le résultat
    return res.status(200).json({
      hasLiked
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du like:', error);
    return res.status(500).json({
      error: 'Erreur serveur lors de la vérification du like'
    });
  }
};


/**
 * Toggle un like (ajoute si pas présent, supprime si présent)
 * POST /likes/toggle
 * Body: { targetType, targetId }
 */
export const toggleLike = async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.userId;

    // Vérification des champs obligatoires
    if (!targetType || !targetId) {
      return res.status(400).json({
        error: 'targetType et targetId sont requis'
      });
    }

    // Vérification que targetType est valide
    if (!['review', 'memory'].includes(targetType)) {
      return res.status(400).json({
        error: 'targetType doit être "review" ou "memory"'
      });
    }

    // Vérifier si l'utilisateur a déjà liké
    const hasLiked = await LikeModel.checkUserLiked(userId, targetType, targetId);

    let liked;

    if (hasLiked) {
      // Supprimer le like
      await LikeModel.deleteLike(userId, targetType, targetId);
      liked = false;
    } else {
      // Ajouter le like
      await LikeModel.createLike(userId, targetType, targetId);
      liked = true;
    }

    // Récupérer le nouveau nombre de likes
    const likesCount = await LikeModel.getLikesCountByTarget(targetType, targetId);

    // Retourner le résultat
    return res.status(200).json({
      liked,
      likesCount
    });

  } catch (error) {
    console.error('Erreur lors du toggle du like:', error);
    return res.status(500).json({
      error: 'Erreur serveur lors du toggle du like'
    });
  }
};
