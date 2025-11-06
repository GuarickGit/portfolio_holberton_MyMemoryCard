import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReviewCard from '../../components/features/ReviewCard/ReviewCard';
import api from '../../services/api';
import './Reviews.css';

/**
 * Reviews - Page listant toutes les critiques
 * Route : /reviews
 */
const Reviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer toutes les reviews (tri par date décroissant)
      const response = await api.get('/reviews');
      setReviews(response.data.reviews || []);

    } catch (err) {
      console.error('Erreur chargement reviews:', err);
      setError('Impossible de charger les critiques.');
    } finally {
      setLoading(false);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="reviews-page__loading">
        <div className="spinner"></div>
        <p>Chargement des critiques...</p>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="reviews-page__error">
        <p>{error}</p>
        <button onClick={fetchReviews}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <div className="reviews-page__container">
        {/* HEADER */}
        <div className="reviews-page__header">
          <h1>Toutes les critiques</h1>
          <p className="reviews-page__count">
            {reviews.length} critique{reviews.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* SÉPARATEUR */}
        <div className="reviews-page__separator"></div>

        {/* GRILLE DE REVIEWS */}
        {reviews.length > 0 ? (
          <div className="reviews-page__grid">
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="reviews-page__empty">
            <p>Aucune critique pour le moment.</p>
            <button onClick={() => navigate('/games')}>
              Découvrir des jeux
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
