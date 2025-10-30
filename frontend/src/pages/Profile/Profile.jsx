import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import HeroSection from '../../components/features/HeroSection/HeroSection';
import ReviewCard from '../../components/features/ReviewCard/ReviewCard';
import MemoryCard from '../../components/features/MemoryCard/MemoryCard';
import api from '../../services/api';
import './Profile.css';

function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Détermine si c'est notre propre profil
  const isOwnProfile = currentUser && (!userId || userId === currentUser.id);
  const targetUserId = userId || currentUser?.id;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!targetUserId) {
        setError('Utilisateur non trouvé');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Récupérer en parallèle : profil, reviews, memories
        const [profileRes, reviewsRes, memoriesRes] = await Promise.all([
          api.get(`/users/${targetUserId}`),
          api.get(`/reviews/user/${targetUserId}?limit=6`),
          api.get(`/memories/user/${targetUserId}?limit=6`)
        ]);

        setProfileUser(profileRes.data.user);
        setReviews(reviewsRes.data.reviews || []);
        setMemories(memoriesRes.data.memories || []);

      } catch (err) {
        console.error('Erreur chargement profil:', err);
        setError('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [targetUserId]);

  // LOADING STATE
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading__spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  // ERROR STATE
  if (error || !profileUser) {
    return (
      <div className="profile-error">
        <h2>Erreur</h2>
        <p>{error || 'Utilisateur non trouvé'}</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* HERO SECTION avec background image */}
      <HeroSection
        type="profile"
        user={profileUser}
        isOwnProfile={isOwnProfile}
      />

      {/* SECTION REVIEWS - Sur fond noir */}
      {reviews.length > 0 && (
        <section className="profile-section">
          <div className="profile-section__header">
            <h2>
              {isOwnProfile
                ? 'Mes dernières critiques'
                : `Dernières critiques de ${profileUser.username}`
              }
            </h2>
            <button
              className="profile-section__view-all"
              onClick={() => window.location.href = `/profile/${targetUserId}/reviews`}
            >
              {isOwnProfile
                ? 'Voir toutes mes critiques →'
                : `Toutes les critiques de ${profileUser.username} →`
              }
            </button>
          </div>
          <div className="profile-section__grid">
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}

      {/* SECTION MEMORIES - Sur fond noir */}
      {memories.length > 0 && (
        <section className="profile-section">
          <div className="profile-section__header">
            <h2>
              {isOwnProfile
                ? 'Mes derniers souvenirs'
                : `Derniers souvenirs de ${profileUser.username}`
              }
            </h2>
            <button
              className="profile-section__view-all"
              onClick={() => window.location.href = `/profile/${targetUserId}/memories`}
            >
              {isOwnProfile
                ? 'Voir tous mes souvenirs →'
                : `Tous les souvenirs de ${profileUser.username} →`
              }
            </button>
          </div>
          <div className="profile-section__grid">
            {memories.map(memory => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        </section>
      )}

      {/* ÉTAT VIDE - Si aucune review ni memory */}
      {reviews.length === 0 && memories.length === 0 && (
        <div className="profile-empty">
          <p>
            {isOwnProfile
              ? "Tu n'as pas encore publié de critiques ou de souvenirs."
              : `${profileUser.username} n'a pas encore publié de critiques ou de souvenirs.`
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default Profile;
