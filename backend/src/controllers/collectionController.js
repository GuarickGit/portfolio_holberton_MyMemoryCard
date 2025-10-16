import {
  findCollectionEntry,
  addToCollection,
  getUserCollection,
  updateCollectionEntry,
  removeFromCollection
} from '../models/Collection.js';

import { findGameByRawgId, findOrCreate } from '../models/Game.js';

/**
 * Ajoute un jeu à la collection de l'utilisateur
 * POST /collections
 * Body: { rawg_id, status, user_rating (optionnel) }
 */
export const addGameToCollection = async (req, res) => {
  try {
    const userId = req.userId; // Récupéré depuis le middleware JWT
    const { rawg_id, status, user_rating } = req.body;

    // Validation des champs obligatoires
    if (!rawg_id || !status) {
      return res.status(400).json({
        error: 'Les champs rawg_id et status sont obligatoires'
      });
    }

    // Validations du status
    const validStatuses = ['playing', 'completed', "wishlist", 'abandoned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Le status doit être : ${validStatuses.join(', ')}`
      });
    }

    // Validation du rating si fourni
    if (user_rating !== undefined && user_rating !== null) {
      if (user_rating < 1 || user_rating > 5) {
        return res.status(400).json({
          error: 'La note doit être entre 1 et 5'
        });
      }
    }

    // Trouve le jeu ou le crée avec RAWG + IGDB
    const game = await findOrCreate(rawg_id);

    // Vérifie si le jeu est déjà dans la collection de l'user
    const existingEntry = await findCollectionEntry(userId, game.id);

    if (existingEntry) {
      return res.status(409).json({
        error: 'Ce jeu est déjà dans votre collection'
      });
    }

    // Ajoute le jeu à la collection
    const collectionEntry = await addToCollection(userId, game.id, status, user_rating);

    // Retourne la réponse
    return res.status(201).json({
      message: 'Jeu ajouté à votre collection',
      collection: collectionEntry,
      game: game
    });

  } catch (error) {
    console.error('Erreur dans addGameToCollection:', error.message);
    return res.status(500).json({
      error: 'Erreur serveur lors de l\'ajout du jeu'
    });
  }
};


/**
 * Récupère la collection complète de l'utilisateur
 * GET /collections
 */
export const getMyCollection = async (req, res) => {
  try {
    const userId = req.userId;

    const collection = await getUserCollection(userId);

    return res.status(200).json({
      count: collection.length,
      collection: collection
    });

  } catch (error) {
    console.error('Erreur dans getMyCollection:', error.message);
    return res.status(500).json({
      error: 'Erreur serveur lors de la récupération de la collection'
    });
  }
};


/**
 * Met à jour un jeu dans la collection (status ou rating)
 * PATCH /collections/:rawgId
 * Body: { status, user_rating }
 */
export const updateGameInCollection = async (req, res) => {
  try {
    const userId = req.userId;
    const rawgId = parseInt(req.params.rawgId);
    const { status, user_rating } = req.body;

    // Vérifie que rawgId est un nombre valide
    if (isNaN(rawgId)) {
      return res.status(400).json({
        error: 'Id RAWG de jeu invalide'
      });
    }

    // Vérifie qu'au moins un champ est fourni
    if (status === undefined && user_rating === undefined) {
      return res.status(400).json({
        error: 'Aucun champ à mettre à jour (status ou user_rating requis)'
      });
    }

    // Validation du status si fourni
    if (status !== undefined) {
      const validStatuses = ['playing', 'completed', 'wishlist', 'abandoned'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Le status doit être : ${validStatuses.join(', ')}`
        });
      }
    }

    // Validation du rating si fourni
    if (user_rating !== undefined && user_rating !== null) {
      if (user_rating < 1 || user_rating > 5) {
        return res.status(400).json({
          error: 'La note doit être entre 1 et 5'
        });
      }
    }

    // Récupère le game.id à partir du rawg_id
    const game = await findGameByRawgId(rawgId);

    if (!game) {
      return res.status(404).json({
        error: 'Ce jeu n\'existe pas dans la base de données'
      });
    }

    const gameId = game.id

    // Validation que le jeu est dans la collection
    const existingEntry = await findCollectionEntry(userId, gameId);

    if (!existingEntry) {
      return res.status(404).json({
        error: 'Ce jeu n\'est pas dans votre collection'
      });
    }

    // Mettre à jour
    const updates = {};
    if (status !== undefined) updates.status = status;
    if (user_rating !== undefined) updates.user_rating = user_rating;

    const updateEntry = await updateCollectionEntry(userId, gameId, updates);

    return res.status(200).json({
      message: 'Jeu mis à jour',
      collection: updateEntry
    });

  } catch (error) {
    console.error('Erreur dans updateGameInCollection:', error.message);
    return res.status(500).json({
      error: 'Erreur serveur lors de la mise à jour'
    });
  }
};


/**
 * Supprime un jeu de la collection
 * DELETE /collections/:rawgId
 */
export const removeGameFromCollection = async (req, res) => {
  try {
    const userId = req.userId;
    const rawgId = parseInt(req.params.rawgId);

    // Vérifie que rawgId est un nombre valide
    if (isNaN(rawgId)) {
      return res.status(400).json({
        error: 'ID de jeu invalide'
      });
    }

    // Récupère le game.id à partir du rawg_id
    const game = await findGameByRawgId(rawgId)

    if (!game) {
      return res.status(404).json({
        error: 'Ce jeu n\'existe pas dans la base de données'
      });
    }

    const gameId = game.id

    // Vérifie que le jeu est dans la collection
    const existingEntry = await findCollectionEntry(userId, gameId);

    if (!existingEntry) {
      return res.status(404).json({
        error: 'Ce jeu n\'est pas dans votre collection'
      });
    }

    // Supprimer
    await removeFromCollection(userId, gameId);

    return res.status(200).json({
      message: 'Jeu supprimé de votre collection'
    });

  } catch (error) {
    console.error('Erreur dans removeGameFromCollection:', error.message);
    return res.status(500).json({
      error: 'Erreur serveur lors de la suppression'
    });
  }
};
