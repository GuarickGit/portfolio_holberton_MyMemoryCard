import axios from 'axios';

// URL de base de l'API backend
const API_URL = 'http://localhost:5000';

/**
 * Instance axios configurée pour toute l'application
 * - baseURL : URL du backend
 * - headers : Content-Type par défaut
 * - timeout : Timeout de 10 secondes
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes max par requête
});

/**
 * INTERCEPTEUR REQUEST
 * Ajoute automatiquement le token JWT à TOUTES les requêtes si l'user est connecté
 */
api.interceptors.request.use(
  (config) => {
    // Récupère le token depuis localStorage
    const token = localStorage.getItem('token');

    // Si token existe, l'ajoute au header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTEUR RESPONSE
 * Gère automatiquement les erreurs communes (401, 403, 500, etc.)
 */
api.interceptors.response.use(
  (response) => {
    // Si succès, retourne directement la réponse
    return response;
  },
  (error) => {
    // Si erreur réseau (backend down)
    if (!error.response) {
      console.error('Erreur réseau : Backend inaccessible');
      return Promise.reject(new Error('Impossible de contacter le serveur'));
    }

    // Gestion des erreurs HTTP
    const { status, data } = error.response;

    switch (status) {
      case 401:
        // Token invalide ou expiré
        console.error('Non autorisé - Token invalide');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Ne pas rediriger si déjà sur la home
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        break;

      case 403:
        console.error('Accès refusé');
        break;

      case 404:
        console.error('Ressource introuvable');
        break;

      case 500:
        console.error('Erreur serveur');
        break;

      default:
        console.error(`Erreur ${status}:`, data?.error || 'Erreur inconnue');
    }

    // Retourne l'erreur formatée
    return Promise.reject(data?.error || error.message || 'Une erreur est survenue');
  }
);

/**
 * FONCTIONS D'AUTHENTIFICATION
 * Conservées pour rétrocompatibilité avec le code existant
 */

/**
 * Connexion utilisateur
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>}
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // { token, user }
  } catch (error) {
    throw error;
  }
};

/**
 * Inscription utilisateur
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>}
 */
export const signup = async (username, email, password) => {
  try {
    const response = await api.post('/auth/signup', { username, email, password });
    return response.data; // { token, user }
  } catch (error) {
    throw error;
  }
};

/**
 * Export par défaut de l'instance axios
 * Utilisable partout dans l'app : import api from '@/services/api'
 */
export default api;
