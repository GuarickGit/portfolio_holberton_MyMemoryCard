import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ReviewForm from '../../components/features/ReviewForm/ReviewForm';
import api from '../../services/api';
import './ReviewCreate.css';

/**
 * ReviewCreate - Page de création d'une review
 * Route : /games/:rawgId/review/new
 *
 * Fonctionnalités :
 * - Affiche les infos du jeu (cover + titre)
 * - Formulaire de création de review
 * - Validation côté client
 * - Redirection après création
 */
const ReviewCreate = () => {
  const { rawgId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirection si non connecté
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Charger les infos du jeu
  useEffect(() => {
    fetchGame();
  }, [rawgId]);

  const fetchGame = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/games/${rawgId}`);
      setGame(response.data.game);
    } catch (err) {
      console.error('Erreur chargement jeu:', err);
      setError('Impossible de charger les informations du jeu.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Callback après création réussie
   * Redirige vers la page du jeu
   */
  const handleReviewCreated = (reviewId) => {
    navigate(`/games/${rawgId}`, {
      state: { message: 'Critique publiée avec succès !' }
    });
  };

  // LOADING
  if (loading) {
    return (
      <div className="review-create__loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  // ERROR
  if (error || !game) {
    return (
      <div className="review-create__error">
        <p>{error || 'Jeu introuvable'}</p>
        <button onClick={() => navigate('/games')}>
          Retour aux jeux
        </button>
      </div>
    );
  }

  return (
    <div className="review-create">
      <div className="review-create__container">
        {/* HEADER - Infos du jeu */}
        <div className="review-create__header">
          <button
            className="review-create__back"
            onClick={() => navigate(`/games/${rawgId}`)}
          >
            ← Retour au jeu
          </button>

          <div className="review-create__game">
            <img
              src={game.cover_url || game.background_image}
              alt={game.name}
              className="review-create__cover"
            />
            <div className="review-create__game-info">
              <h1>Écrire une critique</h1>
              <h2>{game.name}</h2>
              <p className="review-create__meta">
                {game.released && new Date(game.released).getFullYear()} • {game.genres?.join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* FORMULAIRE */}
        <ReviewForm
          gameId={rawgId}
          onSuccess={handleReviewCreated}
          onCancel={() => navigate(`/games/${rawgId}`)}
        />
      </div>
    </div>
  );
};

export default ReviewCreate;
