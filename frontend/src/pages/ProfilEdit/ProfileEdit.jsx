import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button/Button';
import { User, FileText, Image } from 'lucide-react';
import api from '../../services/api';
import './ProfileEdit.css';

/**
 * ProfileEdit - Page d'édition du profil utilisateur
 * Route : /profile/edit
 *
 * Fonctionnalités :
 * - Modifier l'URL de l'avatar
 * - Modifier l'URL de la bannière
 * - Modifier le username
 * - Modifier la bio
 */
const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatar_url: '',
    banner_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirection si non connecté
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Charger les données actuelles
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        banner_url: user.banner_url || ''
      });
    }
  }, [user]);

  // Gérer les changements de champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Préparer les données à envoyer
      const profileUpdates = {};

      // Ajouter username si modifié
      if (formData.username !== user.username) {
        if (formData.username.trim().length < 3) {
          setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
          setLoading(false);
          return;
        }
        profileUpdates.username = formData.username.trim();
      }

      // Ajouter bio si modifiée
      if (formData.bio !== (user.bio || '')) {
        profileUpdates.bio = formData.bio.trim();
      }

      // Ajouter avatar_url si modifié
      if (formData.avatar_url !== (user.avatar_url || '')) {
        profileUpdates.avatar_url = formData.avatar_url.trim();
      }

      // Ajouter banner_url si modifié
      if (formData.banner_url !== (user.banner_url || '')) {
        profileUpdates.banner_url = formData.banner_url.trim();
      }

      // Vérifier qu'il y a au moins une modification
      if (Object.keys(profileUpdates).length === 0) {
        setError('Aucune modification détectée');
        setLoading(false);
        return;
      }

      // Envoyer la requête
      const response = await api.put('/users/me', profileUpdates);

      // Mettre à jour le contexte utilisateur
      updateUser(response.data.user);

      setSuccess('Profil mis à jour avec succès !');

      // Redirection après 2 secondes
      setTimeout(() => {
        navigate(`/profile/${user.id}`);
      }, 2000);

    } catch (err) {
      console.error('Erreur mise à jour profil:', err);
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-edit">
      <div className="profile-edit__container">
        {/* HEADER */}
        <div className="profile-edit__header">
          <button
            className="profile-edit__back"
            onClick={() => navigate(-1)}
          >
            ← Retour
          </button>
          <h1>Modifier le profil</h1>
        </div>

        {/* FORMULAIRE */}
        <form className="profile-edit__form" onSubmit={handleSubmit}>
          {/* AVATAR URL */}
          <div className="profile-edit__section">
            <h2>Photo de profil</h2>
            <div className="profile-edit__preview-section">
              {formData.avatar_url && (
                <div className="profile-edit__avatar-preview">
                  <img src={formData.avatar_url} alt="Avatar preview" />
                </div>
              )}
              <div className="profile-edit__input-group">
                <Image size={20} />
                <input
                  type="url"
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleChange}
                  placeholder="https://exemple.com/avatar.jpg"
                />
              </div>
            </div>
          </div>

          {/* BANNER URL */}
          <div className="profile-edit__section">
            <h2>Bannière du profil</h2>
            <div className="profile-edit__preview-section">
              {formData.banner_url && (
                <div className="profile-edit__banner-preview">
                  <img src={formData.banner_url} alt="Banner preview" />
                </div>
              )}
              <div className="profile-edit__input-group">
                <Image size={20} />
                <input
                  type="url"
                  name="banner_url"
                  value={formData.banner_url}
                  onChange={handleChange}
                  placeholder="https://exemple.com/banner.jpg"
                />
              </div>
            </div>
          </div>

          {/* USERNAME */}
          <div className="profile-edit__section">
            <h2>Nom d'utilisateur</h2>
            <div className="profile-edit__input-group">
              <User size={20} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nom d'utilisateur"
                minLength={3}
                maxLength={20}
                required
              />
            </div>
          </div>

          {/* BIO */}
          <div className="profile-edit__section">
            <h2>Biographie</h2>
            <div className="profile-edit__input-group">
              <FileText size={20} />
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Parlez-nous de vous..."
                maxLength={500}
                rows={4}
              />
            </div>
            <p className="profile-edit__char-count">
              {formData.bio.length}/500 caractères
            </p>
          </div>

          {/* MESSAGES */}
          {error && <div className="profile-edit__error">{error}</div>}
          {success && <div className="profile-edit__success">{success}</div>}

          {/* BOUTONS */}
          <div className="profile-edit__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
