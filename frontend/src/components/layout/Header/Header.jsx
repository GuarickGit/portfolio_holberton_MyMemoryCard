import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Search } from 'lucide-react';
import Login from '../../../pages/Login/Login';
import Logo from '../../../assets/images/Logo.png';
import './Header.css';

function Header() {
  // États
  const [showLogin, setShowLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Context Auth
  const { user, isAuthenticated, logoutUser } = useAuth();

  // Fonction de recherche
  function handleSearch(e) {
    e.preventDefault();
    console.log('Recherche:', searchQuery);
    // NE PAS OUBLIER : Implémenter la recherche plus tard
  }

  // Fonction de déconnexion
  function handleLogout() {
    logoutUser();
    setShowUserMenu(false);
  }

  // Ferme le menu quand on clique ailleurs
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
            <form onSubmit={handleSearch} className="header-search">
              <input
                type="text"
                placeholder="Recherche"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="header-search-input"
              />
              <button type="submit" className="header-search-button">
                <Search size={20} />
              </button>
            </form>

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

      {/* Popup de connexion */}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </>
  );
}

export default Header;
