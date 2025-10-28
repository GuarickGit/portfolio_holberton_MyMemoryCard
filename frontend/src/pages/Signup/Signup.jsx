import { useState } from 'react';
import { signup } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import './Signup.css';

function Signup({ onClose, onSwitchToLogin }) {
  // États pour les champs du formulaire
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // États pour la gestion des erreurs et du chargement
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hooks
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  // Fonction de validation du formulaire
  function validateForm() {
    // Reset de l'erreur
    setError('');

    // Validation du username
    if (username.length < 3 || username.length > 20) {
      setError('Le pseudo doit contenir entre 3 et 20 caractères');
      return false;
    }

    // Vérification des espaces dans le username
    if (username.includes(' ')) {
      setError('Le pseudo ne peut pas contenir d\'espaces');
      return false;
    }

    // Validation de l'email (regex simple)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer un email valide');
      return false;
    }

    // Validation du mot de passe
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    // Vérification de la correspondance des mots de passe
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  }

  // Fonction pour gérer la soumission du formulaire
  async function handleSubmit(e) {
    e.preventDefault();

    // Validation côté client
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Appel API signup via le service
      const data = await signup(username, email, password);

      // Connexion automatique après inscription
      loginUser(data.user, data.token);

      // Ferme la popup
      onClose();

      // Redirect vers la page de setup du profil
      navigate('/profile/setup');

      // Message de bienvenue
      alert(`Bienvenue ${data.user.username} !`);

    } catch (err) {
      // Extraire le message d'erreur du backend
      const errorMessage = err.response?.data?.error
        || err.response?.data?.message
        || err.message
        || 'Une erreur est survenue';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content signup-modal" onClick={(e) => e.stopPropagation()}>

        {/* Bouton fermer */}
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Bordure dégradée */}
        <div className="modal-gradient-border"></div>

        {/* Contenu */}
        <div className="modal-inner">
          <h1 className="signup-title">
            <span className="gradient-text">Rejoins</span> MyMemoryCard
          </h1>
          <p className="signup-subtitle">Crée ta carte mémoire virtuelle</p>

          {/* Message d'erreur */}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="signup-form">
            {/* Champ Username */}
            <Input
              type="text"
              placeholder="Pseudo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            {/* Champ Email */}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Champ Mot de passe */}
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Champ Confirmation mot de passe */}
            <Input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {/* Bouton S'inscrire */}
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </Button>
          </form>

          {/* Footer */}
          <p className="signup-footer">
            Déjà un compte ? <button onClick={onSwitchToLogin} className="signup-link">Se connecter</button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Signup;
