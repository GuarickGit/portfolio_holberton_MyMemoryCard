import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MemoryForm from '../../components/features/MemoryForm/MemoryForm';
import api from '../../services/api';
import './MemoryCreate.css';

/**
 * MemoryCreate - Page de création d'un souvenir
 * Route : /games/:rawgId/memory/new
 *
 * Fonctionnalités :
 * - Affiche les infos du jeu (cover + titre)
 * - Formulaire de création de souvenir
 * - Validation côté client
 * - Redirection après création
 */
const MemoryCreate = () => {
  const { rawgId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
  const handleMemoryCreated = (memoryId) => {
    navigate(`/games/${rawgId}`, {
      state: { message: 'Souvenir publié avec succès !' }
    });
  };

  // Formater les genres correctement
  const formatGenres = (genres) => {
    if (!genres || genres.length === 0) return '';

    // Si c'est un array d'objets {name: "Action"}, extraire les noms
    if (Array.isArray(genres)) {
      return genres
        .map(g => typeof g === 'string' ? g : g.name)
        .filter(Boolean)
        .join(', ');
    }

    // Si c'est déjà une string, la retourner
    return genres;
  };

  // LOADING
  if (loading) {
    return (
      <div className="memory-create__loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  // ERROR
  if (error || !game) {
    return (
      <div className="memory-create__error">
        <p>{error || 'Jeu introuvable'}</p>
        <button onClick={() => navigate('/games')}>
          Retour aux jeux
        </button>
      </div>
    );
  }

  return (
    <div className="memory-create">
      <div className="memory-create__container">
        {/* HEADER - Infos du jeu */}
        <div className="memory-create__header">
          <button
            className="memory-create__back"
            onClick={() => navigate(`/games/${rawgId}`)}
          >
            ← Retour au jeu
          </button>

          <div className="memory-create__game">
            <img
              src={game.cover_url || game.background_image}
              alt={game.name}
              className="memory-create__cover"
            />
            <div className="memory-create__game-info">
              <h1>Écrire un souvenir</h1>
              <h2>{game.name}</h2>
              <p className="memory-create__meta">
                {game.released && new Date(game.released).getFullYear()}
                {game.genres && game.genres.length > 0 && (
                  <>
                    {' • '}
                    {formatGenres(game.genres)}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* FORMULAIRE */}
        <MemoryForm
          gameId={rawgId}
          onSuccess={handleMemoryCreated}
          onCancel={() => navigate(`/games/${rawgId}`)}
        />
      </div>
    </div>
  );
};

export default MemoryCreate;
