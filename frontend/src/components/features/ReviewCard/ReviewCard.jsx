import { useNavigate } from 'react-router-dom';
import { Star, Heart, MessageCircle } from 'lucide-react';
import './ReviewCard.css';

const ReviewCard = ({ review }) => {
  const navigate = useNavigate();

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

      {/* BOTTOM SECTION : Texte + Footer (pleine largeur) */}
      <div className="review-card__bottom">
        <p className="review-card__text">{truncatedContent}</p>

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
