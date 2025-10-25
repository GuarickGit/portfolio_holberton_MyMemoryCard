import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import HeroSection from '../../components/features/HeroSection/HeroSection';
import GameCard from '../../components/features/GameCard/GameCard.jsx';
import ReviewCard from '../../components/features/ReviewCard/ReviewCard.jsx';
import MemoryCard from '../../components/features/MemoryCard/MemoryCard.jsx';
import Button from '../../components/ui/Button/Button.jsx'
import api from '../../services/api.js';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    topGames: [],
    recentReviews: [],
    recentMemories: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Appels API parallèles pour optimiser le chargement
      const [gamesRes, reviewsRes, memoriesRes] = await Promise.all([
        api.get('/games/top'),
        api.get('/reviews?limit=3'),
        api.get('/memories?limit=3')
      ]);

      setData({
        topGames: gamesRes.data.games?.slice(0, 5) || [],
        recentReviews: reviewsRes.data.reviews || [],
        recentMemories: memoriesRes.data.memories || []
      });

    } catch (err) {
      console.error('Erreur chargement HomePage:', err);
      setError('Impossible de charger les données. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* HERO SECTION - CTA ou Profile selon connexion */}
      <HeroSection
        type={isAuthenticated ? 'profile' : 'cta'}
        user={isAuthenticated ? user : null}
        isOwnProfile={true}
      />

      {/* MESSAGE D'ERREUR */}
      {error && (
        <div className="home__error">
          <p>{error}</p>
          <Button variant="secondary" onClick={fetchHomeData}>
            Réessayer
          </Button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div className="home__loading">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      ) : (
        <>
          {/* JEUX POPULAIRES */}
          <section className="home__section">
            <div className="home__section-header">
              <h2>Jeux du moment</h2>
              <Button
                variant="secondary"
                onClick={() => navigate('/games')}
              >
                Voir tous les jeux →
              </Button>
            </div>

          {/* SÉPARATEUR */}
          <div className="home__separator"></div>

            <div className="home__games-grid">
              {data.topGames.length > 0 ? (
                data.topGames.map((game) => (
                  <GameCard
                    key={game.rawg_id}
                    game={game}
                    onClick={() => navigate(`/games/${game.rawg_id}`)}
                  />
                ))
              ) : (
                <p className="home__empty">Aucun jeu disponible pour le moment</p>
              )}
            </div>
          </section>

          {/* REVIEWS RÉCENTES */}
          <section className="home__section">
            <div className="home__section-header">
              <h2>Dernières critiques</h2>
              <Button
                variant="secondary"
                onClick={() => navigate('/reviews')}
              >
                Voir toutes les reviews →
              </Button>
            </div>

          {/* SÉPARATEUR */}
          <div className="home__separator"></div>

            <div className="home__cards-grid">
              {data.recentReviews.length > 0 ? (
                data.recentReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                  />
                ))
              ) : (
                <p className="home__empty">Aucune critique pour le moment</p>
              )}
            </div>
          </section>

          {/* SOUVENIRS RÉCENTS */}
          <section className="home__section">
            <div className="home__section-header">
              <h2>Derniers souvenirs</h2>
              <Button
                variant="secondary"
                onClick={() => navigate('/memories')}
              >
                Voir tous les souvenirs →
              </Button>
            </div>

          {/* SÉPARATEUR */}
          <div className="home__separator"></div>

            <div className="home__cards-grid">
              {data.recentMemories.length > 0 ? (
                data.recentMemories.map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                  />
                ))
              ) : (
                <p className="home__empty">Aucun souvenir pour le moment</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
