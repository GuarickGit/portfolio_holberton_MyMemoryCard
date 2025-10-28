import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, MessageCircle, AlertTriangle } from 'lucide-react';
import './ReviewCard.css';

const ReviewCard = ({ review }) => {
  const navigate = useNavigate();
  const [showSpoiler, setShowSpoiler] = useState(false);

  const handleReadMore = () => {
    navigate(`/reviews/${review.id}`);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i <= review.rating ? '#FFD700' : 'none'}
          color={i <= review.rating ? '#FFD700' : 'var(--text-secondary)'}
        />
      );
    }
    return stars;
  };

  const releaseYear = review.released
    ? new Date(review.released).getFullYear()
    : null;

  const truncatedContent = review.content.length > 150
    ? review.content.substring(0, 150) + '...'
    : review.content;

  return (
    <div className="review-card">
      {/* TOP SECTION : Image + Header côte à côte */}
      <div className="review-card__top">
        {/* Image du jeu */}
        <div className="review-card__image">
          <img
            src={review.game_image}
            alt={review.game_name}
          />
        </div>

        {/* Header : Avatar + Titre + Rating */}
        <div className="review-card__header-content">
          <div className="review-card__header">
            <img
              src={review.avatar_url}
              alt={review.username}
              className="review-card__avatar"
            />
            <span className="review-card__username">{review.username}</span>
          </div>

          <div className="review-card__game-info">
            <h3 className="review-card__game-title">
              {review.game_name}
              {releaseYear && <span className="review-card__year">, {releaseYear}</span>}
            </h3>
          </div>

          <div className="review-card__rating">
            {renderStars()}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION : Titre + Texte + Footer */}
      <div className="review-card__bottom">
        {/* TITRE DE LA REVIEW */}
        {review.title && (
          <h4 className="review-card__title">{review.title}</h4>
        )}

        {/* BADGE SPOILER */}
        {review.spoiler && (
          <div className="review-card__spoiler-badge">
            <AlertTriangle size={14} />
            <span>Contient des spoilers</span>
          </div>
        )}

        {/* TEXTE (flouté si spoiler) - Position relative pour le bouton */}
        <div className="review-card__content-wrapper">
          <div className={`review-card__content ${review.spoiler && !showSpoiler ? 'review-card__content--blurred' : ''}`}>
            <p className="review-card__text">{truncatedContent}</p>
          </div>

          {/* Bouton révéler spoiler (DEHORS du div flouté) */}
          {review.spoiler && !showSpoiler && (
            <button
              className="review-card__reveal-spoiler"
              onClick={(e) => {
                e.stopPropagation();
                setShowSpoiler(true);
              }}
            >
              Afficher les spoilers
            </button>
          )}
        </div>

        <div className="review-card__footer">
          <button
            className="review-card__read-more"
            onClick={handleReadMore}
          >
            Lire la review
          </button>

          <div className="review-card__stats">
            <span className="review-card__stat">
              <Heart size={16} />
              {review.likes_count}
            </span>
            <span className="review-card__stat">
              <MessageCircle size={16} />
              {review.comments_count}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
