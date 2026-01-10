import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour vérifier le token et recharger le user
  async function loadUser() {
    const savedUser = localStorage.getItem('user');

	if (savedUser) {
		try {
			setUser(JSON.parse(savedUser));
		} catch (error) {
			console.error('Erreur de chargement du user:', error);
			localStorage.removeItem('user');
		}
    }

    setLoading(false);
  }

  // Charger le user au démarrage
  useEffect(() => {
    loadUser();
  }, []);

  // Fonction de connexion
  function loginUser(userData) {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  // Fonction de déconnexion
  function logoutUser() {
    setUser(null);
    localStorage.removeItem('user');
  }

  // Fonction pour mettre à jour les infos du user
  function updateUser(updatedUserData) {
    const newUser = { ...user, ...updatedUserData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser)); // Met à jour aussi le localStorage
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    loginUser,
    logoutUser,
    updateUser,
  };

  // Affiche rien pendant le chargement
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        color: 'white'
      }}>
        Chargement...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
