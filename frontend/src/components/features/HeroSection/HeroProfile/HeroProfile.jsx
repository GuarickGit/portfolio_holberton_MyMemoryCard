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
  const [userProfile, setUserProfile] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Charger les stats, la collection ET le profil complet
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingStats(true);

        const [statsRes, collectionRes, profileRes] = await Promise.all([
          api.get(`/users/${user.id}/stats`),
          api.get(`/collections?userId=${user.id}&limit=7`),
          api.get(`/users/${user.id}`)
        ]);

        // Les stats sont dans .stats
        setStats(statsRes.data.stats || statsRes.data);

        // La collection est dans .collection
        setCollection(collectionRes.data.collection || []);

        // Le profil complet avec level et exp
        setUserProfile(profileRes.data);

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
    if (!userProfile?.exp || !userProfile?.level) return 0;
    const expForNextLevel = userProfile.level * 100;
    const currentExp = userProfile.exp % 100;
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
      {!loadingStats && stats && userProfile && (
        <div className="hero-profile__stats">
          <CircularStat
            label="Niveau"
            value={parseInt(userProfile.level) || 1}
            color="green"
            percentage={getLevelPercentage()}
          />
          <CircularStat
            label="jeux vidéos"
            value={parseInt(stats.total_games) || 0}
            color="blue"
          />
          <CircularStat
            label="en cours"
            value={parseInt(stats.games_playing) || 0}
            color="orange"
          />
          <CircularStat
            label="terminés"
            value={parseInt(stats.games_completed) || 0}
            color="red"
          />
          <CircularStat
            label="reviews"
            value={parseInt(stats.total_reviews) || 0}
            color="pink"
          />
          <CircularStat
            label="souvenirs"
            value={parseInt(stats.total_memories) || 0}
            color="cyan"
          />
          <CircularStat
            label="likes"
            value={parseInt(stats.total_likes_received) || 0}
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
                src={item.cover_url || '/placeholder-game.png'}
                alt={item.name || 'Jeu'}
                className="hero-profile__collection-cover"
                onClick={() => navigate(`/games/${item.rawg_id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroProfile;
