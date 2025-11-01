import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Heart, MessageCircle, AlertTriangle } from 'lucide-react';
import api from '../../../services/api';
import './MemoryCard.css';

const MemoryCard = ({ memory }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);

  // États pour les likes
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(memory.likes_count || 0);
  const [likePending, setLikePending] = useState(false);

  // Vérifier si l'utilisateur connecté est le propriétaire
  const isOwner = user && user.id === memory.user_id;

  // Vérifier si l'utilisateur a déjà liké au chargement
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!user) return;

      try {
        const response = await api.get(`/likes/memory/${memory.id}/check`);
        setLiked(response.data.hasLiked);
      } catch (error) {
        console.error('Erreur vérification like:', error);
      }
    };

    checkIfLiked();
  }, [memory.id, user]);

  const handleRevealSpoiler = () => {
    setSpoilerRevealed(true);
  };

  const handleEdit = () => {
    navigate(`/memories/${memory.id}/edit`);
  };

  const handleProfileClick = () => {
    navigate(`/profile/${memory.user_id}`);
  };

  const handleReadMore = () => {
    navigate(`/memories/${memory.id}`);
  };

  // Toggle du like
  const handleLikeToggle = async (e) => {
    e.stopPropagation(); // Empêche la propagation vers la card

    if (!user) {
      navigate('/login');
      return;
    }

    if (likePending) return; // Évite les double-clics

    try {
      setLikePending(true);

      const response = await api.post('/likes/toggle', {
        targetType: 'memory',
        targetId: memory.id
      });

      // Mise à jour de l'état local
      setLiked(response.data.liked);
      setLikesCount(response.data.likesCount);

    } catch (error) {
      console.error('Erreur toggle like:', error);
      // TODO: Afficher un message d'erreur à l'utilisateur
    } finally {
      setLikePending(false);
    }
  };

  return (
    <div className="memory-card">
      {/* TOP SECTION */}
      <div className="memory-card__top">
        {/* IMAGE */}
        <div className="memory-card__image">
          <img src={memory.game_image} alt={memory.game_name} />
        </div>

        {/* HEADER CONTENT */}
        <div className="memory-card__header-content">
          {/* HEADER - Avatar + Username */}
          <div className="memory-card__header">
            <img
              src={memory.avatar_url || '/default-avatar.png'}
              alt={memory.username}
              className="memory-card__avatar"
              onClick={handleProfileClick}
              style={{ cursor: 'pointer' }}
            />
            <span
              className="memory-card__username"
              onClick={handleProfileClick}
              style={{ cursor: 'pointer' }}
            >
              {memory.username}
            </span>
          </div>

          {/* GAME INFO */}
          <div className="memory-card__game-info">
            <h3 className="memory-card__game-title">
              {memory.game_name}
              {memory.year && <span className="memory-card__year"> ({memory.year})</span>}
            </h3>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="memory-card__bottom">
        {/* TITRE */}
        <h4 className="memory-card__title">{memory.title}</h4>

        {/* SPOILER BADGE */}
        {memory.spoiler && !spoilerRevealed && (
          <div className="memory-card__spoiler-badge">
            <AlertTriangle size={14} />
            Contient des spoilers
          </div>
        )}

        {/* CONTENT WRAPPER */}
        <div className="memory-card__content-wrapper">
          <div className={`memory-card__content ${memory.spoiler && !spoilerRevealed ? 'memory-card__content--blurred' : ''}`}>
            <p className="memory-card__text">{memory.content}</p>
          </div>

          {/* BOUTON RÉVÉLER SPOILER */}
          {memory.spoiler && !spoilerRevealed && (
            <button
              className="memory-card__reveal-spoiler"
              onClick={handleRevealSpoiler}
            >
              Révéler le spoiler
            </button>
          )}
        </div>

        {/* FOOTER */}
        <div className="memory-card__footer">
          <div className="memory-card__footer-left">
            <button
              className="memory-card__read-more"
              onClick={handleReadMore}
            >
              Lire le souvenir
            </button>

            {/* BOUTON MODIFIER - Visible seulement si propriétaire */}
            {isOwner && (
              <button className="memory-card__edit-button" onClick={handleEdit}>
                Modifier
              </button>
            )}
          </div>

          {/* STATS */}
          <div className="memory-card__stats">
            {/* BOUTON LIKE - Maintenant cliquable */}
            <button
              className={`memory-card__stat memory-card__stat--like ${liked ? 'liked' : ''} ${likePending ? 'pending' : ''}`}
              onClick={handleLikeToggle}
              disabled={likePending}
            >
              <Heart
                size={16}
                fill={liked ? '#ff6b6b' : 'none'}
                stroke={liked ? '#ff6b6b' : '#666'}
              />
              <span>{likesCount}</span>
            </button>

            <div className="memory-card__stat">
              <MessageCircle size={16} />
              <span>{memory.comments_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;
