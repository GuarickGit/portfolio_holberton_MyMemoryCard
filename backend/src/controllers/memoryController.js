import * as Memory from '../models/Memory.js';
import { addXpToUser } from '../models/User.js';
import { XP_REWARDS } from '../utils/xpHelper.js';

/**
 * Crée un nouveau souvenir
 * POST /memories
 * Body: { gameId, content }
 * Headers: Authorization: Bearer <token>
 */
export const createMemory = async (req, res) => {
  try {
    const { gameId, title, content, spoiler } = req.body;  // Données envoyées par le frontend
    const userId = req.userId;  // Fourni par le middleware JWT verifyToken

    // Validation
    if (!gameId || !title || !content) {
      return res.status(400).json({
        error: 'gameId, title et content sont requis'
      });
    }

    if (title.trim().length === 0) {
      return res.status(400).json({
        error: 'Le titre ne peut pas être vide'
      });
    }

    if (content.trim().length === 0) {  // .trim -> Enlève les espaces avant et après
      return res.status(400).json({
        error: 'Le contenu ne peut pas être vide'
      });
    }

    // Création du souvenir
    const memory = await Memory.createMemory(userId, gameId, title, content, spoiler);

    // Ajoute de l'XP à l'utilisateur
    try {
      await addXpToUser(userId, XP_REWARDS.CREATE_MEMORY);
    } catch (xpError) {
      // Si l'ajout d'XP échoue, on log mais on ne bloque pas la création du souvenir
      console.error('Erreur lors de l\'ajout d\'XP:', xpError);
    }

    // Retourne le souvenir créé
    res.status(201).json({
      message: 'Souvenir créé avec succès',
      memory
    });

  } catch (error) {
    console.error('Erreur lors de la création du souvenir:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la création du souvenir'
    });
  }
};


/**
 * Récupère le feed global des souvenirs
 * GET /memories?sort=recent&limit=20&offset=0
 */
export const getMemories = async (req, res) => {
  try {
    // Récupération des query params avec valeurs par défaut
    const sort = req.query.sort || 'recent';
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // Validation du tri
    if (sort !== 'recent' && sort !== 'popular') {
      return res.status(400).json({
        error: 'Le paramètre sort doit être "recent" ou "popular"'
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
      });
    }

    // Récupération des souvenirs
    const memories = await Memory.getAllMemories(sort, limit, offset);

    res.status(200).json({
      memories,
      pagination: {
        limit,
        offset,
        count: memories.length  // Nombre de résultats retournés
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des souvenirs:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des souvenirs'
    });
  }
};


/**
 * Récupère les souvenirs d'un jeu spécifique
 * GET /memories/game/:rawgId?limit=20&offset=0
 */
export const getGameMemories = async (req, res) => {
  try {
    const rawgId = parseInt(req.params.rawgId);  // ← CHANGÉ : rawgId au lieu de gameId
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // Validation du rawgId
    if (isNaN(rawgId)) {
      return res.status(400).json({
        error: 'ID de jeu invalide'
      });
    }

    // validation de la pagination
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Le paramètre limit doit être entre 1 et 100'
      });
    }

    if (offset < 0) {
      return res.status(400).json({
        error: 'Le paramètre offset doit être >= 0'
      });
    }

    // Récupération des souvenirs
    const memories = await Memory.getMemoriesByGame(rawgId, limit, offset);

    res.status(200).json({
      memories,
      pagination: {
        limit,
        offset,
        count: memories.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des souvenirs du jeu:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des souvenirs'
    });
  }
};


/**
 * Récupère les souvenirs d'un utilisateur spécifique
 * GET /memories/user/:userId?limit=20&offset=0
 */
export const getUserMemories = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    // Validation du userId (UUID)
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
      });
    }

    if (offset < 0) {
      return res.status(400).json({
        error: 'Le paramètre offset doit être >= 0'
      });
    }

    // Réucpération des souvenirs
    const memories = await Memory.getMemoriesByUser(userId, limit, offset);

    res.status(200).json({
      memories,
      pagination: {
        limit,
        offset,
        count: memories.length  // Nombre de résultats retournés
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des souvenirs de l\'utilisateur:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des souvenirs'
    });
  }
};


/**
 * Modifie un souvenir existant
 * PUT /memories/:id
 * Body: { content }
 * Headers: Authorization: Bearer <token>
 */
export const updateMemory = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;  // Fourni par le middleware JWT

    // Validation du contenu
    if (!content) {
      return res.status(400).json({
        error: 'Le champ content est requis'
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        error: 'Le contenu ne peut pas être vide'
      });
    }

    // Vérifier que le souvenir existe
    const existingMemory = await Memory.getMemoryById(id);

    if (!existingMemory) {
      return res.status(404).json({
        error: 'Souvenir introuvable'
      });
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    if (existingMemory.user_id !== userId) {
      return res.status(403).json({
        error: 'Vous n\'êtes pas autorisé à modifier ce souvenir'
      });
    }

    // Mise à jour du souvenir
    const updatedMemory = await Memory.updateMemory(id, content);

    res.status(200).json({
      message: 'Souvenir modifié avec succès',
      memory: updatedMemory
    });

  } catch (error) {
    console.error('Erreur lors de la modification du souvenir:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la modification du souvenir'
    });
  }
};


/**
 * Supprime un souvenir existant
 * DELETE /memories/:id
 * Headers: Authorization: Bearer <token>
 */
export const deleteMemory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;  // Fourni par le middleware JWT

    // Vérifier que le souvenir existe
    const existingMemory = await Memory.getMemoryById(id);

    if (!existingMemory) {
      return res.status(404).json({
        error: 'Souvenir introuvable'
      });
    }

    // Vérifier que l'utilisateur est bien le propriétaire
    if (existingMemory.user_id !== userId) {
      return res.status(403).json({
        error: 'Vous n\'êtes pas autorisé à supprimer ce souvenir'
      });
    }

    // Suppression du souvenir
    await Memory.deleteMemory(id);

    res.status(200).json({
      message: 'Souvenir supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du souvenir:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la suppression du souvenir'
    });
  }
};
