import jwt from "jsonwebtoken";

/**
 * Middleware d'authentification JWT
 * Vérifie que l'utilisateur est connecté via un token valide
 */
export const verifyToken = (req, res, next) => {
  try {
    // Récupére le header Authorization
    const authHeader = req.headers.authorization;

    // Vérifie que le header existe
    if (!authHeader) {
      return res.status(401).json({
        error: "Token manquant. Authentification requise."
      });
    }

    // Extrait le token (format: "Bearer <token>")
    const token = authHeader.split(" ")[1];

    // Vérifie que le token existe après le "Bearer"
    if (!token) {
      return res.status(401).json({
        error: "Format de token invalide."
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
