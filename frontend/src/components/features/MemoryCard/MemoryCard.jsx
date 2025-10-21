import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import './MemoryCard.css';

/**
 * MemoryCard - Composant réutilisable pour afficher un souvenir
 *
 * @param {Object} memory - Objet memory contenant toutes les infos
 */
const MemoryCard = ({ memory }) => {
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate(`/memories/${memory.id}`);
  };

  // Extraire l'année de la date de sortie du jeu
  const releaseYear = memory.released
    ? new Date(memory.released).getFullYear()
    : null;

  // Limiter le contenu à 150 caractères
  const truncatedContent = memory.content.length > 150
    ? memory.content.substring(0, 150) + '...'
    : memory.content;

  return (
    <div className="memory-card">
      {/* TOP SECTION : Image + Header côte à côte */}
      <div className="memory-card__top">
        {/* Image du jeu */}
        <div className="memory-card__image">
          <img
            src={memory.game_image}
            alt={memory.game_name}
          />
        </div>

        {/* Header : Avatar + Titre */}
        <div className="memory-card__header-content">
          <div className="memory-card__header">
            <img
              src={memory.avatar_url}
              alt={memory.username}
              className="memory-card__avatar"
            />
            <span className="memory-card__username">{memory.username}</span>
          </div>

          <div className="memory-card__game-info">
            <h3 className="memory-card__game-title">
              {memory.game_name}
              {releaseYear && <span className="memory-card__year">, {releaseYear}</span>}
            </h3>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION : Texte + Footer (pleine largeur) */}
      <div className="memory-card__bottom">
        <p className="memory-card__text">{truncatedContent}</p>

        <div className="memory-card__footer">
          <button
            className="memory-card__read-more"
            onClick={handleReadMore}
          >
            Lire le souvenir
          </button>

          <div className="memory-card__stats">
            <span className="memory-card__stat">
              <Heart size={16} />
              {memory.likes_count}
            </span>
            <span className="memory-card__stat">
              <MessageCircle size={16} />
              {memory.comments_count}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;
