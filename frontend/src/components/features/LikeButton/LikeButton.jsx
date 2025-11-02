import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { Heart } from 'lucide-react';
import api from '../../../services/api.js';
import './LikeButton.css';

/**
 * LikeButton - Bouton like réutilisable pour reviews et memories
 *
 * @param {string} targetType - 'review' ou 'memory'
 * @param {string} targetId - ID de la review ou memory
 * @param {number} initialLikesCount - Nombre initial de likes
 * @param {number} size - Taille de l'icône (défaut: 16)
 * @param {string} variant - 'default' | 'large' (défaut: 'default')
 */
const LikeButton = ({
  targetType,
  targetId,
  initialLikesCount = 0,
  size = 16,
  variant = 'default'
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [likePending, setLikePending] = useState(false);

  // Vérifier si l'utilisateur a déjà liké au chargement
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!user) return;

      try {
        const response = await api.get(`/likes/${targetType}/${targetId}/check`);
        setLiked(response.data.hasLiked);
      } catch (error) {
        console.error('Erreur vérification like:', error);
      }
    };

    checkIfLiked();
  }, [targetType, targetId, user]);

  // Toggle du like
  const handleLikeToggle = async (e) => {
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (likePending) return;

    try {
      setLikePending(true);

      const response = await api.post('/likes/toggle', {
        targetType,
        targetId
      });

      setLiked(response.data.liked);
      setLikesCount(response.data.likesCount);

    } catch (error) {
      console.error('Erreur toggle like:', error);
    } finally {
      setLikePending(false);
    }
  };

  return (
    <button
      className={`like-button like-button--${variant} ${liked ? 'liked' : ''} ${likePending ? 'pending' : ''}`}
      onClick={handleLikeToggle}
      disabled={likePending}
      title={liked ? 'Retirer le like' : 'J\'aime'}
      aria-label={liked ? 'Retirer le like' : 'J\'aime'}
    >
      <Heart
        size={size}
        fill={liked ? '#ff6b6b' : 'none'}
        stroke={liked ? '#ff6b6b' : 'currentColor'}
        className="like-button__icon"
      />
      {/* LOGIQUE AMÉLIORÉE : "J'aime" si pas liké, sinon affiche le nombre */}
      <span className="like-button__text">
        {liked ? likesCount : "J'aime"}
      </span>
    </button>
  );
};

export default LikeButton;
