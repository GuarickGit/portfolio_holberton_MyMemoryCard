import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, MessageCircle, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button/Button';
import api from '../../services/api';
import './MemoryDetail.css';

/**
 * MemoryDetail - Page détaillée d'un souvenir
 * Route : /memories/:id
 *
 * Fonctionnalités :
 * - Affiche le souvenir complet
 * - Gestion du spoiler
 * - Bouton modifier si propriétaire
 * - Likes et commentaires (à venir)
 */
const MemoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);

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
        <Button onClick={() => navigate(-1)}>Retour</Button>
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
          {/* HEADER - Avatar + Username + Date */}
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

            {/* BOUTON MODIFIER */}
            {isOwner && (
              <Button
                variant="secondary"
                onClick={() => navigate(`/memories/${id}/edit`)}
              >
                Modifier
              </Button>
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

          {/* FOOTER - Stats */}
          <div className="memory-detail__stats">
            <div className="memory-detail__stat">
              <Heart size={20} />
              <span>{memory.likes_count || 0} like{memory.likes_count > 1 ? 's' : ''}</span>
            </div>
            <div className="memory-detail__stat">
              <MessageCircle size={20} />
              <span>{memory.comments_count || 0} commentaire{memory.comments_count > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryDetail;
