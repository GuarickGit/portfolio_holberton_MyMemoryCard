import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Star, Heart, MessageCircle, AlertTriangle } from 'lucide-react';
import api from '../../../services/api';
import './ReviewCard.css';

const ReviewCard = ({ review }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);

  // États pour les likes
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(review.likes_count || 0);
  const [likePending, setLikePending] = useState(false);

  // Vérifier si l'utilisateur connecté est le propriétaire
  const isOwner = user && user.id === review.user_id;

  // Vérifier si l'utilisateur a déjà liké au chargement
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!user) return;

      try {
        const response = await api.get(`/likes/review/${review.id}/check`);
        setLiked(response.data.hasLiked);
      } catch (error) {
        console.error('Erreur vérification like:', error);
      }
    };

    checkIfLiked();
  }, [review.id, user]);

  const handleRevealSpoiler = () => {
    setSpoilerRevealed(true);
  };

  const handleEdit = () => {
    navigate(`/reviews/${review.id}/edit`);
  };

  const handleProfileClick = () => {
    navigate(`/profile/${review.user_id}`);
  };

  const handleReadMore = () => {
    navigate(`/reviews/${review.id}`);
  };

  // Toggle du like
  const handleLikeToggle = async (e) => {
    e.stopPropagation(); // Empêche la propagation vers la card

    if (!user) {
      navigate('/login');
      return;
    }

    if (likePending) return; // Évite les double-clics

    try {
      setLikePending(true);

      const response = await api.post('/likes/toggle', {
        targetType: 'review',
        targetId: review.id
      });

      // Mise à jour de l'état local
      setLiked(response.data.liked);
      setLikesCount(response.data.likesCount);

    } catch (error) {
      console.error('Erreur toggle like:', error);
      // TODO: Afficher un message d'erreur à l'utilisateur
    } finally {
      setLikePending(false);
    }
  };

  // Génère les étoiles
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        fill={index < review.rating ? '#FFD700' : 'none'}
        stroke={index < review.rating ? '#FFD700' : '#666'}
      />
    ));
  };

  return (
    <div className="review-card">
      {/* TOP SECTION */}
      <div className="review-card__top">
        {/* IMAGE */}
        <div className="review-card__image">
          <img src={review.game_image} alt={review.game_name} />
        </div>

        {/* HEADER CONTENT */}
        <div className="review-card__header-content">
          {/* HEADER - Avatar + Username */}
          <div className="review-card__header">
            <img
              src={review.avatar_url || '/default-avatar.png'}
              alt={review.username}
              className="review-card__avatar"
              onClick={handleProfileClick}
              style={{ cursor: 'pointer' }}
            />
            <span
              className="review-card__username"
              onClick={handleProfileClick}
              style={{ cursor: 'pointer' }}
            >
              {review.username}
            </span>
          </div>

          {/* GAME INFO */}
          <div className="review-card__game-info">
            <h3 className="review-card__game-title">
              {review.game_name}
              {review.year && <span className="review-card__year"> ({review.year})</span>}
            </h3>
          </div>

          {/* RATING */}
          <div className="review-card__rating">
            {renderStars()}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="review-card__bottom">
        {/* TITRE */}
        <h4 className="review-card__title">{review.title}</h4>

        {/* SPOILER BADGE */}
        {review.spoiler && !spoilerRevealed && (
          <div className="review-card__spoiler-badge">
            <AlertTriangle size={14} />
            Contient des spoilers
          </div>
        )}

        {/* CONTENT WRAPPER */}
        <div className="review-card__content-wrapper">
          <div className={`review-card__content ${review.spoiler && !spoilerRevealed ? 'review-card__content--blurred' : ''}`}>
            <p className="review-card__text">{review.content}</p>
          </div>

          {/* BOUTON RÉVÉLER SPOILER */}
          {review.spoiler && !spoilerRevealed && (
            <button
              className="review-card__reveal-spoiler"
              onClick={handleRevealSpoiler}
            >
              Révéler le spoiler
            </button>
          )}
        </div>

        {/* FOOTER */}
        <div className="review-card__footer">
          <div className="review-card__footer-left">
            <button
              className="review-card__read-more"
              onClick={handleReadMore}
            >
              Lire la critique
            </button>

            {/* BOUTON MODIFIER - Visible seulement si propriétaire */}
            {isOwner && (
              <button className="review-card__edit-button" onClick={handleEdit}>
                Modifier
              </button>
            )}
          </div>

          {/* STATS */}
          <div className="review-card__stats">
            {/* BOUTON LIKE - Maintenant cliquable */}
            <button
              className={`review-card__stat review-card__stat--like ${liked ? 'liked' : ''} ${likePending ? 'pending' : ''}`}
              onClick={handleLikeToggle}
              disabled={likePending}
            >
              <Heart
                size={16}
                fill={liked ? '#ff6b6b' : 'none'}
                stroke={liked ? '#ff6b6b' : '#666'}
              />
              <span>{likesCount}</span>
            </button>

            <div className="review-card__stat">
              <MessageCircle size={16} />
              <span>{review.comments_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
