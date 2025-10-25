import { useNavigate } from 'react-router-dom';
import ReviewCard from '../../ReviewCard/ReviewCard';
import MemoryCard from '../../MemoryCard/MemoryCard';
import Button from '../../../ui/Button/Button';
import './GameContent.css';

/**
 * GameContent - Reviews et Memories du jeu
 *
 * @param {Array} reviews - Liste des reviews (3 max)
 * @param {Array} memories - Liste des memories (3 max)
 * @param {String} gameId - ID RAWG du jeu (pour navigation)
 */
const GameContent = ({ reviews, memories, gameId }) => {
  const navigate = useNavigate();

  return (
    <div className="game-content">
      {/* REVIEWS */}
      <section className="game-content__section">
        <div className="game-content__header">
          <h2>Dernières critiques</h2>
          {reviews.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => navigate(`/games/${gameId}/reviews`)}
            >
              Voir toutes les critiques →
            </Button>
          )}
        </div>

        {reviews.length > 0 ? (
          <div className="game-content__grid">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <p className="game-content__empty">
            Aucune critique pour ce jeu. Soyez le premier à en écrire une !
          </p>
        )}
      </section>

      {/* SEPARATOR */}
      <div className="game-content__separator"></div>

      {/* MEMORIES */}
      <section className="game-content__section">
        <div className="game-content__header">
          <h2>Derniers souvenirs</h2>
          {memories.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => navigate(`/games/${gameId}/memories`)}
            >
              Voir tous les souvenirs →
            </Button>
          )}
        </div>

        {memories.length > 0 ? (
          <div className="game-content__grid">
            {memories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        ) : (
          <p className="game-content__empty">
            Aucun souvenir pour ce jeu. Partagez le vôtre !
          </p>
        )}
      </section>
    </div>
  );
};

export default GameContent;
