import axios from 'axios';

/**
 * Service IGDB - Récupération des covers de jeux
 * Utilise l'authentification OAuth Twitch
 */

// Cache du token en mémoire
let cachedToken = null;
let tokenExpiration = null;

/**
 * Récupère un token d'accès OAuth depuis Twitch
 * Le token est caché en mémoire pour éviter de le redemander à chaque requête
 * @returns {String} Access token
 */
const getAccessToken = async () => {
  // Si on a déjà un token valide, on le retourne
  if (cachedToken && tokenExpiration && Date.now() < tokenExpiration) {
    return cachedToken;
  }

  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials'
      }
    });

    // Stocke le token et sa date d'expiration
    cachedToken = response.data.access_token;
    // Le token expire généralement après 60 jours, on le met à 59 jours pour être sûr
    tokenExpiration = Date.now() + (59 * 24 * 60 * 60 * 1000);

    return cachedToken;

  } catch (error) {
    console.error('Erreur lors de la récupération du token Twitch:', error.response?.data || error.message);
    throw new Error('Impossible de récupérer le token d\'authentification IGDB');
  }
};

/**
 * Recherche une cover de jeu sur IGDB par son nom
 * @param {String} gameName - Nom du jeu
 * @returns {String|null} URL de la cover ou null si non trouvée
 */
export const getCoverByGameName = async (gameName) => {
  try {
    const token = await getAccessToken();

    // Recherche du jeu sur IGDB
    const gamesResponse = await axios.post(
      'https://api.igdb.com/v4/games',
      `search "${gameName}"; fields name,cover; limit 1;`,
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    // Si aucun jeu trouvé
    if (!gamesResponse.data || gamesResponse.data.length === 0) {
      console.log(`Aucun jeu trouvé sur IGDB pour: ${gameName}`);
      return null;
    }

    const game = gamesResponse.data[0];

    // Si le jeu n'a pas de cover
    if (!game.cover) {
      console.log(`Pas de cover trouvée pour: ${gameName}`);
      return null;
    }

    // Récupère les détails de la cover
    const coverResponse = await axios.post(
      'https://api.igdb.com/v4/covers',
      `fields url; where id = ${game.cover};`,
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!coverResponse.data || coverResponse.data.length === 0) {
      return null;
    }

    // IGDB retourne une URL avec // au début, on ajoute https:
    let coverUrl = coverResponse.data[0].url;

    // Remplace t_thumb par t_cover_big pour avoir une meilleure qualité
    coverUrl = coverUrl.replace('t_thumb', 't_cover_big');

    // Ajouter https: si nécessaire
    if (coverUrl.startsWith('//')) {
      coverUrl = `https:${coverUrl}`;
    }

    console.log(`Cover trouvée pour ${gameName}: ${coverUrl}`);
    return coverUrl;

  } catch (error) {
    console.error('Erreur lors de la récupération de la cover IGDB:', error.response?.data || error.message);
    return null; // On retourne null plutôt que de crash l'app
  }
};

export default {
  getCoverByGameName
};
