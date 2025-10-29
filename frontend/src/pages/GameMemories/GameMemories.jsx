import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemoryCard from '../../components/features/MemoryCard/MemoryCard';
import Button from '../../components/ui/Button/Button';
import api from '../../services/api';
import './GameMemories.css';

/**
 * GameMemories - Page affichant tous les souvenirs d'un jeu
 * Route : /games/:rawgId/memories
 *
 * Fonctionnalités :
 * - Affiche header avec infos du jeu
 * - Liste tous les souvenirs
 * - Pagination (load more)
 */
const GameMemories = () => {
  const { rawgId } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const LIMIT = 12; // Nombre de souvenirs par page

  // Charger le jeu et les premiers souvenirs
  useEffect(() => {
    fetchInitialData();
  }, [rawgId]);

  /**
   * Charge les infos du jeu + premiers souvenirs
   */
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Appels parallèles
      const [gameResponse, memoriesResponse] = await Promise.all([
        api.get(`/games/${rawgId}`),
        api.get(`/memories/game/${rawgId}?limit=${LIMIT}&offset=0`)
      ]);

      setGame(gameResponse.data.game);
      setMemories(memoriesResponse.data.memories);
      setHasMore(memoriesResponse.data.memories.length === LIMIT);
      setOffset(LIMIT);

    } catch (err) {
      console.error('Erreur chargement souvenirs:', err);
      setError('Impossible de charger les souvenirs du jeu.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Charge plus de souvenirs (pagination)
   */
  const loadMoreMemories = async () => {
    try {
      setLoadingMore(true);

      const response = await api.get(
        `/memories/game/${rawgId}?limit=${LIMIT}&offset=${offset}`
      );

      const newMemories = response.data.memories;

      setMemories(prev => [...prev, ...newMemories]);
      setHasMore(newMemories.length === LIMIT);
      setOffset(prev => prev + LIMIT);

    } catch (err) {
      console.error('Erreur chargement plus de souvenirs:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="game-memories__loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  // ERROR
  if (error || !game) {
    return (
      <div className="game-memories__error">
        <p>{error || 'Jeu introuvable'}</p>
        <Button onClick={() => navigate('/games')}>
          Retour aux jeux
        </Button>
      </div>
    );
  }

  return (
    <div className="game-memories">
      {/* HEADER */}
      <div className="game-memories__header">
        <button
          className="game-memories__back"
          onClick={() => navigate(`/games/${rawgId}`)}
        >
          ← Retour au jeu
        </button>

        <div className="game-memories__info">
          <img
            src={game.cover_url || game.background_image}
            alt={game.name}
            className="game-memories__cover"
          />
          <div className="game-memories__text">
            <h1>Souvenirs</h1>
            <h2>{game.name}</h2>
            <p className="game-memories__count">
              {memories.length} souvenir{memories.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* LISTE DES SOUVENIRS */}
      <div className="game-memories__content">
        {memories.length > 0 ? (
          <>
            <div className="game-memories__grid">
              {memories.map((memory) => (
                <MemoryCard key={memory.id} memory={memory} />
              ))}
            </div>

            {/* BOUTON LOAD MORE */}
            {hasMore && (
              <div className="game-memories__load-more">
                <Button
                  onClick={loadMoreMemories}
                  disabled={loadingMore}
                  variant="secondary"
                >
                  {loadingMore ? 'Chargement...' : 'Voir plus de souvenirs'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="game-memories__empty">
            <p>Aucun souvenir pour ce jeu.</p>
            <Button onClick={() => navigate(`/games/${rawgId}/memory/new`)}>
              Écrire un souvenir
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameMemories;
