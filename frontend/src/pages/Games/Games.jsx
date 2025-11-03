import { useState, useEffect } from 'react';
import CollectionGameCard from '../../components/features/CollectionGameCard/CollectionGameCard';
import api from '../../services/api';
import './Games.css';

/**
 * Games - Page listant tous les jeux par popularité avec pagination
 * Route : /games
 */
const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const GAMES_PER_PAGE = 20;

  // Charger les jeux au montage
  useEffect(() => {
    fetchGames(1);
  }, []);

  /**
   * Récupère les jeux triés par popularité
   * @param {number} pageNumber - Numéro de page à charger
   * @param {boolean} append - Si true, ajoute aux jeux existants (load more)
   */
  const fetchGames = async (pageNumber, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response = await api.get('/games', {
        params: {
          limit: GAMES_PER_PAGE,
          page: pageNumber
        }
      });

      const newGames = response.data.games;

      // Si on reçoit moins de jeux que demandé, c'est qu'il n'y en a plus
      if (newGames.length < GAMES_PER_PAGE) {
        setHasMore(false);
      }

      if (append) {
        setGames(prev => [...prev, ...newGames]);
      } else {
        setGames(newGames);
      }

      setPage(pageNumber);

    } catch (err) {
      console.error('Erreur chargement jeux:', err);
      setError('Impossible de charger les jeux');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /**
   * Charge la page suivante
   */
  const handleLoadMore = () => {
    fetchGames(page + 1, true);
  };

  // LOADING INITIAL
  if (loading) {
    return (
      <div className="games-page__loading">
        <div className="spinner"></div>
        <p>Chargement des jeux...</p>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="games-page__error">
        <p>{error}</p>
        <button onClick={() => fetchGames(1)} className="games-page__retry">
          Réessayer
        </button>
      </div>
    );
  }

  // EMPTY
  if (games.length === 0) {
    return (
      <div className="games-page__empty">
        <p>Aucun jeu disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="games-page">
      <div className="games-page__container">
        {/* HEADER */}
        <div className="games-page__header">
          <h1 className="games-page__title">Tous les jeux</h1>
          <p className="games-page__subtitle">
            {games.length} jeu{games.length > 1 ? 'x' : ''} affiché{games.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* GRID DE JEUX */}
        <div className="games-page__grid">
          {games.map(game => (
            <CollectionGameCard
              key={game.id}
              game={game}
            />
          ))}
        </div>

        {/* BOUTON LOAD MORE */}
        {hasMore && (
          <div className="games-page__load-more">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="games-page__load-more-button"
            >
              {loadingMore ? (
                <>
                  <div className="spinner spinner--small"></div>
                  Chargement...
                </>
              ) : (
                'Charger plus de jeux'
              )}
            </button>
          </div>
        )}

        {/* MESSAGE FIN */}
        {!hasMore && games.length > 0 && (
          <div className="games-page__end-message">
            <p>Tous les jeux actuellement disponibles sont affichés !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;
