import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GameHero from '../../components/features/GameDetails/GameHero/GameHero';
import GameInfo from '../../components/features/GameDetails/GameInfo/GameInfo';
import GameContent from '../../components/features/GameDetails/GameContent/GameContent';
import Button from '../../components/ui/Button/Button';
import api from '../../services/api';
import './GameDetails.css';

/**
 * GameDetails - Page détaillée d'un jeu
 * Affiche : bannière, infos, actions, reviews, memories
 *
 * Route : /games/:rawgId
 */
const GameDetails = () => {
  const { rawgId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameData, setGameData] = useState({
    game: null,
    reviews: [],
    memories: [],
    collectionStatus: null // Status si le jeu est dans la collection de l'user
  });

  useEffect(() => {
    fetchGameData();
  }, [rawgId]);

  /**
   * Récupère toutes les données du jeu
   * - Infos du jeu (RAWG)
   * - Reviews (3 dernières DU JEU)
   * - Memories (3 derniers DU JEU)
   * - Status collection (si connecté)
   */
  const fetchGameData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Appels parallèles pour optimiser
      const requests = [
        api.get(`/games/${rawgId}`),
        api.get(`/reviews/game/${rawgId}?limit=3`),
        api.get(`/memories/game/${rawgId}?limit=3`)
      ];

      // Si connecté, récupérer aussi le status collection
      if (isAuthenticated) {
        requests.push(api.get(`/collections/game/${rawgId}/status`));
      }

      const responses = await Promise.all(requests);

      setGameData({
        game: responses[0].data.game,
        reviews: responses[1].data.reviews || [],
        memories: responses[2].data.memories || [],
        collectionStatus: isAuthenticated ? responses[3]?.data : null
      });

    } catch (err) {
      console.error('Erreur chargement GameDetails:', err);
      setError('Impossible de charger les informations du jeu.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Callback quand l'utilisateur ajoute/modifie le jeu dans sa collection
   */
  const handleCollectionUpdate = (newStatus) => {
    setGameData(prev => ({
      ...prev,
      collectionStatus: newStatus
    }));
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="game-details__loading">
        <div className="spinner"></div>
        <p>Chargement du jeu...</p>
      </div>
    );
  }

  // ERROR STATE
  if (error || !gameData.game) {
    return (
      <div className="game-details__error">
        <p>{error || 'Jeu introuvable'}</p>
        <Button variant="secondary" onClick={() => navigate('/games')}>
          Retour aux jeux
        </Button>
      </div>
    );
  }

  return (
    <div className="game-details">
      {/* BANNIÈRE HERO */}
      <GameHero game={gameData.game} />

      {/* INFOS + ACTIONS */}
      <GameInfo
        game={gameData.game}
        collectionStatus={gameData.collectionStatus}
        onCollectionUpdate={handleCollectionUpdate}
        isAuthenticated={isAuthenticated}
      />

      {/* REVIEWS + MEMORIES */}
      <GameContent
        reviews={gameData.reviews}
        memories={gameData.memories}
        gameId={rawgId}
      />
    </div>
  );
};

export default GameDetails;
