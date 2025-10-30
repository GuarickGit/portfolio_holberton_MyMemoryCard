const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

/**
 * Recherche des jeux sur l'API RAWG (Frontend)
 * @param {string} query - Le terme de recherche
 * @param {number} pageSize - Nombre de résultats par page
 * @returns {Object} - Objet contenant { results }
 */
export const searchGames = async (query, pageSize = 10) => {
  try {
    const url = `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${query}&page_size=${pageSize}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur RAWG API: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Erreur dans searchGames:', error.message);
    throw error;
  }
};

/**
 * Récupère les détails d'un jeu
 * @param {number} rawgId - L'ID du jeu chez RAWG
 * @returns {Object} - Détails du jeu
 */
export const getGameDetails = async (rawgId) => {
  try {
    const url = `${RAWG_BASE_URL}/games/${rawgId}?key=${RAWG_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur RAWG API: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Erreur dans getGameDetails:', error.message);
    throw error;
  }
};
