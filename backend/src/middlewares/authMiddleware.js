import jwt from "jsonwebtoken";

/**
 * Middleware d'authentification JWT
 * Vérifie que l'utilisateur est connecté via un token valide
 */
export const verifyToken = (req, res, next) => {
  try {
    // Récupère le token depuis le cookie
    const token = req.cookies.token;

    // Vérifie que le cookie existe
    if (!token) {
      return res.status(401).json({
        error: "Token manquant. Authentification requise."
      });
    }

    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajoute le userId à la requête pour le rendre accessible dans les controllers
    req.userId = decoded.userId;

    // Passe au middleware/controller suivant
    next();

  } catch (error) {
    // Gestion des erreurs JWT
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Token invalide."
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expiré. Veuillez vous reconnecter."
      });
    }

    // Erreur générique
    res.status(500).json({
      error: "Erreur serveur lors de la vérification du token."
    });
  }
};
