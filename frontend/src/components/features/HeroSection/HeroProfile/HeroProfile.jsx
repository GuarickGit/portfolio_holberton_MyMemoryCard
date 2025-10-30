import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CircularStat from '../CircularStat/CircularStat';
import Button from '../../../ui/Button/Button';
import GameCard from '../../GameCard/GameCard';
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
  const [totalGamesInDB, setTotalGamesInDB] = useState(1000); // Valeur par défaut
  const [loadingStats, setLoadingStats] = useState(true);

  // Charger les stats, la collection, le profil ET le nombre total de jeux
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingStats(true);

        const [statsRes, collectionRes, profileRes, gamesCountRes] = await Promise.all([
          api.get(`/users/${user.id}/stats`),
          api.get(`/collections/user/${user.id}`),
          api.get(`/users/${user.id}`),
          api.get('/games/count')
        ]);

        // Les stats sont dans .stats
        setStats(statsRes.data.stats || statsRes.data);

        // La collection est dans .collection
        setCollection(collectionRes.data.collection || []);

        // Le profil complet avec level et exp
        setUserProfile(profileRes.data.user);

        // Nombre total de jeux en DB
        setTotalGamesInDB(gamesCountRes.data.total_games || 1000);

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

  // ============================================
  // FORMULES DE PROGRESSION (basées sur xpHelper.js backend)
  // ============================================

  /**
   * Calcule le pourcentage de progression vers le prochain niveau
   * Formule identique au backend : xpHelper.js > getProgressToNextLevel()
   */
  const getLevelPercentage = () => {
    if (!userProfile?.exp || !userProfile?.level) return 0;

    const level = userProfile.level;
    const exp = userProfile.exp;

    // XP du début du niveau actuel
    const currentLevelXp = Math.pow(level - 1, 2) * 50;

    // XP nécessaire pour le prochain niveau
    const nextLevelXp = Math.pow(level, 2) * 50;

    // XP gagnés dans le niveau actuel
    const xpInCurrentLevel = exp - currentLevelXp;

    // XP nécessaires pour passer au niveau suivant
    const xpNeededForLevel = nextLevelXp - currentLevelXp;

    // Pourcentage (max 100%)
    return Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForLevel) * 100));
  };

  /**
   * Jeux vidéos : Pourcentage par rapport au total de jeux en DB
   */
  const getGamesPercentage = () => {
    if (!totalGamesInDB) return 0;
    return Math.min((stats.total_games / totalGamesInDB) * 100, 100);
  };

  /**
   * En cours : Pourcentage de jeux en cours / total jeux de l'utilisateur
   */
  const getPlayingPercentage = () => {
    if (!stats?.total_games) return 0;
    return Math.min((stats.games_playing / stats.total_games) * 100, 100);
  };

  /**
   * Terminés : Pourcentage de jeux terminés / total jeux de l'utilisateur
   */
  const getCompletedPercentage = () => {
    if (!stats?.total_games) return 0;
    return Math.min((stats.games_completed / stats.total_games) * 100, 100);
  };

  /**
   * Reviews : Pourcentage par rapport au total de jeux en DB
   */
  const getReviewsPercentage = () => {
    if (!totalGamesInDB) return 0;
    return Math.min((stats.total_reviews / totalGamesInDB) * 100, 100);
  };

  /**
   * Souvenirs : Pourcentage par rapport au total de jeux en DB
   */
  const getMemoriesPercentage = () => {
    if (!totalGamesInDB) return 0;
    return Math.min((stats.total_memories / totalGamesInDB) * 100, 100);
  };

  /**
   * Likes : Pourcentage de likes reçus / (reviews + souvenirs)
   */
  const getLikesPercentage = () => {
    const totalContent = (stats?.total_reviews || 0) + (stats?.total_memories || 0);
    if (totalContent === 0) return 0;
    return Math.min((stats.total_likes_received / totalContent) * 100, 100);
  };

  /**
   * Succès : Pourcentage de succès obtenus (hardcodé pour le MVP)
   */
  const getAchievementsPercentage = () => {
    const totalAchievements = 50; // TODO: Récupérer du backend plus tard
    return Math.min((21 / totalAchievements) * 100, 100);
  };

  return (
    <div className="hero-profile">
      {/* Section Avatar + Infos */}
      <div className="hero-profile__header">
        {/* COLONNE GAUCHE : Avatar + Follow Stats */}
        <div className="hero-profile__left">
          <img
            src={user.avatar_url || '/default-avatar.png'}
            alt={user.username}
            className="hero-profile__avatar"
          />
          <div className="hero-profile__follow-stats">
            <div className="hero-profile__follow-stat">
              <strong>{stats?.total_following || 0}</strong>
              <span>abonnés</span>
            </div>
            <div className="hero-profile__follow-stat">
              <strong>{stats?.total_followers || 0}</strong>
              <span>abonnements</span>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : Username + Bio + Boutons */}
        <div className="hero-profile__info">
          <h1 className="hero-profile__username">{user.username}</h1>
          <p className="hero-profile__bio">{user.bio || 'Aucune bio'}</p>
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
            percentage={getGamesPercentage()}
          />
          <CircularStat
            label="en cours"
            value={parseInt(stats.games_playing) || 0}
            color="orange"
            percentage={getPlayingPercentage()}
          />
          <CircularStat
            label="terminés"
            value={parseInt(stats.games_completed) || 0}
            color="red"
            percentage={getCompletedPercentage()}
          />
          <CircularStat
            label="reviews"
            value={parseInt(stats.total_reviews) || 0}
            color="pink"
            percentage={getReviewsPercentage()}
          />
          <CircularStat
            label="souvenirs"
            value={parseInt(stats.total_memories) || 0}
            color="cyan"
            percentage={getMemoriesPercentage()}
          />
          <CircularStat
            label="likes"
            value={parseInt(stats.total_likes_received) || 0}
            color="yellow"
            percentage={getLikesPercentage()}
          />
          <CircularStat
            label="succès"
            value={21}
            color="purple"
            percentage={getAchievementsPercentage()}
          />
        </div>
      )}

      {/* Collection avec GameCard */}
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
              <GameCard
                key={item.id}
                game={{
                  rawg_id: item.rawg_id,
                  name: item.name,
                  cover_url: item.cover_url,
                  rating: item.rating,
                  released: item.released
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroProfile;
