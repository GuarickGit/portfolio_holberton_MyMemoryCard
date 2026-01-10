// Imports
import express from "express";
import cors from "cors";
import dotenv from "dotenv"; // Pour lire les variables du fichier .env
import cookieParser from "cookie-parser"

// Import des routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import gameRoutes from './routes/gameRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import followRoutes from './routes/followRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

//Configuration
dotenv.config() // Chargement des variables d'environnement AVANT tout le reste

const app = express();
const PORT = process.env.PORT

// MIDDLEWARE CORS : Autorise les requêtes depuis le frontend
app.use(cors({
  origin: process.env.FRONTEND_URL, // URL autorisée (http://localhost:5173)
  credentials: true, // Permet l'envoi de cookies
}));

// MIDDLEWARE JSON : transforme le body JSON en objet JavaScript
app.use(express.json());

// MIDDLEWARE URL-ENCODED : gère les données de formulaires HTML
app.use(express.urlencoded({ extended: true }));

// MIDDLEWARE COOKIE-PARSER : pour lire les cookies
app.use(cookieParser());

// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "API MyMemoryCard démarrée !",
    version: "1.0.0",
  });
});

// Utilisation des routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/games", gameRoutes);
app.use("/collections", collectionRoutes);
app.use("/memories", memoryRoutes);
app.use('/reviews', reviewRoutes);
app.use('/likes', likeRoutes);
app.use('/comments', commentRoutes);
app.use('/follows', followRoutes);
app.use('/admin', adminRoutes);

// Gestion des routes inexistantes (404)
app.use((req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
    requestedUrl: req.originalUrl
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Le serveur est lancé sur http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Prêt à gérer les requêtes !`);
});
