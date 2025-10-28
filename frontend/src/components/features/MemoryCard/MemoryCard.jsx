import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, AlertTriangle } from 'lucide-react';
import './MemoryCard.css';

/**
 * MemoryCard - Composant réutilisable pour afficher un souvenir
 *
 * @param {Object} memory - Objet memory contenant toutes les infos
 */
const MemoryCard = ({ memory }) => {
  const navigate = useNavigate();
  const [showSpoiler, setShowSpoiler] = useState(false);

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

      {/* BOTTOM SECTION : Titre + Texte + Footer */}
      <div className="memory-card__bottom">
        {/* TITRE DU SOUVENIR */}
        {memory.title && (
          <h4 className="memory-card__title">{memory.title}</h4>
        )}

        {/* BADGE SPOILER */}
        {memory.spoiler && (
          <div className="memory-card__spoiler-badge">
            <AlertTriangle size={14} />
            <span>Contient des spoilers</span>
          </div>
        )}

        {/* TEXTE (flouté si spoiler) - Position relative pour le bouton */}
        <div className="memory-card__content-wrapper">
          <div className={`memory-card__content ${memory.spoiler && !showSpoiler ? 'memory-card__content--blurred' : ''}`}>
            <p className="memory-card__text">{truncatedContent}</p>
          </div>

          {/* Bouton révéler spoiler (DEHORS du div flouté) */}
          {memory.spoiler && !showSpoiler && (
            <button
              className="memory-card__reveal-spoiler"
              onClick={(e) => {
                e.stopPropagation();
                setShowSpoiler(true);
              }}
            >
              Afficher les spoilers
            </button>
          )}
        </div>

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
