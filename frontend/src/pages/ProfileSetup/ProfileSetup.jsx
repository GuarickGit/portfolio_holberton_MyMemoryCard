import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import Textarea from '../../components/ui/Textarea/Textarea';
import ImagePreview from '../../components/ui/ImagePreview/ImagePreview';
import api from '../../services/api';
import './ProfileSetup.css';

function ProfileSetup() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bio, setBio] = useState('');

  const [previewAvatar, setPreviewAvatar] = useState('');
  const [previewBanner, setPreviewBanner] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function isValidUrl(url) {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  function handlePreviewAvatar() {
    if (isValidUrl(avatarUrl)) {
      setPreviewAvatar(avatarUrl);
      setError('');
    } else {
      setError('URL de l\'avatar invalide');
    }
  }

  function handlePreviewBanner() {
    if (isValidUrl(bannerUrl)) {
      setPreviewBanner(bannerUrl);
      setError('');
    } else {
      setError('URL de la bannière invalide');
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.put('/users/me', {
        avatar_url: previewAvatar || null,
        banner_url: previewBanner || null,
        bio: bio || null,
      });

      updateUser(response.data.user);
      navigate('/');
      alert('Profil mis à jour avec succès ! 🎉');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    navigate('/');
  }

  return (
    <div className="profile-setup">
      <div className="profile-setup-container">

        <div className="profile-setup-header">
          <h1 className="profile-setup-title">
            Complète ton profil !
          </h1>
          <p className="profile-setup-subtitle">
            Personnalise ton espace gaming
          </p>
        </div>

        <form onSubmit={handleSave} className="profile-setup-form">

          <div className="profile-setup-section">
            <h3 className="profile-setup-section-title">Bannière de profil</h3>

            <ImagePreview
              src={previewBanner}
              type="banner"
              alt="Bannière de profil"
              fallbackIcon="🖼️"
            />

            <div className="profile-setup-input-group">
              <Input
                type="text"
                placeholder="https://exemple.com/banniere.jpg"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
              />
              <button
                type="button"
                onClick={handlePreviewBanner}
                className="profile-setup-preview-btn"
              >
                Prévisualiser
              </button>
            </div>
          </div>

          <div className="profile-setup-section">
            <h3 className="profile-setup-section-title">Avatar</h3>

            <ImagePreview
              src={previewAvatar}
              type="avatar"
              alt="Avatar"
              fallbackIcon="👤"
            />

            <div className="profile-setup-input-group">
              <Input
                type="text"
                placeholder="https://exemple.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              <button
                type="button"
                onClick={handlePreviewAvatar}
                className="profile-setup-preview-btn"
              >
                Prévisualiser
              </button>
            </div>
          </div>

          <div className="profile-setup-section">
            <h3 className="profile-setup-section-title">Bio</h3>

            <Textarea
              placeholder="Parle-nous de toi, de tes jeux préférés, de ton style de jeu..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              showCounter={true}
              rows={5}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="profile-setup-actions">
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Sauvegarde...' : 'Terminer'}
            </Button>

            <button
              type="button"
              onClick={handleSkip}
              className="profile-setup-skip"
              disabled={loading}
            >
              Plus tard
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default ProfileSetup;
