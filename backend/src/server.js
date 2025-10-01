// Imports
import express from "express";
import cors from "cors";
import dotenv from "dotenv"; // Pour lire les variables du fichier .env

//Configuration
dotenv.config() // Chargement des variables d'environnement AVANT tout le reste
const app = express();
const PORT = process.env.PORT || 5000; // Définition du port (depuis .env ou 5000 par défaut)

// MIDDLEWARE CORS : Autorise les requêtes depuis le frontend
app.use(cors({
  origin: process.env.FRONTEND_URL, // URL autorisée (http://localhost:5173)
  credentials: true, // Permet l'envoi de cookies (pour les sessions si besoin)
}));

// MIDDLEWARE JSON : transforme le body JSON en objet JavaScript
app.use(express.json());

// MIDDLEWARE URL-ENCODED : gère les données de formulaires HTML
app.use(express.urlencoded({ extended: true }));

// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "🎮 MyMemoryCard API démarrée !",
    version: "1.0.0",
    endpoints: {
      auth: "/auth/signup, /auth/login, /auth/logout"
    }
  });
});

// Import des routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Utilisation des routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
// Gestion des routes inexistantes (404)
app.use((req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
    requestedUrl: req.originalUrl
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Le serveur est lancé sur http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🎮 Prêt à gérer les requêtes !`);
});
