import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Search } from 'lucide-react';
import SearchDropdown from '../SearchDropdown/SearchDropdown';
import Login from '../../../pages/Login/Login';
import Signup from '../../../pages/Signup/Signup';
import api from '../../../services/api';
import Logo from '../../../assets/images/Logo.png';
import { searchGames } from '../../../services/rawgService';
import './Header.css';

function Header() {
  // États
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // États pour la recherche
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState({
    games: [],
    users: []
  });
  const [searchLoading, setSearchLoading] = useState(false);

  // Refs
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Context Auth
  const { user, isAuthenticated, logoutUser } = useAuth();

  // Fonction de recherche avec debounce
  const performSearch = async (query) => {
    if (query.trim().length < 2) {
      setSearchResults({ games: [], users: [] });
      setShowSearchDropdown(false);
      return;
    }

    setSearchLoading(true);
    setShowSearchDropdown(true);

    try {
      // Recherche de jeux (RAWG)
      const gamesResponse = await fetch(
        `https://api.rawg.io/api/games?key=${import.meta.env.VITE_RAWG_API_KEY}&search=${query}&page_size=10`
      );
      const gamesData = await searchGames(query, 10);

      // Recherche d'utilisateurs (Backend)
      const usersResponse = await api.get(`/users/search?q=${query}&limit=10`);

      setSearchResults({
        games: gamesData.results || [],
        users: usersResponse.data.results || []
      });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults({ games: [], users: [] });
    } finally {
      setSearchLoading(false);
    }
  };

  // Gérer le changement de recherche avec debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear le timer précédent
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Créer un nouveau timer
    debounceTimer.current = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms de délai
  };

  // Fonction de soumission (optionnel, on peut la garder)
  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      performSearch(searchQuery);
    }
  }

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fonction de déconnexion
  function handleLogout() {
    logoutUser();
    setShowUserMenu(false);
  }

  // Fonction pour switcher de Login à Signup
  function handleSwitchToSignup() {
    setShowLogin(false);
    setShowSignup(true);
  }

  // Fonction pour switcher de Signup à Login
  function handleSwitchToLogin() {
    setShowSignup(false);
    setShowLogin(true);
  }

  // Ferme le menu utilisateur quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event) {
      if (showUserMenu && !event.target.closest('.header-user-menu')) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  return (
    <>
      <header className="header">
        <div className="header-container">

          {/* Logo à gauche */}
          <Link to="/" className="header-logo">
            <img src={Logo} alt="MyMemoryCard" />
          </Link>

          {/* Centre : Search bar + Navbar ensemble */}
          <div className="header-center">
            {/* Barre de recherche */}
            <div ref={searchRef} className="header-search-container">
              <form onSubmit={handleSearch} className="header-search">
                <input
                  type="text"
                  placeholder="Rechercher un jeu ou un utilisateur..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) {
                      setShowSearchDropdown(true);
                    }
                  }}
                  className="header-search-input"
                />
                <button type="submit" className="header-search-button">
                  <Search size={20} />
                </button>
              </form>

              {/* Dropdown de recherche */}
              {showSearchDropdown && (
                <SearchDropdown
                  games={searchResults.games}
                  users={searchResults.users}
                  loading={searchLoading}
                  query={searchQuery}
                  onClose={() => {
                    setShowSearchDropdown(false);
                    setSearchQuery('');
                  }}
                />
              )}
            </div>

            {/* Navbar */}
            <nav className="header-nav">
              <div className="header-nav-container">
                <Link to="/" className="header-nav-link">ACCUEIL</Link>
                <span className="header-nav-separator separator-cyan">›</span>

                <Link to="/games" className="header-nav-link">JEUX</Link>
                <span className="header-nav-separator separator-pink">›</span>

                <Link to="/reviews" className="header-nav-link">REVIEWS</Link>
                <span className="header-nav-separator separator-purple">›</span>

                <Link to="/memories" className="header-nav-link">SOUVENIRS</Link>
                <span className="header-nav-separator separator-yellow">›</span>

                <Link to="/achievements" className="header-nav-link">SUCCÈS</Link>
                <span className="header-nav-separator separator-green">›</span>
              </div>
            </nav>
          </div>

          {/* Avatar/Bouton à droite */}
          <div className="header-actions">
            {isAuthenticated ? (
              // Si connecté : affiche l'avatar avec menu déroulant
              <div className="header-user-menu">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="header-avatar-button"
                >
                  <img
                    src={user.avatar_url || '/default-avatar.png'}
                    alt={user.username}
                    className="header-avatar"
                  />
                </button>

                {/* Menu déroulant */}
                {showUserMenu && (
                  <div className="header-dropdown">
                    <Link
                      to={`/profile/${user.id}`}
                      className="header-dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Mon profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="header-dropdown-item"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Si non connecté : bouton simple
              <button
                onClick={() => setShowLogin(true)}
                className="header-login-btn"
              >
                Se connecter
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Popups d'authentification */}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={handleSwitchToSignup}
        />
      )}
      {showSignup && (
        <Signup
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </>
  );
}

export default Header;
