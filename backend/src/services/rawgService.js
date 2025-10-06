import dotenv from "dotenv"; // Pour lire le .env

dotenv.config(); // Charge les variables du fichier .env dans process.env

const RAWG_API_KEY = process.env.RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

/**
 * Recherche des jeux sur l'API RAWG
 * @param {string} query - Le terme de recherche (ex: "zelda")
 * @param {number} page - Numéro de page (par défaut 1)
 * @param {number} pageSize - Nombre de résultats par page (par défaut 20)
 * @returns {Object|null} - Objet contenant { count, results } ou null si erreur
 */
export const searchGames = async (query, page = 1, pageSize = 20) => {
  try {
    // Construction de l'URL avec les paramètres
    const url = `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${query}&page=${page}&page_size=${pageSize}`;

    // Appel à l'API RAWG
    const response = await fetch(url);

    // Vérifier si la requête a réussi
    if (!response.ok) {
      throw new Error(`Erreur RAWG API: ${response.status}`);
    }

    // Convertir la réponse en JSON
    const data = await response.json();

    // Retourner les données
    return data;

  } catch (error) {
    console.error('Erreur dans searchGames: ', error.message);
    return null;
  }
};

/**
 * Récupère les détails complets d'un jeu depuis l'API RAWG
 * @param {number} rawgId - L'ID du jeu chez RAWG
 * @returns {Object|null} - Objet contenant toutes les infos du jeu ou null si erreur
 */
export const getGameDetails = async (rawgId) => {
  try {
    // Construction de l'URL pour un jeu spécifique
    const url = `${RAWG_BASE_URL}/games/${rawgId}?key=${RAWG_API_KEY}`;

    // Appel à l'API RAWG
    const response = await fetch(url);

    // Vérifier si la requête a réussi
    if (!response.ok) {
      throw new Error(`Erreur RAWG API: ${response.status}`);
    }

    // Convertir la réponse en JSON
    const data = await response.json();

    // Retourner les données
    return data;

  } catch (error) {
    console.error('Erreur dans getGameDetails:', error.message);
    return null;
  }
};
