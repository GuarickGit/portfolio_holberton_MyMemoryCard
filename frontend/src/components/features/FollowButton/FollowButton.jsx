import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useAuthModal } from '../../../contexts/AuthModalContext';
import api from '../../../services/api';
import './FollowButton.css';

/**
 * FollowButton - Bouton pour suivre/ne plus suivre un utilisateur
 *
 * @param {string} userId - ID de l'utilisateur à suivre
 * @param {function} onFollowChange - Callback appelé quand le statut change (optionnel)
 */
const FollowButton = ({ userId, onFollowChange }) => {
  const { isAuthenticated, user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Vérifier si on suit déjà l'utilisateur
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!isAuthenticated || !userId) {
        setChecking(false);
        return;
      }

      try {
        setChecking(true);
        const response = await api.get(`/follows/${userId}/check`);
        setIsFollowing(response.data.isFollowing);
      } catch (error) {
        console.error('Erreur vérification follow:', error);
      } finally {
        setChecking(false);
      }
    };

    checkFollowStatus();
  }, [userId, isAuthenticated]);

  /**
   * Gérer le follow/unfollow
   */
  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    try {
      setLoading(true);

      if (isFollowing) {
        // Unfollow
        await api.delete(`/follows/${userId}`);
        setIsFollowing(false);

        // Callback pour mettre à jour les compteurs
        if (onFollowChange) {
          onFollowChange(-1); // -1 follower
        }
      } else {
        // Follow
        await api.post(`/follows/${userId}`);
        setIsFollowing(true);

        // Callback pour mettre à jour les compteurs
        if (onFollowChange) {
          onFollowChange(1); // +1 follower
        }
      }

    } catch (error) {
      console.error('Erreur toggle follow:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Loading pendant la vérification
  if (checking) {
    return (
      <button className="follow-button follow-button--loading" disabled>
        Chargement...
      </button>
    );
  }

  // Affichage du bouton
  return (
    <button
      className={`follow-button ${isFollowing ? 'follow-button--following' : ''}`}
      onClick={handleToggleFollow}
      disabled={loading}
    >
      {loading ? 'Chargement...' : isFollowing ? 'Abonné' : 'S\'abonner'}
    </button>
  );
};

export default FollowButton;
