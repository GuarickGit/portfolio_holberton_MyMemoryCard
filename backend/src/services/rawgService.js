import axios from 'axios';
import dotenv from "dotenv";

dotenv.config(); // Charge les variables du fichier .env

const RAWG_API_KEY = process.env.RAWG_API_KEY; // Clé API RAWG depuis .env
const RAWG_BASE_URL = 'https://api.rawg.io/api'; // URL de base de l'API RAWG

/**
 * Recherche des jeux sur l'API RAWG
 * @param {string} query - Le terme de recherche (ex: "zelda")
 * @param {number} page - Numéro de page (par défaut 1)
 * @param {number} pageSize - Nombre de résultats par page (par défaut 20)
 * @returns {Object|null} - Objet contenant { count, results } ou null si erreur
 */
export const searchGames = async (query, page = 1, pageSize = 20) => {
  try {
    // Appel GET à l'API RAWG avec axios
    // axios construit automatiquement l'URL avec les paramètres
    const response = await axios.get(`${RAWG_BASE_URL}/games`, {
      params: {
        key: RAWG_API_KEY,      // Clé API pour l'authentification
        search: query,          // Terme de recherche
        page: page,             // Numéro de page
        page_size: pageSize     // Nombre de résultats par page
      }
    });

    // axios transforme automatiquement la réponse en JSON
    // response.data contient directement l'objet { count, results }
    return response.data;

  } catch (error) {
    // En cas d'erreur (API down, mauvaise clé, etc.)
    // error.response?.data contient les détails de l'erreur de l'API si disponible
    console.error('Erreur dans searchGames:', error.response?.data || error.message);
    return null; // Retourne null au lieu de crasher l'app
  }
};

/**
 * Récupère les détails complets d'un jeu depuis l'API RAWG
 * @param {number} rawgId - L'ID du jeu chez RAWG
 * @returns {Object|null} - Objet contenant toutes les infos du jeu ou null si erreur
 */
export const getGameDetails = async (rawgId) => {
  try {
    // Appel GET à l'API RAWG pour un jeu spécifique
    // L'ID du jeu est directement dans l'URL : /games/{rawgId}
    const response = await axios.get(`${RAWG_BASE_URL}/games/${rawgId}`, {
      params: {
        key: RAWG_API_KEY // Clé API pour l'authentification
      }
    });

    // Retourne les données du jeu (nom, description, rating, plateformes, etc.)
    return response.data;

  } catch (error) {
    // En cas d'erreur (jeu introuvable, API down, etc.)
    console.error('Erreur dans getGameDetails:', error.response?.data || error.message);
    return null; // Retourne null au lieu de crasher l'app
  }
};
