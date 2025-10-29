import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ReviewForm from '../../components/features/ReviewForm/ReviewForm';
import api from '../../services/api';
import './ReviewEdit.css';

/**
 * ReviewEdit - Page d'édition d'une review
 * Route : /reviews/:id/edit
 *
 * Fonctionnalités :
 * - Charge la review existante
 * - Vérifie que l'utilisateur est bien le propriétaire
 * - Affiche le formulaire pré-rempli
 * - Redirection après modification
 */
const ReviewEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirection si non connecté
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Charger la review
  useEffect(() => {
    fetchReview();
  }, [id]);

  const fetchReview = async () => {
    try {
      setLoading(true);

      // Récupérer la review via l'API
      const response = await api.get(`/reviews/${id}`);
      const reviewData = response.data.review;

      // Vérifier que l'utilisateur est bien le propriétaire
      if (reviewData.user_id !== user.id) {
        setError('Vous n\'êtes pas autorisé à modifier cette critique.');
        return;
      }

      setReview(reviewData);

    } catch (err) {
      console.error('Erreur chargement review:', err);
      setError('Impossible de charger la critique.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Callback après modification réussie
   */
  const handleReviewUpdated = () => {
    navigate(`/reviews/${id}`, {
      state: { message: 'Critique modifiée avec succès !' }
    });
  };

  // LOADING
  if (loading) {
    return (
      <div className="review-edit__loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  // ERROR
  if (error || !review) {
    return (
      <div className="review-edit__error">
        <p>{error || 'Critique introuvable'}</p>
        <button onClick={() => navigate(-1)}>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="review-edit">
      <div className="review-edit__container">
        {/* HEADER */}
        <div className="review-edit__header">
          <button
            className="review-edit__back"
            onClick={() => navigate(-1)}
          >
            ← Retour
          </button>

          <div className="review-edit__game">
            <img
              src={review.game_image}
              alt={review.game_name}
              className="review-edit__cover"
            />
            <div className="review-edit__game-info">
              <h1>Modifier la critique</h1>
              <h2>{review.game_name}</h2>
            </div>
          </div>
        </div>

        {/* FORMULAIRE */}
        <ReviewForm
          gameId={review.game_id}
          initialData={{
            id: review.id,
            rating: review.rating,
            title: review.title,
            content: review.content,
            spoiler: review.spoiler
          }}
          onSuccess={handleReviewUpdated}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default ReviewEdit;
