import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, AlertTriangle } from 'lucide-react';
import LikeButton from '../../components/features/LikeButton/LikeButton';
import CommentSection from '../../components/features/Comments/CommentSection/CommentSection';
import api from '../../services/api';
import './MemoryDetail.css';

/**
 * MemoryDetail - Page détaillée d'un souvenir
 * Route : /memories/:id
 */
const MemoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Charger le souvenir
  useEffect(() => {
    fetchMemory();
  }, [id]);

  const fetchMemory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/memories/${id}`);
      setMemory(response.data.memory);
    } catch (err) {
      console.error('Erreur chargement memory:', err);
      setError('Impossible de charger le souvenir.');
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur est le propriétaire
  const isOwner = user && memory && user.id === memory.user_id;

  // Callback pour mettre à jour le compteur de commentaires
  const handleCommentCountChange = (delta) => {
    setMemory(prev => ({
      ...prev,
      comments_count: parseInt(prev.comments_count || 0) + delta
    }));
  };

  /**
   * Suppression du souvenir
   */
  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer définitivement ce souvenir ? Cette action est irréversible.'
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await api.delete(`/memories/${id}`);

      // Redirection vers le profil avec message de succès
      navigate('/profile', {
        state: { message: 'Souvenir supprimé avec succès' }
      });
    } catch (err) {
      console.error('Erreur suppression memory:', err);
      alert('Impossible de supprimer le souvenir. Veuillez réessayer.');
    } finally {
      setDeleting(false);
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="memory-detail__loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  // ERROR
  if (error || !memory) {
    return (
      <div className="memory-detail__error">
        <p>{error || 'Souvenir introuvable'}</p>
        <button onClick={() => navigate(-1)}>Retour</button>
      </div>
    );
  }

  return (
    <div className="memory-detail">
      <div className="memory-detail__container">
        {/* BOUTON RETOUR */}
        <button className="memory-detail__back" onClick={() => navigate(-1)}>
          ← Retour
        </button>

        {/* HEADER - Infos du jeu */}
        <div
          className="memory-detail__game"
          style={{
            backgroundImage: `url(${memory.background_image || memory.game_image})`
          }}
        >
          <img
            src={memory.game_image}
            alt={memory.game_name}
            className="memory-detail__game-cover"
          />
          <div className="memory-detail__game-info">
            <h1>{memory.game_name}</h1>
            {memory.year && <p className="memory-detail__year">{memory.year}</p>}
          </div>
        </div>

        {/* CARD DU SOUVENIR */}
        <div className="memory-detail__card">
          {/* HEADER - Avatar + Username + Date + BOUTONS */}
          <div className="memory-detail__header">
            <div className="memory-detail__author">
              <img
                src={memory.avatar_url || '/default-avatar.png'}
                alt={memory.username}
                className="memory-detail__avatar"
              />
              <div>
                <h3 className="memory-detail__username">{memory.username}</h3>
                <p className="memory-detail__date">
                  {new Date(memory.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* BOUTONS MODIFIER + SUPPRIMER */}
            {isOwner && (
              <div className="memory-detail__actions">
                <button
                  className="memory-detail__edit-button"
                  onClick={() => navigate(`/memories/${id}/edit`)}
                >
                  Modifier
                </button>
                <button
                  className="memory-detail__delete-button"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            )}
          </div>

          {/* TITRE */}
          <h2 className="memory-detail__title">{memory.title}</h2>

          {/* SPOILER WARNING */}
          {memory.spoiler && !spoilerRevealed && (
            <div className="memory-detail__spoiler-warning">
              <AlertTriangle size={20} />
              <p>Ce souvenir contient des spoilers</p>
              <button
                className="memory-detail__reveal-button"
                onClick={() => setSpoilerRevealed(true)}
              >
                Afficher quand même
              </button>
            </div>
          )}

          {/* CONTENT */}
          {(!memory.spoiler || spoilerRevealed) && (
            <div className="memory-detail__content">
              <p>{memory.content}</p>
            </div>
          )}

          {/* FOOTER - Stats AVEC LIKEBUTTON */}
          <div className="memory-detail__stats">
            <LikeButton
              targetType="memory"
              targetId={memory.id}
              initialLikesCount={memory.likes_count || 0}
              size={20}
            />
            <div className="memory-detail__stat">
              <MessageCircle size={20} />
              <span>{memory.comments_count || 0} commentaire{memory.comments_count > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* SECTION COMMENTAIRES */}
        <CommentSection
          targetType="memory"
          targetId={id}
          onCommentCountChange={handleCommentCountChange}
        />
      </div>
    </div>
  );
};

export default MemoryDetail;
