import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Star, MessageCircle, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button/Button';
import LikeButton from '../../components/features/LikeButton/LikeButton';
import CommentSection from '../../components/features/Comments/CommentSection/CommentSection';
import api from '../../services/api';
import './ReviewDetail.css';

/**
 * ReviewDetail - Page détaillée d'une review
 * Route : /reviews/:id
 */
const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);

  // Charger la review
  useEffect(() => {
    fetchReview();
  }, [id]);

  const fetchReview = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reviews/${id}`);
      setReview(response.data.review);
    } catch (err) {
      console.error('Erreur chargement review:', err);
      setError('Impossible de charger la critique.');
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur est le propriétaire
  const isOwner = user && review && user.id === review.user_id;

  // Callback pour mettre à jour le compteur de commentaires - CORRIGÉ
  const handleCommentCountChange = (delta) => {
    setReview(prev => ({
      ...prev,
      comments_count: parseInt(prev.comments_count || 0) + delta
    }));
  };

  // Générer les étoiles
  const renderStars = () => {
    if (!review) return null;
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={20}
        fill={index < review.rating ? '#FFD700' : 'none'}
        stroke={index < review.rating ? '#FFD700' : '#666'}
      />
    ));
  };

  // LOADING
  if (loading) {
    return (
      <div className="review-detail__loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  // ERROR
  if (error || !review) {
    return (
      <div className="review-detail__error">
        <p>{error || 'Critique introuvable'}</p>
        <Button onClick={() => navigate(-1)}>Retour</Button>
      </div>
    );
  }

  return (
    <div className="review-detail">
      <div className="review-detail__container">
        {/* BOUTON RETOUR */}
        <button className="review-detail__back" onClick={() => navigate(-1)}>
          ← Retour
        </button>

        {/* HEADER - Infos du jeu */}
        <div
          className="review-detail__game"
          style={{
            backgroundImage: `url(${review.background_image || review.game_image})`
          }}
        >
          <img
            src={review.game_image}
            alt={review.game_name}
            className="review-detail__game-cover"
          />
          <div className="review-detail__game-info">
            <h1>{review.game_name}</h1>
            {review.year && <p className="review-detail__year">{review.year}</p>}
          </div>
        </div>

        {/* CARD DE LA REVIEW */}
        <div className="review-detail__card">
          {/* HEADER - Avatar + Username + Date */}
          <div className="review-detail__header">
            <div className="review-detail__author">
              <img
                src={review.avatar_url || '/default-avatar.png'}
                alt={review.username}
                className="review-detail__avatar"
              />
              <div>
                <h3 className="review-detail__username">{review.username}</h3>
                <p className="review-detail__date">
                  {new Date(review.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* BOUTON MODIFIER */}
            {isOwner && (
              <Button
                variant="secondary"
                onClick={() => navigate(`/reviews/${id}/edit`)}
              >
                Modifier
              </Button>
            )}
          </div>

          {/* TITRE */}
          <h2 className="review-detail__title">{review.title}</h2>

          {/* RATING */}
          <div className="review-detail__rating">
            {renderStars()}
            <span className="review-detail__rating-text">
              {review.rating}/5
            </span>
          </div>

          {/* SPOILER WARNING */}
          {review.spoiler && !spoilerRevealed && (
            <div className="review-detail__spoiler-warning">
              <AlertTriangle size={20} />
              <p>Cette critique contient des spoilers</p>
              <button
                className="review-detail__reveal-button"
                onClick={() => setSpoilerRevealed(true)}
              >
                Afficher quand même
              </button>
            </div>
          )}

          {/* CONTENT */}
          {(!review.spoiler || spoilerRevealed) && (
            <div className="review-detail__content">
              <p>{review.content}</p>
            </div>
          )}

          {/* FOOTER - Stats AVEC LIKEBUTTON */}
          <div className="review-detail__stats">
            <LikeButton
              targetType="review"
              targetId={review.id}
              initialLikesCount={review.likes_count || 0}
              size={20}
            />
            <div className="review-detail__stat">
              <MessageCircle size={20} />
              <span>{review.comments_count || 0} commentaire{review.comments_count > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* SECTION COMMENTAIRES - AVEC CALLBACK */}
        <CommentSection
          targetType="review"
          targetId={id}
          onCommentCountChange={handleCommentCountChange}
        />
      </div>
    </div>
  );
};

export default ReviewDetail;
