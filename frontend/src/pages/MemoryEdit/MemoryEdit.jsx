import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MemoryForm from '../../components/features/MemoryForm/MemoryForm';
import api from '../../services/api';
import './MemoryEdit.css';

/**
 * MemoryEdit - Page d'édition d'un souvenir
 * Route : /memories/:id/edit
 */
const MemoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      const response = await api.get(`/memories/${id}`);
      const memoryData = response.data.memory;

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

          {/* BOUTON SUPPRIMER - NOUVEAU */}
          <button
            className="memory-edit__delete"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </button>
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
