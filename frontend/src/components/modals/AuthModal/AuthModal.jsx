import { useState, useEffect } from 'react';
import { useAuthModal } from '../../../contexts/AuthModalContext';
import Login from '../../../pages/Login/Login';
import Signup from '../../../pages/Signup/Signup';

/**
 * AuthModal - Modal qui gère Login et Signup
 * Contrôlé par le AuthModalContext
 */
const AuthModal = () => {
  const { isOpen, defaultTab, closeAuthModal } = useAuthModal();
  const [currentTab, setCurrentTab] = useState(defaultTab);

  // Met à jour l'onglet quand defaultTab change
  useEffect(() => {
    if (isOpen) {
      setCurrentTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Ne rien afficher si le modal est fermé
  if (!isOpen) return null;

  // Gérer le clic sur l'overlay pour fermer
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeAuthModal();
    }
  };

  return (
    <div onClick={handleOverlayClick}>
      {currentTab === 'login' ? (
        <Login
          onClose={closeAuthModal}
          onSwitchToSignup={() => setCurrentTab('signup')}
        />
      ) : (
        <Signup
          onClose={closeAuthModal}
          onSwitchToLogin={() => setCurrentTab('login')}
        />
      )}
    </div>
  );
};

export default AuthModal;
