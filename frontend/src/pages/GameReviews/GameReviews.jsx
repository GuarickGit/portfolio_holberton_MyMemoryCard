import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewCard from '../../components/features/ReviewCard/ReviewCard';
import Button from '../../components/ui/Button/Button';
import api from '../../services/api';
import './GameReviews.css';

/**
 * GameReviews - Page affichant toutes les reviews d'un jeu
 * Route : /games/:rawgId/reviews
 *
 * Fonctionnalités :
 * - Affiche header avec infos du jeu
 * - Liste toutes les reviews
 * - Pagination (load more)
 * - Tri (recent / top_rated)
 */
const GameReviews = () => {
  const { rawgId } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [sort, setSort] = useState('recent'); // 'recent' ou 'top_rated'

  const LIMIT = 12; // Nombre de reviews par page

  // Charger le jeu et les premières reviews
  useEffect(() => {
    // Réinitialiser les reviews quand le sort change
    setReviews([]);
    setOffset(0);
    fetchInitialData();
  }, [rawgId, sort]);

  /**
   * Charge les infos du jeu + premières reviews
   */
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Appels parallèles
      const [gameResponse, reviewsResponse] = await Promise.all([
        api.get(`/games/${rawgId}`),
        api.get(`/reviews/game/${rawgId}?limit=${LIMIT}&offset=0&sort=${sort}`)
      ]);

      setGame(gameResponse.data.game);
      setReviews(reviewsResponse.data.reviews);
      setHasMore(reviewsResponse.data.reviews.length === LIMIT);
      setOffset(LIMIT);

    } catch (err) {
      console.error('Erreur chargement reviews:', err);
      setError('Impossible de charger les critiques du jeu.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Charge plus de reviews (pagination)
   */
  const loadMoreReviews = async () => {
    try {
      setLoadingMore(true);

      const response = await api.get(
        `/reviews/game/${rawgId}?limit=${LIMIT}&offset=${offset}&sort=${sort}`
      );

      const newReviews = response.data.reviews;

      setReviews(prev => [...prev, ...newReviews]);
      setHasMore(newReviews.length === LIMIT);
      setOffset(prev => prev + LIMIT);

    } catch (err) {
      console.error('Erreur chargement plus de reviews:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  /**
   * Change le tri
   */
  const handleSortChange = (newSort) => {
    // Ne rien faire si on clique sur le filtre actif
    if (newSort === sort) return;

    setSort(newSort);
  };

  // LOADING
  if (loading) {
    return (
      <div className="game-reviews__loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  // ERROR
  if (error || !game) {
    return (
      <div className="game-reviews__error">
        <p>{error || 'Jeu introuvable'}</p>
        <Button onClick={() => navigate('/games')}>
          Retour aux jeux
        </Button>
      </div>
    );
  }

  return (
    <div className="game-reviews">
      {/* HEADER */}
      <div className="game-reviews__header">
        <button
          className="game-reviews__back"
          onClick={() => navigate(`/games/${rawgId}`)}
        >
          ← Retour au jeu
        </button>

        <div className="game-reviews__info">
          <img
            src={game.cover_url || game.background_image}
            alt={game.name}
            className="game-reviews__cover"
          />
          <div className="game-reviews__text">
            <h1>Critiques</h1>
            <h2>{game.name}</h2>
            <p className="game-reviews__count">
              {reviews.length} critique{reviews.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* FILTRES */}
        {reviews.length > 0 && (
          <div className="game-reviews__filters">
            <button
              className={`game-reviews__filter ${sort === 'recent' ? 'active' : ''}`}
              onClick={() => handleSortChange('recent')}
            >
              Plus récentes
            </button>
            <button
              className={`game-reviews__filter ${sort === 'top_rated' ? 'active' : ''}`}
              onClick={() => handleSortChange('top_rated')}
            >
              Meilleures notes
            </button>
          </div>
        )}
      </div>

      {/* LISTE DES REVIEWS */}
      <div className="game-reviews__content">
        {reviews.length > 0 ? (
          <>
            <div className="game-reviews__grid">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* BOUTON LOAD MORE */}
            {hasMore && (
              <div className="game-reviews__load-more">
                <Button
                  onClick={loadMoreReviews}
                  disabled={loadingMore}
                  variant="secondary"
                >
                  {loadingMore ? 'Chargement...' : 'Voir plus de critiques'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="game-reviews__empty">
            <p>Aucune critique pour ce jeu.</p>
            <Button onClick={() => navigate(`/games/${rawgId}/review/new`)}>
              Écrire une critique
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameReviews;
