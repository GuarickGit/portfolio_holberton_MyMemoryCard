import * as Review from '../models/Review.js';
import { addXpToUser } from '../models/User.js';
import { XP_REWARDS } from '../utils/xpHelper.js';

/**
 * Crée une nouvelle review
 * POST /reviews
 * Body: { gameId, rating, content }
 * Headers: Authorization: Bearer <token>
 */
export const createReview = async (req, res) => {
  try {
    const { gameId, rating, title, content, spoiler } = req.body;
    const userId = req.userId; // Fourni par le middleware JWT

    // Validation des champs obligatoires
    if (!gameId || !rating || !title || !content) {
      return res.status(400).json({
        error: 'gameId, rating, title et content sont requis'
      });
    }

    // Validation du rating (doit être entre 1 et 5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'La note doit être entre 1 et 5'
      });
    }

    // Validation du titre
    if (title.trim().length === 0) {
      return res.status(400).json({
        error: 'Le titre ne peut pas être vide'
      });
    }

    // Validation du contenu (pas vide après trim)
    if (content.trim().length === 0) {
      return res.status(400).json({
        error: 'Le contenu ne peut pas être vide'
      });
    }

    // Vérifie si l'utilisateur a déjà une review pour ce jeu
    // Note : On ne peut pas utiliser une contrainte UNIQUE en base car on utilise rawg_id
    // dans l'API mais game_id (id interne) en base. La conversion se fait dans le model.
    const existingReviews = await Review.getReviewsByGame(gameId);
    const userAlreadyReviewed = existingReviews.find(
      review => review.user_id === userId
    );

    if (userAlreadyReviewed) {
      return res.status(409).json({
        error: 'Vous avez déjà publié une review pour ce jeu'
      });
    }

    // Création de la review
    const review = await Review.createReview(userId, gameId, rating, title, content, spoiler);

    // Ajoute de l'XP à l'utilisateur
    try {
      await addXpToUser(userId, XP_REWARDS.CREATE_REVIEW);
    } catch (xpError) {
      console.error('Erreur lors de l\'ajout d\'XP', xpError);
    }

    // Retourne la review créée
    res.status(201).json({
      message: 'Review créée avec succès',
      review
    });

  } catch (error) {
    console.error('Erreur lors de la création de la review:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la création de la review'
    });
  }
};


/**
 * Récupère le feed global des reviews
 * GET /reviews?sort=recent&limit=20&offset=0
 */
export const getReviews = async (req, res) => {
  try {
    // Récupération des query params avec valeurs par défaut
    const sort = req.query.sort || 'recent';
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // Validation du tri
    if (sort !== 'recent' && sort !== 'top_rated') {
      return res.status(400).json({
        error: 'Le paramètre sort doit être "recent" ou "top_rated"'
      });
    }

    // Validation de la pagination
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Le paramètre limit doit être entre 1 et 100'
      })
    }

    if (offset < 0) {
      return res.status(400).json({
        error: 'Le paramètre offset doit être >= 0'
      });
    }

    // Récupération des reviews
    const reviews = await Review.getAllReviews(sort, limit, offset);

    res.status(200).json({
      reviews,
      pagination: {
        limit,
        offset,
        count: reviews.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des reviews:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des reviews'
    });
  }
};


/**
 * Récupère les reviews d'un jeu spécifique
 * GET /reviews/game/:rawgId?limit=20&offset=0
 */
export const getGameReviews = async (req, res) => {
  try {
    const { rawgId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // Validation du rawgId
    if (!rawgId || isNaN(rawgId)) {
      return res.status(400).json({
        error: 'rawgId invalide'
      });
    }

    // Validation de la pagination
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Le paramètre limit doit être entre 1 et 100'
      });
    }

    if (offset < 0) {
      return res.status(400).json({
        error: 'Le paramètre offset doit être >= 0'
      })
    }
    // Récupération des reviews
    const reviews = await Review.getReviewsByGame(parseInt(rawgId), limit, offset);

    res.status(200).json({
      reviews,
      pagination: {
        limit,
        offset,
        count: reviews.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des reviews du jeu:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des reviews'
    });
  }
};


/**
 * Récupère les reviews d'un utilisateur spécifique
 * GET /reviews/user/:userId?limit=20&offset=0
 */
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // Validation du userId (UUID format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!userId || !uuidRegex.test(userId)) {
      return res.status(400).json({
        error: 'userId invalide'
      });
    }

    // Validation de la pagination
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Le paramètre limit doit être entre 1 et 100'
      })
    }

    if (offset < 0) {
      return res.status(400).json({
        error: 'Le paramètre offset doit être >= 0'
      });
    }

    // Récupération des reviews
    const reviews = await Review.getReviewsByUser(userId, limit, offset);

    res.status(200).json({
      reviews,
      pagination: {
        limit,
        offset,
        count: reviews.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des reviews de l\'utilisateur:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des reviews'
    });
  }
};


/**
 * Modifie une review existante
 * PUT /reviews/:id
 * Body: { rating?, content? }
 * Headers: Authorization: Bearer <token>
 */
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, content } = req.body;
    const userId = req.userId;

    // Vérifie qu'au moins un champ est fourni
    if (rating === undefined && content === undefined) {
      return res.status(400).json({
        error: 'Au moins un champ (rating ou content) est requis'
      });
    }

    // Validation du rating si fourni
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        error: 'La note doit être entre 1 et 5'
      });
    }

    // Validation du contenu si fourni
    if (content !== undefined && content.trim().length === 0) {
      return res.status(400).json({
        error: 'Le contenu ne peut pas être vide'
      });
    }

    // Vérifie que la review existe
    const existingReview = await Review.getReviewsById(id);

    if (!existingReview) {
      return res.status(404).json({
        error: 'Review introuvable'
      });
    }

    // Vérifie que l'utilisateur est bien le propriétaire
    if (existingReview.user_id !== userId) {
      return res.status(403).json({
        error: 'Vous n\'êtes pas autorisé à modifier cette review'
      });
    }

    // Construire l'objet updates
    const updates = {};
    if (rating !== undefined) updates.rating = rating;
    if (content !== undefined) updates.content = content;

    // Mise à jour de la review
    const updatedReview = await Review.updateReview(id, updates);

    res.status(200).json({
      message: 'Review modifiée avec succès',
      review: updatedReview
    });

  } catch (error) {
    console.error('Erreur lors de la modification de la review:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la modification de la review'
    });
  }
};


/**
 * Supprime une review existante
 * DELETE /reviews/:id
 * Headers: Authorization: Bearer <token>
 */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Vérifie que la review existe
    const existingReview = await Review.getReviewsById(id);

    if (!existingReview) {
      return res.status(404).json({
        error: 'Review introuvable'
      });
    }

    // Vérifie que l'utilisateur est bien le propriétaire
    if (existingReview.user_id !== userId) {
      return res.status(403).json({
        error: 'Vous n\'êtes pas autorisé à supprimer cette review'
      });
    }

    // Suppression de la review
    await Review.deleteReview(id);

    res.status(200).json({
      message: 'Review supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la review:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la suppression de la review'
    });
  }
};


/**
 * Récupère une review par son ID
 * GET /reviews/:id
 */
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupération de la review
    const review = await Review.getReviewsById(id);

    if (!review) {
      return res.status(404).json({
        error: 'Review introuvable'
      });
    }

    res.status(200).json({
      review
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la review:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération de la review'
    });
  }
};
