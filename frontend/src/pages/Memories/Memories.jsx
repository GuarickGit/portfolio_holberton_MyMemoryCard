import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemoryCard from '../../components/features/MemoryCard/MemoryCard';
import api from '../../services/api';
import './Memories.css';

/**
 * Memories - Page listant tous les souvenirs
 * Route : /memories
 */
const Memories = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer tous les souvenirs (tri par date décroissant)
      const response = await api.get('/memories');
      setMemories(response.data.memories || []);

    } catch (err) {
      console.error('Erreur chargement memories:', err);
      setError('Impossible de charger les souvenirs.');
    } finally {
      setLoading(false);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="memories-page__loading">
        <div className="spinner"></div>
        <p>Chargement des souvenirs...</p>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="memories-page__error">
        <p>{error}</p>
        <button onClick={fetchMemories}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="memories-page">
      <div className="memories-page__container">
        {/* HEADER */}
        <div className="memories-page__header">
          <h1>Tous les souvenirs</h1>
          <p className="memories-page__count">
            {memories.length} souvenir{memories.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* SÉPARATEUR */}
        <div className="memories-page__separator"></div>

        {/* GRILLE DE SOUVENIRS */}
        {memories.length > 0 ? (
          <div className="memories-page__grid">
            {memories.map(memory => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        ) : (
          <div className="memories-page__empty">
            <p>Aucun souvenir pour le moment.</p>
            <button onClick={() => navigate('/games')}>
              Découvrir des jeux
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Memories;
