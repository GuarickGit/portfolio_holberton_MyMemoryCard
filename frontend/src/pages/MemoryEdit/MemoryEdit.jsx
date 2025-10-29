import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MemoryForm from '../../components/features/MemoryForm/MemoryForm';
import api from '../../services/api';
import './MemoryEdit.css';

/**
 * MemoryEdit - Page d'édition d'un souvenir
 * Route : /memories/:id/edit
 *
 * Fonctionnalités :
 * - Charge le souvenir existant
 * - Vérifie que l'utilisateur est bien le propriétaire
 * - Affiche le formulaire pré-rempli
 * - Redirection après modification
 */
const MemoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirection si non connecté
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Charger le souvenir
  useEffect(() => {
    fetchMemory();
  }, [id]);

  const fetchMemory = async () => {
    try {
      setLoading(true);

      // Récupérer le souvenir via l'API
      const response = await api.get(`/memories/${id}`);
      const memoryData = response.data.memory;

      // Vérifier que l'utilisateur est bien le propriétaire
      if (memoryData.user_id !== user.id) {
        setError('Vous n\'êtes pas autorisé à modifier ce souvenir.');
        return;
      }

      setMemory(memoryData);

    } catch (err) {
      console.error('Erreur chargement memory:', err);
      setError('Impossible de charger le souvenir.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Callback après modification réussie
   */
  const handleMemoryUpdated = () => {
    navigate(`/memories/${id}`, {
      state: { message: 'Souvenir modifié avec succès !' }
    });
  };

  // LOADING
  if (loading) {
    return (
      <div className="memory-edit__loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  // ERROR
  if (error || !memory) {
    return (
      <div className="memory-edit__error">
        <p>{error || 'Souvenir introuvable'}</p>
        <button onClick={() => navigate(-1)}>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="memory-edit">
      <div className="memory-edit__container">
        {/* HEADER */}
        <div className="memory-edit__header">
          <button
            className="memory-edit__back"
            onClick={() => navigate(-1)}
          >
            ← Retour
          </button>

          <div className="memory-edit__game">
            <img
              src={memory.game_image}
              alt={memory.game_name}
              className="memory-edit__cover"
            />
            <div className="memory-edit__game-info">
              <h1>Modifier le souvenir</h1>
              <h2>{memory.game_name}</h2>
            </div>
          </div>
        </div>

        {/* FORMULAIRE */}
        <MemoryForm
          gameId={memory.game_id}
          initialData={{
            id: memory.id,
            title: memory.title,
            content: memory.content,
            spoiler: memory.spoiler
          }}
          onSuccess={handleMemoryUpdated}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default MemoryEdit;
