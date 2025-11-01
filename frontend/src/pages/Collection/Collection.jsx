import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CollectionGameCard from '../../components/features/CollectionGameCard/CollectionGameCard';
import api from '../../services/api';
import './Collection.css';

/**
 * Collection - Page affichant tous les jeux de la collection
 * Route : /collection (ma collection)
 * Route : /profile/:userId/collection (collection d'un autre user)
 */
const Collection = () => {
  const navigate = useNavigate();
  const { userId: profileUserId } = useParams(); // ID depuis l'URL si on visite un profil
  const { isAuthenticated, user } = useAuth();

  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileUser, setProfileUser] = useState(null);

  // Filtres
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_added');

  // Détermine si c'est notre propre collection ou celle d'un autre
  const isOwnCollection = !profileUserId || (user && profileUserId === user.id);
  const targetUserId = profileUserId || (user ? user.id : null);

  // Redirection si non connecté ET qu'on essaie d'accéder à /collection
  useEffect(() => {
    if (!isAuthenticated && !profileUserId) {
      navigate('/login');
    }
  }, [isAuthenticated, profileUserId, navigate]);

  // Charger la collection
  useEffect(() => {
    if (targetUserId) {
      fetchCollection();
    }
  }, [targetUserId]);

  // Appliquer les filtres et le tri
  useEffect(() => {
    applyFiltersAndSort();
  }, [games, statusFilter, sortBy]);

  /**
   * Récupère tous les jeux de la collection
   */
  const fetchCollection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Si c'est notre propre collection
      if (isOwnCollection) {
        const response = await api.get('/collections');
        setGames(response.data.collection || []);
      } else {
        // Collection d'un autre user
        const response = await api.get(`/collections/user/${targetUserId}`);
        setGames(response.data.collection || []);

        // Récupérer les infos du user séparément
        const userResponse = await api.get(`/users/${targetUserId}`);
        setProfileUser(userResponse.data.user || null);
      }

    } catch (err) {
      console.error('Erreur chargement collection:', err);
      setError('Impossible de charger la collection.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Applique les filtres et le tri
   */
  const applyFiltersAndSort = () => {
    let result = [...games];

    // Filtre par statut
    if (statusFilter !== 'all') {
      result = result.filter(game => game.status === statusFilter);
    }

    // Tri
    switch (sortBy) {
      case 'alphabetical':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'user_rating':
        result.sort((a, b) => (b.user_rating || 0) - (a.user_rating || 0));
        break;
      case 'date_added':
      default:
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    setFilteredGames(result);
  };

  // LOADING
  if (loading) {
    return (
      <div className="collection__loading">
        <div className="spinner"></div>
        <p>Chargement de la collection...</p>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="collection__error">
        <p>{error}</p>
        <button onClick={fetchCollection}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="collection">
      {/* HEADER */}
      <div className="collection__header">
        <div className="collection__title-section">
          <h1>{isOwnCollection ? 'Ma Collection' : `Collection de ${profileUser?.username || 'Utilisateur'}`}</h1>
          <p className="collection__count">
            {filteredGames.length} jeu{filteredGames.length > 1 ? 'x' : ''}
            {statusFilter !== 'all' && ` • ${getStatusLabel(statusFilter)}`}
          </p>
        </div>

        {/* FILTRES ET TRI */}
        {games.length > 0 && (
          <div className="collection__controls">
            {/* FILTRES PAR STATUT */}
            <div className="collection__filters">
              <button
                className={`collection__filter ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                Tous
              </button>
              <button
                className={`collection__filter ${statusFilter === 'not_started' ? 'active' : ''}`}
                onClick={() => setStatusFilter('not_started')}
              >
                Pas commencé
              </button>
              <button
                className={`collection__filter ${statusFilter === 'playing' ? 'active' : ''}`}
                onClick={() => setStatusFilter('playing')}
              >
                En cours
              </button>
              <button
                className={`collection__filter ${statusFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('completed')}
              >
                Terminés
              </button>
              <button
                className={`collection__filter ${statusFilter === 'abandoned' ? 'active' : ''}`}
                onClick={() => setStatusFilter('abandoned')}
              >
                Abandonnés
              </button>
            </div>

            {/* TRI */}
            <select
              className="collection__sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date_added">Plus récents</option>
              <option value="alphabetical">Alphabétique</option>
              <option value="user_rating">Meilleures notes</option>
            </select>
          </div>
        )}
      </div>

      {/* GRILLE DE JEUX */}
      {filteredGames.length > 0 ? (
        <div className="collection__grid">
          {filteredGames.map((game) => (
            <CollectionGameCard
              key={game.rawg_id}
              game={game}
            />
          ))}
        </div>
      ) : (
        <div className="collection__empty">
          {statusFilter === 'all' ? (
            <>
              <p>{isOwnCollection ? 'Votre collection est vide.' : 'Cette collection est vide.'}</p>
              {isOwnCollection && (
                <button onClick={() => navigate('/games')}>
                  Découvrir des jeux
                </button>
              )}
            </>
          ) : (
            <p>Aucun jeu dans cette catégorie.</p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Retourne le label français du statut
 */
const getStatusLabel = (status) => {
  const labels = {
    not_started: 'Pas commencé',
    playing: 'En cours',
    completed: 'Terminés',
    abandoned: 'Abandonnés'
  };
  return labels[status] || status;
};

export default Collection;
