import { useNavigate } from 'react-router-dom';
import { User, Gamepad2 } from 'lucide-react';
import './SearchDropdown.css';

/**
 * SearchDropdown - Dropdown des résultats de recherche
 *
 * @param {Array} games - Liste des jeux trouvés
 * @param {Array} users - Liste des utilisateurs trouvés
 * @param {boolean} loading - État de chargement
 * @param {string} query - Requête de recherche
 * @param {Function} onClose - Fermer le dropdown
 */
const SearchDropdown = ({ games, users, loading, query, onClose }) => {
  const navigate = useNavigate();

  const handleGameClick = (gameId) => {
    navigate(`/games/${gameId}`);
    onClose();
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  // Si pas de résultats et pas de loading
  const noResults = !loading && games.length === 0 && users.length === 0 && query.length >= 2;

  return (
    <div className="search-dropdown">
      {/* LOADING */}
      {loading && (
        <div className="search-dropdown__loading">
          <div className="search-dropdown__spinner"></div>
          <p>Recherche en cours...</p>
        </div>
      )}

      {/* NO RESULTS */}
      {noResults && (
        <div className="search-dropdown__empty">
          <p>Aucun résultat pour "{query}"</p>
        </div>
      )}

      {/* GAMES SECTION */}
      {!loading && games.length > 0 && (
        <div className="search-dropdown__section">
          <div className="search-dropdown__section-header">
            <Gamepad2 size={16} />
            <span>Jeux</span>
          </div>
          <div className="search-dropdown__list">
            {games.slice(0, 5).map((game) => (
              <button
                key={game.id}
                className="search-dropdown__item"
                onClick={() => handleGameClick(game.id)}
              >
                <img
                  src={game.background_image || '/placeholder-game.png'}
                  alt={game.name}
                  className="search-dropdown__item-image"
                />
                <div className="search-dropdown__item-info">
                  <p className="search-dropdown__item-name">{game.name}</p>
                  {game.released && (
                    <p className="search-dropdown__item-meta">
                      {new Date(game.released).getFullYear()}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
          {games.length > 5 && (
            <div className="search-dropdown__more">
              +{games.length - 5} autres jeux
            </div>
          )}
        </div>
      )}

      {/* USERS SECTION */}
      {!loading && users.length > 0 && (
        <div className="search-dropdown__section">
          <div className="search-dropdown__section-header">
            <User size={16} />
            <span>Utilisateurs</span>
          </div>
          <div className="search-dropdown__list">
            {users.slice(0, 5).map((user) => (
              <button
                key={user.id}
                className="search-dropdown__item"
                onClick={() => handleUserClick(user.id)}
              >
                <img
                  src={user.avatar_url || '/default-avatar.png'}
                  alt={user.username}
                  className="search-dropdown__item-avatar"
                />
                <div className="search-dropdown__item-info">
                  <p className="search-dropdown__item-name">{user.username}</p>
                  <p className="search-dropdown__item-meta">
                    Niveau {user.level}
                  </p>
                </div>
              </button>
            ))}
          </div>
          {users.length > 5 && (
            <div className="search-dropdown__more">
              +{users.length - 5} autres utilisateurs
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
