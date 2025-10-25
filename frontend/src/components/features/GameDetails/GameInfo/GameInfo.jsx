import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, BookmarkCheck, MessageSquare, Heart, ChevronDown } from 'lucide-react';
import api from '../../../../services/api';
import './GameInfo.css';

/**
 * GameInfo - Actions sous la cover
 */
const GameInfo = ({ game, collectionStatus, onCollectionUpdate, isAuthenticated }) => {
  const navigate = useNavigate();
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isRatingLoading, setIsRatingLoading] = useState(false);

  const currentRating = collectionStatus?.user_rating || 0;
  const isInCollection = collectionStatus?.inCollection;

  /**
   * Ajouter le jeu à la collection
   */
  const handleAddToCollection = async (status) => {
    try {
      const response = await api.post('/collections', {
        rawg_id: game.rawg_id,
        status: status
      });

      onCollectionUpdate({
        inCollection: true,
        status: status,
        user_rating: null
      });

      setShowStatusDropdown(false);
    } catch (error) {
      console.error('Erreur ajout collection:', error);
      alert(error.response?.data?.error || 'Erreur lors de l\'ajout');
    }
  };

  /**
   * Modifier le status du jeu dans la collection
   */
  const handleUpdateStatus = async (newStatus) => {
    try {
      await api.patch(`/collections/${game.rawg_id}`, {
        status: newStatus
      });

      onCollectionUpdate({
        ...collectionStatus,
        status: newStatus
      });

      setShowStatusDropdown(false);
    } catch (error) {
      console.error('Erreur mise à jour status:', error);
      alert(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  /**
   * Supprimer le jeu de la collection
   */
  const handleRemoveFromCollection = async () => {
    if (!confirm('Voulez-vous vraiment retirer ce jeu de votre collection ?')) {
      return;
    }

    try {
      await api.delete(`/collections/${game.rawg_id}`);

      onCollectionUpdate({
        inCollection: false,
        status: null,
        user_rating: null
      });

      setShowStatusDropdown(false);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  /**
   * Noter le jeu (1-5 étoiles)
   */
  const handleRating = async (rating) => {
    if (!isInCollection) {
      alert('Ajoutez ce jeu à votre collection pour le noter');
      return;
    }

    try {
      setIsRatingLoading(true);
      await api.patch(`/collections/${game.rawg_id}`, {
        user_rating: rating
      });

      onCollectionUpdate({
        ...collectionStatus,
        user_rating: rating
      });
    } catch (error) {
      console.error('Erreur notation:', error);
      alert(error.response?.data?.error || 'Erreur lors de la notation');
    } finally {
      setIsRatingLoading(false);
    }
  };

  /**
   * Traduire le status en français
   */
  const getStatusLabel = (status) => {
    const labels = {
      not_started: 'Non commencé',
      playing: 'En cours',
      completed: 'Terminé',
      abandoned: 'Abandonné'
    };
    return labels[status] || status;
  };

  /**
   * Icône pour le status
   */
  const getStatusIcon = (status) => {
    return <BookmarkCheck size={18} />;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="game-info">
      <div className="game-info__container">
        <div className="game-info__actions">

          {/* 1. RATING STARS */}
          <button
            className="game-info__action-item game-info__action-item--rating"
            disabled={!isInCollection}
            title={!isInCollection ? 'Ajoutez ce jeu à votre collection pour le noter' : ''}
          >
            <div className="game-info__rating-wrapper">
              <div className="game-info__stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={24}
                    className={`game-info__star ${
                      (hoveredStar || currentRating) >= star ? 'game-info__star--filled' : ''
                    } ${!isInCollection ? 'game-info__star--disabled' : ''}`}
                    onMouseEnter={() => isInCollection && setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => handleRating(star)}
                  />
                ))}
              </div>
              <span className="game-info__action-label">
                {currentRating > 0 ? `Ma note : ${currentRating}/5` : 'Ma note'}
              </span>
            </div>
          </button>

          {/* 2. COLLECTION STATUS */}
          {!isInCollection ? (
            <div className="game-info__action-dropdown">
              <button
                className="game-info__action-item"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <BookmarkCheck size={18} />
                <span>Ajouter à ma collection</span>
                <ChevronDown size={16} className={showStatusDropdown ? 'rotate' : ''} />
              </button>

              {showStatusDropdown && (
                <div className="game-info__dropdown">
                  <button onClick={() => handleAddToCollection('not_started')}>
                    Non commencé
                  </button>
                  <button onClick={() => handleAddToCollection('playing')}>
                    En cours
                  </button>
                  <button onClick={() => handleAddToCollection('completed')}>
                    Terminé
                  </button>
                  <button onClick={() => handleAddToCollection('abandoned')}>
                    Abandonné
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="game-info__action-dropdown">
              <button
                className="game-info__action-item game-info__action-item--active"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                {getStatusIcon(collectionStatus?.status)}
                <span>{getStatusLabel(collectionStatus?.status)}</span>
                <ChevronDown size={16} className={showStatusDropdown ? 'rotate' : ''} />
              </button>

              {showStatusDropdown && (
                <div className="game-info__dropdown">
                  <button onClick={() => handleUpdateStatus('not_started')}>
                    Non commencé
                  </button>
                  <button onClick={() => handleUpdateStatus('playing')}>
                    En cours
                  </button>
                  <button onClick={() => handleUpdateStatus('completed')}>
                    Terminé
                  </button>
                  <button onClick={() => handleUpdateStatus('abandoned')}>
                    Abandonné
                  </button>
                  <hr />
                  <button onClick={handleRemoveFromCollection} className="danger">
                    Retirer de ma collection
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. ÉCRIRE UNE CRITIQUE */}
          <button
            className="game-info__action-item"
            onClick={() => navigate(`/games/${game.rawg_id}/review/new`)}
          >
            <MessageSquare size={18} />
            <span>Écrire une critique</span>
          </button>

          {/* 4. ÉCRIRE UN SOUVENIR */}
          <button
            className="game-info__action-item"
            onClick={() => navigate(`/games/${game.rawg_id}/memory/new`)}
          >
            <Heart size={18} />
            <span>Écrire un souvenir</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default GameInfo;
