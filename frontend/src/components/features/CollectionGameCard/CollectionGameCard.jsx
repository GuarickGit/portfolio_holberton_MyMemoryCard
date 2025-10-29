import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import './CollectionGameCard.css';

/**
 * CollectionGameCard - Card spécifique pour afficher un jeu dans la collection
 * Affiche la note personnelle de l'utilisateur et le status
 *
 * @param {Object} game - Les données du jeu depuis la collection
 */
const CollectionGameCard = ({ game }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/games/${game.rawg_id}`);
  };

  // Génère les étoiles pour la note utilisateur
  const renderStars = () => {
    if (!game.user_rating) return null;

    return (
      <div className="collection-game-card__rating">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={14}
            fill={index < game.user_rating ? '#FFD700' : 'none'}
            stroke={index < game.user_rating ? '#FFD700' : '#666'}
          />
        ))}
      </div>
    );
  };

  // Badge de status
  const getStatusBadge = () => {
    const statusConfig = {
      not_started: { label: 'Pas commencé', color: '#666' },
      playing: { label: 'En cours', color: '#4CAF50' },
      completed: { label: 'Terminé', color: '#2196F3' },
      abandoned: { label: 'Abandonné', color: '#f44336' }
    };

    const config = statusConfig[game.status] || { label: game.status, color: '#666' };

    return (
      <div
        className="collection-game-card__status-badge"
        style={{ backgroundColor: config.color }}
      >
        {config.label}
      </div>
    );
  };

  // Extraire l'année
  const year = game.released ? new Date(game.released).getFullYear() : null;

  return (
    <div className="collection-game-card" onClick={handleClick}>
      {/* IMAGE CONTAINER */}
      <div className="collection-game-card__image-container">
        {game.cover_url || game.background_image ? (
          <img
            src={game.cover_url || game.background_image}
            alt={game.name}
            className="collection-game-card__image"
          />
        ) : (
          <div className="collection-game-card__placeholder">
            Pas d'image
          </div>
        )}

        {/* STATUS BADGE - En overlay en haut */}
        {getStatusBadge()}
      </div>

      {/* OVERLAY AU SURVOL */}
      <div className="collection-game-card__overlay">
        <h3 className="collection-game-card__title">{game.name}</h3>

        <div className="collection-game-card__info">
          {/* RATING UTILISATEUR */}
          {renderStars()}

          {/* ANNÉE */}
          {year && (
            <span className="collection-game-card__year">{year}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionGameCard;
