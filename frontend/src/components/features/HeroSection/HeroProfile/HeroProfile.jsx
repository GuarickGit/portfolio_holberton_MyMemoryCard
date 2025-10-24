import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CircularStat from '../CircularStat/CircularStat';
import Button from '../../../ui/Button/Button';
import api from '../../../../services/api';
import './HeroProfile.css';

/**
 * HeroProfile - Version Hero pour utilisateurs connectés
 * Affiche avatar, stats circulaires et collection
 *
 * @param {Object} user - Données de l'utilisateur
 * @param {Boolean} isOwnProfile - True si c'est notre propre profil
 */
const HeroProfile = ({ user, isOwnProfile = false }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [collection, setCollection] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Charger les stats et la collection
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingStats(true);

        const [statsRes, collectionRes] = await Promise.all([
          api.get(`/users/${user.id}/stats`),
          api.get(`/collections?userId=${user.id}&limit=7`)
        ]);

        setStats(statsRes.data);
        setCollection(collectionRes.data.collections || []);
      } catch (error) {
        console.error('Erreur chargement HeroProfile:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  // Calculer le pourcentage de niveau (exp / prochain niveau)
  const getLevelPercentage = () => {
    if (!user?.exp || !user?.level) return 0;
    const expForNextLevel = user.level * 100;
    const currentExp = user.exp % 100;
    return Math.min((currentExp / expForNextLevel) * 100, 100);
  };

  return (
    <div className="hero-profile">
      {/* Section Avatar + Infos */}
      <div className="hero-profile__header">
        <img
          src={user.avatar_url || '/default-avatar.png'}
          alt={user.username}
          className="hero-profile__avatar"
        />
        <div className="hero-profile__info">
          <h1 className="hero-profile__username">{user.username}</h1>
          <p className="hero-profile__bio">{user.bio || 'Aucune bio'}</p>
          <div className="hero-profile__follow-stats">
            <span><strong>{stats?.total_following || 0}</strong> abonnés</span>
            <span><strong>{stats?.total_followers || 0}</strong> abonnements</span>
          </div>

          {/* Boutons */}
          <div className="hero-profile__actions">
            {isOwnProfile ? (
              <Button
                variant="primary"
                onClick={() => navigate('/profile/edit')}
              >
                Modifier le profil
              </Button>
            ) : (
              <Button variant="primary">
                S'abonner
              </Button>
            )}
            <Button variant="secondary">
              ···
            </Button>
          </div>
        </div>
      </div>

      {/* Stats circulaires */}
      {!loadingStats && stats && (
        <div className="hero-profile__stats">
          <CircularStat
            label="Niveau"
            value={user.level}
            color="green"
            percentage={getLevelPercentage()}
          />
          <CircularStat
            label="jeux vidéos"
            value={stats.total_games}
            color="blue"
          />
          <CircularStat
            label="en cours"
            value={stats.games_playing}
            color="orange"
          />
          <CircularStat
            label="terminés"
            value={stats.games_completed}
            color="red"
          />
          <CircularStat
            label="reviews"
            value={stats.total_reviews}
            color="pink"
          />
          <CircularStat
            label="souvenirs"
            value={stats.total_memories}
            color="cyan"
          />
          <CircularStat
            label="likes"
            value={stats.total_likes_received}
            color="yellow"
          />
          <CircularStat
            label="succès"
            value={21}
            color="purple"
          />
        </div>
      )}

      {/* Collection carousel */}
      {collection.length > 0 && (
        <div className="hero-profile__collection">
          <div className="hero-profile__collection-header">
            <h3>COLLECTION</h3>
            <button
              onClick={() => navigate(`/profile/${user.id}/collection`)}
              className="hero-profile__collection-link"
            >
              Voir la collection →
            </button>
          </div>
          <div className="hero-profile__collection-grid">
            {collection.slice(0, 7).map((item) => (
              <img
                key={item.id}
                src={item.game_cover_url || '/placeholder-game.png'}
                alt={item.game_name}
                className="hero-profile__collection-cover"
                onClick={() => navigate(`/games/${item.game_id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroProfile;
