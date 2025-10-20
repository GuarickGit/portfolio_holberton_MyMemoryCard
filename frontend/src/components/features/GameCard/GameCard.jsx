import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import './GameCard.css';

/**
 * GameCard - Composant réutilisable pour afficher une carte de jeu
 *
 * @param {Object} game - Objet jeu contenant toutes les infos
 * @param {Number} game.rawg_id - ID RAWG du jeu (pour la navigation)
 * @param {String} game.name - Nom du jeu
 * @param {String} game.cover_url - URL de la jaquette IGDB
 * @param {String} game.rating - Note du jeu (0-5)
 * @param {String} game.released - Date de sortie (format ISO)
 */
const GameCard = ({ game }) => {
  const navigate = useNavigate();

  // Fonction pour gérer le click sur la carte
  const handleClick = () => {
    navigate(`/games/${game.rawg_id}`);
  };

  // Extrait l'année de la date de sortie
  // "2013-09-16T22:00:00.000Z" → "2013"
  const releaseYear = game.released
    ? new Date(game.released).getFullYear()
    : 'N/A';

  // Formate la note (afficher 1 décimale)
  // "4.47" ou 4.47 → "4.5"
  const formattedRating = game.rating
    ? parseFloat(game.rating).toFixed(1)
    : 'N/A';

  return (
    <div className="game-card" onClick={handleClick}>
      {/* Image de la jaquette */}
      <div className="game-card__image-container">
        {game.cover_url ? (
          <img
            src={game.cover_url}
            alt={`${game.name} cover`}
            className="game-card__image"
          />
        ) : (
          <div className="game-card__placeholder">
            <span>Pas d'image</span>
          </div>
        )}
      </div>

      {/* Overlay avec les infos */}
      <div className="game-card__overlay">
        <h3 className="game-card__title">{game.name}</h3>

        <div className="game-card__info">
          <span className="game-card__rating">
			<Star size={14} fill="#FFD700" color="#FFD700" />
            {formattedRating}
		  </span>
          <span className="game-card__year">{releaseYear}</span>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
