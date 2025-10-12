import * as CommentModel from '../models/Comment.js';

/**
 * Crée un nouveau commentaire
 * POST /comments
 * Body: { targetType, targetId, content }
 */
export const createComment = async (req, res) => {
  try {
    const { targetType, targetId, content } = req.body;
    const userId = req.userId;  // Récupéré depuis le middleware JWT

    // Vérification des champs obligatoires
    if (!targetType || !targetId || !content) {
      return res.status(400).json({
        error: 'targetType, targetId et content sont requis'
      });
    }

    // Vérification que targetType est valide
    if (!['review', 'memory'].includes(targetType)) {
      return res.status(400).json({
        error: 'targetType doit être "review" ou "memory"'
      });
    }

    // Vérification que le contenu n'est pas vide (après trim)
    if (content.trim().length === 0) {
      return res.status(400).json({
        error: 'Le contenu du commentaire ne peut pas être vide'
      });
    }

    // Créer le commentaire
    const comment = await CommentModel.createComment(userId, targetType, targetId, content.trim());

    // Retourne le commentaire créé (déjà enrichi avec username et avatar dans le model)
    return res.status(201).json({
      message: 'Commentaire créee avec succès',
      comment
    });

  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    return res.status(500).json({
      error: 'Erreur serveur lors de la création du commentaire'
    });
  }
};


/**
 * Récupère tous les commentaires d'une cible
 * GET /comments/:targetType/:targetId
 */
export const getComments = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    // Vérification que targetType est valide
    if (!['review', 'memory'].includes(targetType)) {
      return res.status(400).json({
        error: 'targetType doit être "review" ou "memory"'
      });
    }

    // Récupère les commentaires avec infos des utilisateurs
    const comments = await CommentModel.getCommentsByTarget(targetType, targetId);

    // Retourne les commentaires
    return res.status(200).json({
      count: comments.length,
      comments
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return res.status(500).json({
      error: 'Erreur serveur lors de la récupération des commentaires'
    });
  }
};


/**
 * Modifie un commentaire existant
 * PUT /comments/:commentId
 * Body: { content }
 */
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.userId;  // Récupéré depuis le middleware JWT

    // Vérification du champ obligatoire
    if (!content) {
      return res.status(400).json({
        error: 'Le contenu est requis'
      });
    }

    // Vérification que le contenu n'est pas vide (après trim)
    if (content.trim().length === 0) {
      return res.status(400).json({
        error: 'Le contenu du commentaire ne peut pas être vide'
      });
    }

    // Modifier le commentaire
    const updatedComment = await CommentModel.updateComment(commentId, userId, content.trim());

    // Si le commentaire n'existe pas ou l'utilisateur n'est pas l'auteur
    if (!updatedComment) {
      return res.status(404).json({
        error: 'Commentaire non trouvé ou vous n\'êtes pas l\'auteur'
      });
    }

    // Retourne le commentaire modifié
    return res.status(200).json({
      message: 'Commentaire modifié avec succès',
      comment: updatedComment
    });

  } catch (error) {
    console.error('Erreur lors de la modification du commentaire:', error);
    return res.status(500).json({
      error: 'Erreur serveur lors de la modification du commentaire'
    });
  }
};


/**
 * Supprime un commentaire
 * DELETE /comments/:commentId
 */
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;  // Récupéré depuis le middleware JWT

    // Supprimer le commentaire
    const deletedComment = await CommentModel.deleteComment(commentId, userId);

    // Si le commentaire n'existe pas ou l'utilisateur n'est pas l'auteur
    if (!deletedComment) {
      return res.status(404).json({
        error: 'Commentaire non trouvé ou vous n\'êtes pas l\'auteur'
      });
    }

    // Succès
    return res.status(200).json({
      message: 'Commentaire supprimé avec succès',
      comment: deletedComment
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    return res.status(500).json({
      error: 'Erreur serveur lors de la suppression du commentaire'
    });
  }
};
