import { createContext, useContext, useState } from 'react';

const AuthModalContext = createContext();

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
};

export const AuthModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState('login'); // 'login' ou 'signup'

  /**
   * Ouvre le modal de connexion
   * @param {string} tab - 'login' ou 'signup'
   */
  const openAuthModal = (tab = 'login') => {
    setDefaultTab(tab);
    setIsOpen(true);
  };

  /**
   * Ferme le modal
   */
  const closeAuthModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        defaultTab,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};
