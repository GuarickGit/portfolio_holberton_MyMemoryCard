import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isValidEmail, isValidPassword, isValidUsername } from '../utils/validators.js'

// Import des fonctions du modèle User
import { createUser, findUserByEmail } from "../models/User.js";

/**
 * Inscription d'un nouvel utilisateur
 * @route POST /auth/signup
 */
export const signup = async (req, res) => {
  try {
    // Récupère les données du body
    const { username, email, password } = req.body;

    // Validation des champs
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Tous les champs sont requis."
      });
    }

    // Validation du format username
    if (!isValidUsername(username)) {
      return res.status(400).json({
        error: "Le pseudo doit contenir entre 3 et 30 caractères (lettres, chiffres, underscore, tiret uniquement)."
      });
    }

    // Validation du format email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Format d'email invalide."
      });
    }

    // Validation du mot de passe
    if (!isValidPassword(password)) {
      return res.status(400).json({
        error: "Le mot de passe doit contenir au moins 6 caractères."
      });
    }

    // Vérifie si l'email existe déjà
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ //409 = Conflit de ressources
        error: "Cet email est déjà utilisé."
      });
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // Créer l'utilisateur en DB
    const newUser = await createUser(username, email, passwordHash);

    // Générer un JWT Token
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Renvoyer la réponse avec le token et les infos user
    res.status(201).json({
      message: "Utilisateur crée avec succès",
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar_url: newUser.avatar_url,
        banner_url: newUser.banner_url,
        bio: newUser.bio
      }
    });

  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors de l'inscription :", error);

    // Si erreur de contrainte unique (email ou username déjà utilisé)
    if (error.code === "23505") { // Code d'erreur PostgreSQL pour "contrainte unique violée"
      return res.status(409).json({
        error: "Cet email ou ce nom d'utilisateur est déjà utilisé"
      });
    }

    // Erreur serveur générique
    res.status(500).json({
      error: "Erreur serveur lors de l'inscription"
    });
  }
};


/**
 * Connexion d'un utilisateur existant
 * @route POST /auth/login
 */
export const login = async (req, res) => {
  try {
    // Récupérer les données du body
    const { email, password } = req.body;

    // Validation basique
    if (!email || !password) {
      return res.status(400).json({
        error: "Email et mot de passe requis"
      });
    }

    // Trouver l'utilisateur par email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: "Email ou mot de passe incorrect"
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Email ou mot de passe incorrect"
      });
    }

    // Générer un JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Renvoyer la réponse avec le token et les infos user
    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        banner_url: user.banner_url,
        bio: user.bio
      }
    });

  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({
      error: "Erreur serveur lors de la connexion"
    });
  }
};

/**
 * Déconnexion d'un utilisateur
 * @route POST /auth/logout
 * Note : En JWT, la déconnexion est gérée côté client (suppression du token)
 * Cette route sert surtout pour la cohérence de l'API
 */
export const logout = async (req, res) => {
  try {
    // En JWT, on ne peut pas "invalider" un token côté serveur
    // La déconnexion se fait côté client en supprimant le token

    res.status(200).json({
      message: "Déconnexion réussie"
    });

  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error);
    res.status(500).json({
      error: "Erreur serveur lors de la déconnexion"
    });
  }
};
