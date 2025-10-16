import pool from '../config/index.js';

/**
 * Middleware pour vérifier que l'utilisateur est un administrateur
 * Doit être utilisé APRÈS verifyToken (qui définit req.userId)
 */
export const isAdmin = async (req, res, next) => {
  try {
    // Vérifie que req.userId existe (normalement défini par verifyToken)
    if (!req.userId) {
      return res.status(401).json({
        error: 'Non authentifié. Token manquant ou invalide.'
      });
    }

    // Récupère le rôle de l'utilisateur depuis la BDD
    const result = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [req.userId]
    );

    // Vérifie que l'utilisateur existe
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé.'
      });
    }

    // Vérifie que le rôle est 'admin'
    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({
        error: 'Accès refusé. Privilèges administrateur requis.'
      });
    }

    // Si tout est OK, passer au prochain middleware/controller
    next();

  } catch (error) {
    console.error('Erreur dans isAdmin middleware:', error);
    return res.status(500).json({
      error: 'Erreur serveur lors de la vérification des permissions.'
    });
  }
};
